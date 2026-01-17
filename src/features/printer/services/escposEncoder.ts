/**
 * Encodeur ESC/POS pour imprimantes thermiques
 * Génère les commandes binaires pour l'impression
 */

import type { ReceiptData, PrinterConfig, DEFAULT_PRINTER_CONFIG } from '../types/printer.types';

// Commandes ESC/POS
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

export class ESCPOSEncoder {
  private buffer: number[] = [];
  private config: PrinterConfig;

  constructor(config: Partial<PrinterConfig> = {}) {
    this.config = { 
      chunkSize: 20,
      chunkDelay: 50,
      paperWidth: 32,
      encoding: 'utf-8',
      ...config 
    };
  }

  /**
   * Initialise l'imprimante
   */
  initialize(): this {
    this.buffer.push(ESC, 0x40); // ESC @
    return this;
  }

  /**
   * Ajoute du texte
   */
  text(content: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    this.buffer.push(...bytes);
    return this;
  }

  /**
   * Saut de ligne
   */
  newline(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(LF);
    }
    return this;
  }

  /**
   * Alignement du texte
   */
  align(alignment: 'left' | 'center' | 'right'): this {
    const alignCode = alignment === 'left' ? 0 : alignment === 'center' ? 1 : 2;
    this.buffer.push(ESC, 0x61, alignCode); // ESC a n
    return this;
  }

  /**
   * Active/désactive le gras
   */
  bold(enabled: boolean = true): this {
    this.buffer.push(ESC, 0x45, enabled ? 1 : 0); // ESC E n
    return this;
  }

  /**
   * Double hauteur
   */
  doubleHeight(enabled: boolean = true): this {
    this.buffer.push(ESC, 0x21, enabled ? 0x10 : 0x00); // ESC ! n
    return this;
  }

  /**
   * Double largeur
   */
  doubleWidth(enabled: boolean = true): this {
    this.buffer.push(GS, 0x21, enabled ? 0x10 : 0x00); // GS ! n
    return this;
  }

  /**
   * Ligne de séparation
   */
  separator(char: string = '-'): this {
    const line = char.repeat(this.config.paperWidth);
    return this.text(line).newline();
  }

  /**
   * Ligne avec libellé et valeur alignés
   */
  labelValue(label: string, value: string): this {
    const spaces = this.config.paperWidth - label.length - value.length;
    const spacer = spaces > 0 ? ' '.repeat(spaces) : ' ';
    return this.text(`${label}${spacer}${value}`).newline();
  }

  /**
   * QR Code (si supporté par l'imprimante)
   */
  qrCode(data: string, size: number = 6): this {
    // Modèle QR
    this.buffer.push(GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // Taille module
    this.buffer.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size);
    // Niveau correction
    this.buffer.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31);
    // Stockage données
    const dataBytes = new TextEncoder().encode(data);
    const len = dataBytes.length + 3;
    this.buffer.push(GS, 0x28, 0x6B, len & 0xFF, (len >> 8) & 0xFF, 0x31, 0x50, 0x30);
    this.buffer.push(...dataBytes);
    // Impression QR
    this.buffer.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
    return this;
  }

  /**
   * Coupe papier (partielle)
   */
  cut(): this {
    this.buffer.push(GS, 0x56, 0x01); // GS V 1
    return this;
  }

  /**
   * Avance papier avant coupe
   */
  feed(lines: number = 4): this {
    this.buffer.push(ESC, 0x64, lines); // ESC d n
    return this;
  }

  /**
   * Récupère le buffer encodé
   */
  encode(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Réinitialise le buffer
   */
  reset(): this {
    this.buffer = [];
    return this;
  }

  /**
   * Formate un montant en FCFA
   */
  static formatAmount(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} F`;
  }

  /**
   * Construit un reçu complet à partir des données
   */
  static buildReceipt(data: ReceiptData): Uint8Array {
    const encoder = new ESCPOSEncoder();

    encoder
      .initialize()
      // En-tête centré
      .align('center')
      .bold(true)
      .doubleHeight(true)
      .text(data.merchantName)
      .newline()
      .doubleHeight(false)
      .bold(false);

    if (data.merchantPhone) {
      encoder.text(`Tel: ${data.merchantPhone}`).newline();
    }
    if (data.marketName) {
      encoder.text(data.marketName).newline();
    }

    encoder
      .separator('=')
      .bold(true)
      .text('REÇU DE VENTE')
      .newline()
      .bold(false)
      .separator('=')
      .align('left')
      .labelValue('Réf:', data.transactionRef)
      .labelValue('Date:', data.date)
      .labelValue('Heure:', data.time)
      .separator();

    // Articles si présents
    if (data.items && data.items.length > 0) {
      data.items.forEach(item => {
        encoder
          .text(item.name)
          .newline()
          .labelValue(
            `  ${item.quantity} x ${ESCPOSEncoder.formatAmount(item.unitPrice)}`,
            ESCPOSEncoder.formatAmount(item.total)
          );
      });
      encoder.separator();
    }

    // Totaux
    if (data.subtotal !== undefined) {
      encoder.labelValue('Sous-total:', ESCPOSEncoder.formatAmount(data.subtotal));
    }
    if (data.cmuDeduction && data.cmuDeduction > 0) {
      encoder.labelValue('CMU (1%):', `-${ESCPOSEncoder.formatAmount(data.cmuDeduction)}`);
    }
    if (data.rstiDeduction && data.rstiDeduction > 0) {
      encoder.labelValue('RSTI (0.5%):', `-${ESCPOSEncoder.formatAmount(data.rstiDeduction)}`);
    }

    encoder
      .separator()
      .bold(true)
      .labelValue('TOTAL:', ESCPOSEncoder.formatAmount(data.total))
      .bold(false)
      .separator();

    // Mode de paiement
    const paymentLabels = {
      cash: 'Espèces',
      mobile_money: 'Mobile Money',
      wallet: 'Portefeuille',
    };
    encoder.labelValue('Paiement:', paymentLabels[data.paymentMethod] || data.paymentMethod);

    // QR Code si données présentes
    if (data.qrCodeData) {
      encoder
        .newline()
        .align('center')
        .qrCode(data.qrCodeData, 4);
    }

    // Pied de page
    encoder
      .newline()
      .align('center')
      .text(data.footerMessage || 'Merci de votre confiance!')
      .newline()
      .text('--- JULABA ---')
      .feed(4)
      .cut();

    return encoder.encode();
  }
}
