/**
 * Service de gestion de l'imprimante Bluetooth
 * Utilise l'API Web Bluetooth pour la connexion
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { 
  PrinterDevice, 
  PrinterConnectionStatus, 
  PrinterConfig,
  PrinterEventCallback,
  PrinterEvent,
  ReceiptData 
} from '../types/printer.types';
import { 
  DEFAULT_PRINTER_CONFIG, 
  PRINTER_SERVICE_UUID, 
  PRINTER_CHARACTERISTIC_UUID 
} from '../types/printer.types';
import { ESCPOSEncoder } from './escposEncoder';

const STORAGE_KEY = 'julaba_printer_device';

class PrinterService {
  private device: any = null;
  private characteristic: any = null;
  private config: PrinterConfig = DEFAULT_PRINTER_CONFIG;
  private status: PrinterConnectionStatus = 'disconnected';
  private listeners: Set<PrinterEventCallback> = new Set();

  /**
   * Vérifie si Web Bluetooth est supporté
   */
  isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Récupère le statut actuel
   */
  getStatus(): PrinterConnectionStatus {
    return this.status;
  }

  /**
   * Récupère les infos de l'appareil connecté
   */
  getDevice(): PrinterDevice | null {
    if (!this.device) return null;
    return {
      id: this.device.id,
      name: this.device.name || 'Imprimante',
      connected: this.status === 'connected',
    };
  }

  /**
   * S'abonne aux événements
   */
  subscribe(callback: PrinterEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Émet un événement
   */
  private emit(type: PrinterEvent['type'], data?: unknown): void {
    const event: PrinterEvent = { type, data, timestamp: Date.now() };
    this.listeners.forEach(cb => cb(event));
  }

  /**
   * Met à jour le statut
   */
  private setStatus(status: PrinterConnectionStatus): void {
    this.status = status;
    if (status === 'connected') {
      this.emit('connected', this.getDevice());
    } else if (status === 'disconnected') {
      this.emit('disconnected');
    } else if (status === 'error') {
      this.emit('error');
    }
  }

  /**
   * Sauvegarde le dernier appareil
   */
  private saveDevice(device: any): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: device.id,
        name: device.name,
        lastConnected: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('[Printer] Impossible de sauvegarder l\'appareil:', e);
    }
  }

  /**
   * Récupère le dernier appareil sauvegardé
   */
  getSavedDevice(): PrinterDevice | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[Printer] Impossible de récupérer l\'appareil:', e);
    }
    return null;
  }

  /**
   * Demande la connexion à une imprimante
   */
  async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('[Printer] Web Bluetooth non supporté');
      this.setStatus('error');
      return false;
    }

    try {
      this.setStatus('connecting');

      // Demande de sélection d'appareil
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [PRINTER_SERVICE_UUID] },
          { namePrefix: 'Printer' },
          { namePrefix: 'PT-' },
          { namePrefix: 'RPP' },
          { namePrefix: 'ZJ-' },
          { namePrefix: 'MUNBYN' },
        ],
        optionalServices: [PRINTER_SERVICE_UUID, '49535343-fe7d-4ae5-8fa9-9fafd205e455'],
      });

      if (!this.device) {
        this.setStatus('disconnected');
        return false;
      }

      // Écoute de la déconnexion
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('[Printer] Déconnecté');
        this.setStatus('disconnected');
        this.characteristic = null;
      });

      // Connexion GATT
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Impossible de se connecter au serveur GATT');
      }

      // Récupération du service et de la caractéristique
      let service: any;
      try {
        service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
      } catch {
        // Essai avec UUID alternatif
        service = await server.getPrimaryService('49535343-fe7d-4ae5-8fa9-9fafd205e455');
      }

      // Recherche de la caractéristique d'écriture
      const characteristics = await service.getCharacteristics();
      this.characteristic = characteristics.find(c => 
        c.properties.write || c.properties.writeWithoutResponse
      ) || null;

      if (!this.characteristic) {
        throw new Error('Caractéristique d\'écriture non trouvée');
      }

      this.saveDevice(this.device);
      this.setStatus('connected');
      console.log('[Printer] Connecté:', this.device.name);
      return true;

    } catch (error) {
      console.error('[Printer] Erreur de connexion:', error);
      this.setStatus('error');
      return false;
    }
  }

  /**
   * Déconnecte l'imprimante
   */
  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.setStatus('disconnected');
  }

  /**
   * Envoie des données à l'imprimante par chunks
   */
  private async sendData(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Imprimante non connectée');
    }

    const { chunkSize, chunkDelay } = this.config;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }

      // Délai entre les chunks
      if (i + chunkSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, chunkDelay));
      }
    }
  }

  /**
   * Imprime un reçu
   */
  async printReceipt(data: ReceiptData): Promise<boolean> {
    if (this.status !== 'connected' || !this.characteristic) {
      console.error('[Printer] Non connecté');
      return false;
    }

    try {
      this.emit('printing');
      
      const receiptData = ESCPOSEncoder.buildReceipt(data);
      await this.sendData(receiptData);
      
      this.emit('printed', data);
      console.log('[Printer] Reçu imprimé:', data.transactionRef);
      return true;

    } catch (error) {
      console.error('[Printer] Erreur d\'impression:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Imprime un texte de test
   */
  async printTest(): Promise<boolean> {
    if (this.status !== 'connected') {
      return false;
    }

    const encoder = new ESCPOSEncoder();
    const testData = encoder
      .initialize()
      .align('center')
      .bold(true)
      .text('=== TEST JULABA ===')
      .newline(2)
      .bold(false)
      .text('Imprimante connectée!')
      .newline()
      .text(new Date().toLocaleString('fr-FR'))
      .feed(4)
      .cut()
      .encode();

    try {
      await this.sendData(testData);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton
export const printerService = new PrinterService();
