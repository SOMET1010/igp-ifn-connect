/**
 * Générateur de documentation PDF JÙLABA
 */

import React, { useState, useCallback } from 'react';
import { FileDown, Upload, Loader2, Check, Image, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { documentationSections } from '../../data/pagesDocumentation';
import { ScreenshotUploadState } from '../../types/documentation.types';
import { PageDocumentationCard } from './PageDocumentationCard';

export const DocumentationPDFGenerator: React.FC = () => {
  const [screenshots, setScreenshots] = useState<ScreenshotUploadState>({});
  const [selectedSections, setSelectedSections] = useState<string[]>(
    documentationSections.map(s => s.id)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUploadScreenshot = useCallback((pageId: string, base64: string) => {
    setScreenshots(prev => ({ ...prev, [pageId]: base64 }));
  }, []);

  const handleRemoveScreenshot = useCallback((pageId: string) => {
    setScreenshots(prev => {
      const newState = { ...prev };
      delete newState[pageId];
      return newState;
    });
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const totalPages = documentationSections.reduce((acc, s) => acc + s.pages.length, 0);
  const screenshotCount = Object.keys(screenshots).length;

  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      // Couleurs
      const primaryColor: [number, number, number] = [255, 107, 53]; // Orange JÙLABA
      const textColor: [number, number, number] = [30, 30, 30];
      const mutedColor: [number, number, number] = [100, 100, 100];

      // =====================
      // PAGE DE GARDE
      // =====================
      pdf.setFillColor(255, 107, 53);
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('JÙLABA', pageWidth / 2, 35, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Programme National d\'Appui aux Vendeurs Informels', pageWidth / 2, 48, { align: 'center' });

      pdf.setTextColor(...textColor);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Documentation Fonctionnelle', pageWidth / 2, 90, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mutedColor);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}`, pageWidth / 2, 105, { align: 'center' });

      // Statistiques
      pdf.setFontSize(10);
      const stats = [
        `${totalPages} pages documentées`,
        `${screenshotCount} captures d'écran incluses`,
        `${selectedSections.length} sections sélectionnées`,
      ];
      stats.forEach((stat, i) => {
        pdf.text(stat, pageWidth / 2, 130 + i * 8, { align: 'center' });
      });

      // Logos en bas
      pdf.setFontSize(10);
      pdf.text('Direction Générale des Entreprises - ANSUT', pageWidth / 2, pageHeight - 30, { align: 'center' });
      pdf.text('République de Côte d\'Ivoire', pageWidth / 2, pageHeight - 22, { align: 'center' });

      setProgress(10);

      // =====================
      // TABLE DES MATIÈRES
      // =====================
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.text('Table des Matières', margin, 25);

      let tocY = 40;
      let pageNumber = 3;

      const filteredSections = documentationSections.filter(s => selectedSections.includes(s.id));
      
      filteredSections.forEach((section) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...textColor);
        pdf.text(`${section.icon} ${section.title}`, margin, tocY);
        pdf.text(String(pageNumber), pageWidth - margin, tocY, { align: 'right' });
        tocY += 8;

        section.pages.forEach((page) => {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...mutedColor);
          pdf.text(`    ${page.name}`, margin, tocY);
          tocY += 6;
          pageNumber++;
        });

        tocY += 4;
      });

      setProgress(20);

      // =====================
      // SECTIONS ET PAGES
      // =====================
      let currentProgress = 20;
      const progressPerSection = 70 / filteredSections.length;

      for (const section of filteredSections) {
        // En-tête de section
        pdf.addPage();
        
        // Bannière colorée
        const [r, g, b] = section.color.match(/\w\w/g)!.map(x => parseInt(x, 16));
        pdf.setFillColor(r, g, b);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${section.icon} ${section.title}`, margin, 28);

        pdf.setTextColor(...mutedColor);
        pdf.setFontSize(10);
        pdf.text(`${section.pages.length} pages`, margin, 50);

        // Pages de la section
        for (const page of section.pages) {
          pdf.addPage();
          let yPos = margin;

          // Titre de la page
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(r, g, b);
          pdf.text(page.name, margin, yPos + 10);
          yPos += 18;

          // Route
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...mutedColor);
          pdf.text(`Route: ${page.route}`, margin, yPos);
          yPos += 10;

          // Description
          pdf.setFontSize(11);
          pdf.setTextColor(...textColor);
          const descLines = pdf.splitTextToSize(page.description, contentWidth);
          pdf.text(descLines, margin, yPos);
          yPos += descLines.length * 6 + 8;

          // Fonctionnalités
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(r, g, b);
          pdf.text('Fonctionnalités', margin, yPos);
          yPos += 7;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...textColor);
          page.features.forEach((feature) => {
            const featureLines = pdf.splitTextToSize(`• ${feature}`, contentWidth - 5);
            if (yPos + featureLines.length * 5 > pageHeight - 40) {
              pdf.addPage();
              yPos = margin;
            }
            pdf.text(featureLines, margin + 3, yPos);
            yPos += featureLines.length * 5 + 2;
          });

          yPos += 5;

          // Accessibilité
          if (page.accessibility.length > 0) {
            if (yPos > pageHeight - 50) {
              pdf.addPage();
              yPos = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(34, 197, 94); // Vert
            pdf.text('Accessibilité', margin, yPos);
            yPos += 7;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(...textColor);
            page.accessibility.forEach((item) => {
              pdf.text(`✓ ${item}`, margin + 3, yPos);
              yPos += 6;
            });
          }

          yPos += 10;

          // Capture d'écran
          const screenshot = screenshots[page.id];
          if (screenshot) {
            if (yPos > pageHeight - 80) {
              pdf.addPage();
              yPos = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(r, g, b);
            pdf.text('Capture d\'écran', margin, yPos);
            yPos += 8;

            try {
              // Calculer les dimensions de l'image
              const imgWidth = contentWidth;
              const imgHeight = 80; // Hauteur max
              pdf.addImage(screenshot, 'JPEG', margin, yPos, imgWidth, imgHeight, undefined, 'MEDIUM');
            } catch (e) {
              pdf.setFontSize(10);
              pdf.setTextColor(...mutedColor);
              pdf.text('[Erreur lors de l\'ajout de l\'image]', margin, yPos + 10);
            }
          }

          // Pied de page
          pdf.setFontSize(8);
          pdf.setTextColor(...mutedColor);
          pdf.text('JÙLABA - Documentation Fonctionnelle', margin, pageHeight - 10);
          pdf.text(
            `Page ${pdf.internal.pages.length - 1}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
          );
        }

        currentProgress += progressPerSection;
        setProgress(Math.min(90, currentProgress));
      }

      setProgress(95);

      // Téléchargement
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`JULABA-Documentation-${date}.pdf`);

      setProgress(100);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
    }
  }, [screenshots, selectedSections, totalPages, screenshotCount]);

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générateur de Documentation PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <FileText className="h-4 w-4 mr-2" />
              {totalPages} pages
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <Image className="h-4 w-4 mr-2" />
              {screenshotCount} captures
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <Check className="h-4 w-4 mr-2" />
              {selectedSections.length} sections
            </Badge>
          </div>

          {/* Sélection des sections */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Sections à inclure</h3>
            <div className="flex flex-wrap gap-3">
              {documentationSections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <span className="text-sm">
                    {section.icon} {section.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Barre de progression */}
          {isGenerating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Génération en cours...</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Bouton de génération */}
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || selectedSections.length === 0}
            className="w-full sm:w-auto"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5 mr-2" />
                Générer le PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sections avec pages */}
      <Accordion type="multiple" defaultValue={documentationSections.map(s => s.id)}>
        {documentationSections.map((section) => {
          const sectionScreenshots = section.pages.filter(p => screenshots[p.id]).length;
          
          return (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: section.bgColor }}
                  >
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{section.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {section.pages.length} pages · {sectionScreenshots} captures
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {section.pages.map((page) => (
                    <PageDocumentationCard
                      key={page.id}
                      page={page}
                      screenshot={screenshots[page.id]}
                      onUploadScreenshot={handleUploadScreenshot}
                      onRemoveScreenshot={handleRemoveScreenshot}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
