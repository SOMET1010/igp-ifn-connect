/**
 * Bouton d'export PDF des membres
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CooperativeMember, MemberStats } from '../../types/member.types';

interface ExportMembersPDFProps {
  members: CooperativeMember[];
  stats: MemberStats;
  cooperativeName: string;
}

export const ExportMembersPDF: React.FC<ExportMembersPDFProps> = ({
  members,
  stats,
  cooperativeName,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (members.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Titre
      doc.setFontSize(18);
      doc.text(`Liste des membres - ${cooperativeName}`, pageWidth / 2, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(10);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: 'center' });
      
      // Statistiques
      doc.setFontSize(12);
      doc.text('Résumé:', 14, 40);
      doc.setFontSize(10);
      doc.text(`• Total membres: ${stats.total}`, 20, 48);
      doc.text(`• Affiliés CMU: ${stats.withCMU} (${stats.total > 0 ? Math.round((stats.withCMU / stats.total) * 100) : 0}%)`, 20, 54);
      doc.text(`• Affiliés CNPS: ${stats.withCNPS} (${stats.total > 0 ? Math.round((stats.withCNPS / stats.total) * 100) : 0}%)`, 20, 60);
      doc.text(`• Affiliés aux deux: ${stats.withBoth}`, 20, 66);
      
      // Tableau des membres
      const tableData = members.map((member, index) => [
        index + 1,
        member.full_name,
        member.phone || '-',
        member.cmu_status || 'Non',
        member.cnps_status || 'Non',
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [['#', 'Nom complet', 'Téléphone', 'CMU', 'CNPS']],
        body: tableData,
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
        },
      });
      
      // Pied de page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Télécharger
      const fileName = `membres_${cooperativeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || members.length === 0}
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? 'Export...' : 'Export PDF'}
    </Button>
  );
};
