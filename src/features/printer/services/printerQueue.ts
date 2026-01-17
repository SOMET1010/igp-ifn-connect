/**
 * Queue d'impression offline
 * Stocke les jobs d'impression quand l'imprimante n'est pas disponible
 */

import type { PrintJob, ReceiptData } from '../types/printer.types';
import { printerService } from './printerService';

const QUEUE_KEY = 'julaba_print_queue';
const MAX_RETRIES = 3;

class PrinterQueue {
  private processing = false;
  private listeners: Set<(count: number) => void> = new Set();

  /**
   * S'abonne aux changements de la queue
   */
  subscribe(callback: (count: number) => void): () => void {
    this.listeners.add(callback);
    callback(this.getCount());
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifie les listeners
   */
  private notify(): void {
    const count = this.getCount();
    this.listeners.forEach(cb => cb(count));
  }

  /**
   * Récupère la queue
   */
  private getQueue(): PrintJob[] {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Sauvegarde la queue
   */
  private saveQueue(queue: PrintJob[]): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      this.notify();
    } catch (e) {
      console.error('[PrintQueue] Erreur sauvegarde:', e);
    }
  }

  /**
   * Ajoute un job à la queue
   */
  enqueue(receiptData: ReceiptData): string {
    const job: PrintJob = {
      id: `print_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      receiptData,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    const queue = this.getQueue();
    queue.push(job);
    this.saveQueue(queue);

    console.log('[PrintQueue] Job ajouté:', job.id);
    return job.id;
  }

  /**
   * Retire un job de la queue
   */
  dequeue(jobId: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter(j => j.id !== jobId);
    this.saveQueue(filtered);
  }

  /**
   * Met à jour un job (pour les retries)
   */
  updateJob(jobId: string, updates: Partial<PrintJob>): void {
    const queue = this.getQueue();
    const index = queue.findIndex(j => j.id === jobId);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      this.saveQueue(queue);
    }
  }

  /**
   * Récupère le nombre de jobs en attente
   */
  getCount(): number {
    return this.getQueue().length;
  }

  /**
   * Récupère tous les jobs
   */
  getJobs(): PrintJob[] {
    return this.getQueue();
  }

  /**
   * Vide la queue
   */
  clear(): void {
    this.saveQueue([]);
  }

  /**
   * Traite la queue
   */
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.processing) {
      return { success: 0, failed: 0 };
    }

    if (printerService.getStatus() !== 'connected') {
      console.log('[PrintQueue] Imprimante non connectée, traitement reporté');
      return { success: 0, failed: 0 };
    }

    this.processing = true;
    let success = 0;
    let failed = 0;

    const queue = this.getQueue();
    console.log(`[PrintQueue] Traitement de ${queue.length} jobs`);

    for (const job of queue) {
      if (job.retryCount >= MAX_RETRIES) {
        console.log(`[PrintQueue] Job ${job.id} max retries atteint, suppression`);
        this.dequeue(job.id);
        failed++;
        continue;
      }

      try {
        const printed = await printerService.printReceipt(job.receiptData);
        
        if (printed) {
          this.dequeue(job.id);
          success++;
          console.log(`[PrintQueue] Job ${job.id} imprimé`);
        } else {
          this.updateJob(job.id, {
            retryCount: job.retryCount + 1,
            lastError: 'Échec impression',
          });
          failed++;
        }

        // Petit délai entre les impressions
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        this.updateJob(job.id, {
          retryCount: job.retryCount + 1,
          lastError: error instanceof Error ? error.message : 'Erreur inconnue',
        });
        failed++;
      }
    }

    this.processing = false;
    console.log(`[PrintQueue] Terminé: ${success} succès, ${failed} échecs`);
    return { success, failed };
  }

  /**
   * Configure le traitement auto quand l'imprimante se connecte
   */
  setupAutoProcess(): () => void {
    return printerService.subscribe((event) => {
      if (event.type === 'connected') {
        console.log('[PrintQueue] Imprimante connectée, traitement queue...');
        this.processQueue();
      }
    });
  }
}

// Singleton
export const printerQueue = new PrinterQueue();
