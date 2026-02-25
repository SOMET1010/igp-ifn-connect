/**
 * Export PDF des coopératives vivriers
 */

import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CooperativeData {
  id: string;
  name: string;
  region: string | null;
  commune: string | null;
  effectif_total: number | null;
  effectif_cmu: number | null;
  effectif_cnps: number | null;
  phone: string | null;
}

interface ExportCooperativesPDFProps {
  cooperatives: CooperativeData[];
  stats: {
    total: number;
    members: number;
    cmu: number;
    cnps: number;
  };
}

export const ExportCooperativesPDF: React.FC<ExportCooperativesPDFProps> = ({
  cooperatives,
  stats,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Titre
      doc.setFontSize(18);
      doc.setTextColor(34, 139, 34); // Vert
      doc.text('Coopératives Vivriers - JÙLABA', pageWidth / 2, 20, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });

      // Statistiques
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Résumé:', 14, 40);
      
      doc.setFontSize(10);
      const statsY = 48;
      doc.text(`• Total coopératives: ${stats.total}`, 20, statsY);
      doc.text(`• Total producteurs: ${stats.members.toLocaleString('fr-FR')}`, 20, statsY + 6);
      doc.text(`• Affiliés CMU: ${stats.cmu.toLocaleString('fr-FR')}`, 20, statsY + 12);
      doc.text(`• Affiliés CNPS: ${stats.cnps.toLocaleString('fr-FR')}`, 20, statsY + 18);

      // Tableau des coopératives
      autoTable(doc, {
        startY: 75,
        head: [['Nom', 'Région', 'Commune', 'Membres', 'CMU', 'CNPS', 'Téléphone']],
        body: cooperatives.map(coop => [
          coop.name,
          coop.region || '-',
          coop.commune || '-',
          (coop.effectif_total || 0).toString(),
          (coop.effectif_cmu || 0).toString(),
          (coop.effectif_cnps || 0).toString(),
          coop.phone || '-',
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 50 },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
        },
      });

      // Pied de page
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save('cooperatives-vivriers.pdf');
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || cooperatives.length === 0}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {isExporting ? 'Export...' : 'Export PDF'}
    </Button>
  );
};
