/**
 * Utilitaires pour l'export PDF de factures et rapports
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from '@/components/merchant/FNEInvoice';

/**
 * Exporte une facture FNE en PDF
 */
export async function exportInvoiceToPDF(invoice: InvoiceData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header avec drapeau CI
  doc.setFillColor(0, 121, 64); // Vert CI
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE NORMALISÉE ÉLECTRONIQUE', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('République de Côte d\'Ivoire - DGI', pageWidth / 2, 22, { align: 'center' });
  doc.text(`N° ${invoice.invoiceNumber}`, pageWidth / 2, 29, { align: 'center' });

  // Reset color
  doc.setTextColor(0, 0, 0);
  
  let yPos = 45;

  // Seller Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDEUR', 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  yPos += 7;
  doc.text(invoice.merchantName, 15, yPos);
  yPos += 5;
  doc.text(`Tél: ${invoice.merchantPhone}`, 15, yPos);
  
  if (invoice.merchantNcc) {
    yPos += 5;
    doc.text(`NCC: ${invoice.merchantNcc}`, 15, yPos);
  }
  
  if (invoice.fiscalRegime) {
    yPos += 5;
    doc.text(`Régime: ${invoice.fiscalRegime}`, 15, yPos);
  }

  // Date on the right
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', pageWidth - 60, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }), pageWidth - 60, 52);
  doc.text(invoice.date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }), pageWidth - 60, 59);

  yPos += 15;

  // Customer Info if provided
  if (invoice.customerName || invoice.customerPhone) {
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT', 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    
    if (invoice.customerName) {
      doc.text(invoice.customerName, 15, yPos);
      yPos += 5;
    }
    if (invoice.customerPhone) {
      doc.text(`Tél: ${invoice.customerPhone}`, 15, yPos);
      yPos += 5;
    }
    if (invoice.customerNcc) {
      doc.text(`NCC: ${invoice.customerNcc}`, 15, yPos);
      yPos += 5;
    }
    yPos += 10;
  }

  // Invoice details table
  yPos += 5;
  autoTable(doc, {
    startY: yPos,
    head: [['Désignation', 'Montant']],
    body: [
      [invoice.description, `${invoice.amountHt.toLocaleString('fr-FR')} FCFA`],
    ],
    foot: [
      ['Montant HT', `${invoice.amountHt.toLocaleString('fr-FR')} FCFA`],
      [`TVA (${invoice.tvaRate}%)`, `${invoice.tvaAmount.toLocaleString('fr-FR')} FCFA`],
      ['TOTAL TTC', `${invoice.amountTtc.toLocaleString('fr-FR')} FCFA`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 121, 64], textColor: 255 },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 50, halign: 'right' },
    },
  });

  // Get final Y after table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

  // Security hash
  if (invoice.securityHash) {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, finalY + 10, pageWidth - 30, 20, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Hash de sécurité:', 20, finalY + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.securityHash, 60, finalY + 18);
    
    if (invoice.verificationUrl) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Vérification: ${invoice.verificationUrl}`, 20, finalY + 25);
      doc.setTextColor(0, 0, 0);
    }
  }

  // Footer
  const footerY = finalY + 45;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Facture certifiée conforme au format FNE - DGI Côte d\'Ivoire', pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text('Document à conserver pendant 10 ans - Réf: Ordonnance n°2021-593 du 15 septembre 2021', pageWidth / 2, footerY + 12, { align: 'center' });
  doc.text('Plateforme IFN - Direction Générale des Impôts', pageWidth / 2, footerY + 17, { align: 'center' });

  // Download
  doc.save(`facture-${invoice.invoiceNumber}.pdf`);
}

/**
 * Interface pour les données de transaction pour le rapport
 */
interface TransactionReport {
  reference: string;
  date: string;
  amount: number;
  paymentMethod: string;
  cmuDeduction: number;
  rstiDeduction: number;
}

/**
 * Exporte un rapport de ventes en PDF
 */
export async function exportSalesReportToPDF(
  merchantName: string,
  period: { start: Date; end: Date },
  transactions: TransactionReport[],
  summary: {
    totalSales: number;
    totalTransactions: number;
    totalCmuDeductions: number;
    totalRstiDeductions: number;
    netAmount: number;
  }
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(0, 121, 64);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT DE VENTES', pageWidth / 2, 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(merchantName, pageWidth / 2, 20, { align: 'center' });
  doc.text(`Période: ${period.start.toLocaleDateString('fr-FR')} - ${period.end.toLocaleDateString('fr-FR')}`, pageWidth / 2, 26, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let yPos = 40;

  // Summary cards
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ', 15, yPos);
  
  yPos += 10;
  
  // Summary table
  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Nombre de transactions', summary.totalTransactions.toString()],
      ['Chiffre d\'affaires brut', `${summary.totalSales.toLocaleString('fr-FR')} FCFA`],
      ['Prélèvements CMU', `${summary.totalCmuDeductions.toLocaleString('fr-FR')} FCFA`],
      ['Prélèvements RSTI', `${summary.totalRstiDeductions.toLocaleString('fr-FR')} FCFA`],
      ['Montant net', `${summary.netAmount.toLocaleString('fr-FR')} FCFA`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 121, 64], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
  });

  const summaryFinalY = (doc as any).lastAutoTable.finalY || yPos + 60;

  // Transactions list
  if (transactions.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES TRANSACTIONS', 15, summaryFinalY + 15);

    const paymentLabels: Record<string, string> = {
      'cash': 'Espèces',
      'mobile_money': 'Mobile Money',
      'transfer': 'Virement',
    };

    autoTable(doc, {
      startY: summaryFinalY + 20,
      head: [['Date', 'Référence', 'Mode', 'Montant', 'CMU', 'RSTI', 'Net']],
      body: transactions.map(t => [
        t.date,
        t.reference.substring(0, 12) + '...',
        paymentLabels[t.paymentMethod] || t.paymentMethod,
        `${t.amount.toLocaleString('fr-FR')}`,
        `${t.cmuDeduction.toLocaleString('fr-FR')}`,
        `${t.rstiDeduction.toLocaleString('fr-FR')}`,
        `${(t.amount - t.cmuDeduction - t.rstiDeduction).toLocaleString('fr-FR')}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [0, 121, 64], textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 20 },
        5: { halign: 'right', cellWidth: 20 },
        6: { halign: 'right', cellWidth: 25, fontStyle: 'bold' },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} - Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'Plateforme IFN - DGI Côte d\'Ivoire',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Download
  const filename = `rapport-ventes-${period.start.toISOString().split('T')[0]}-${period.end.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
