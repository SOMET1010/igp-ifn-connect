import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Shield, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FISCAL_REGIME_LABELS } from "@/features/merchant/utils/invoiceUtils";
import { exportInvoiceToPDF } from "@/features/merchant/utils/pdfExport";

export interface InvoiceData {
  invoiceNumber: string;
  merchantName: string;
  merchantPhone: string;
  merchantNcc?: string;
  merchantAddress?: string;
  fiscalRegime?: string;
  customerName?: string;
  customerPhone?: string;
  customerNcc?: string;
  amountHt: number;
  tvaRate: number;
  tvaAmount: number;
  amountTtc: number;
  description: string;
  date: Date;
  transactionRef?: string;
  securityHash?: string;
  verificationUrl?: string;
}

interface FNEInvoiceProps {
  invoice: InvoiceData;
  onClose?: () => void;
}

export function FNEInvoice({ invoice, onClose }: FNEInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Enhanced QR data with verification URL
  const qrData = invoice.verificationUrl || JSON.stringify({
    inv: invoice.invoiceNumber,
    amt: invoice.amountTtc,
    date: invoice.date.toISOString(),
    seller: invoice.merchantNcc || invoice.merchantName,
    hash: invoice.securityHash,
    platform: "IFN-DGI-CI",
  });

  const fiscalRegimeLabel = invoice.fiscalRegime 
    ? FISCAL_REGIME_LABELS[invoice.fiscalRegime] || invoice.fiscalRegime
    : null;

  const handleDownloadPNG = async () => {
    if (!invoiceRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `facture-${invoice.invoiceNumber}.png`;
        link.click();

        URL.revokeObjectURL(url);
        toast.success("Facture téléchargée !");
      }, "image/png");
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      toast.error("Impossible de télécharger la facture");
    }
  };

  const handleShare = async () => {
    const shareText = `
📄 FACTURE NORMALISÉE ÉLECTRONIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━
N° ${invoice.invoiceNumber}
Date: ${invoice.date.toLocaleDateString("fr-FR")}
${invoice.securityHash ? `Hash: ${invoice.securityHash}` : ""}

VENDEUR: ${invoice.merchantName}
${invoice.merchantNcc ? `NCC: ${invoice.merchantNcc}` : ""}
${fiscalRegimeLabel ? `Régime: ${fiscalRegimeLabel}` : ""}

${invoice.customerName ? `CLIENT: ${invoice.customerName}` : ""}

Désignation: ${invoice.description}
Montant HT: ${invoice.amountHt.toLocaleString()} FCFA
TVA (${invoice.tvaRate}%): ${invoice.tvaAmount.toLocaleString()} FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL TTC: ${invoice.amountTtc.toLocaleString()} FCFA

📱 Généré via IFN - DGI Côte d'Ivoire
⚖️ Ord. 2021-593 du 15/09/2021
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Facture ${invoice.invoiceNumber}`,
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard.writeText(shareText);
          toast.success("Facture copiée dans le presse-papier");
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Facture copiée dans le presse-papier");
    }
  };

  return (
    <div className="space-y-4">
      <Card ref={invoiceRef} className="border-2 border-primary overflow-hidden bg-white">
        {/* Official DGI Header with Badge */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🇨🇮</span>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider">
                    Facture Normalisée
                  </h3>
                  <p className="text-primary-foreground/80 text-xs">
                    République de Côte d'Ivoire
                  </p>
                </div>
              </div>
              <p className="text-primary-foreground/80 text-sm mt-1">
                DGI - Direction Générale des Impôts
              </p>
            </div>
            
            {/* FNE Badge */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/30">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold text-sm">FNE</span>
              </div>
              <p className="text-[10px] opacity-80">Format Conforme</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-5 text-foreground">
          {/* Seller Info with Fiscal Regime */}
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Vendeur
              </p>
              {fiscalRegimeLabel && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {invoice.fiscalRegime}
                </span>
              )}
            </div>
            <p className="font-bold text-lg">{invoice.merchantName}</p>
            {invoice.merchantNcc && (
              <p className="text-sm text-muted-foreground">
                NCC: {invoice.merchantNcc}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Tél: {invoice.merchantPhone}
            </p>
            {fiscalRegimeLabel && (
              <p className="text-xs text-muted-foreground mt-1">
                {fiscalRegimeLabel}
              </p>
            )}
            {invoice.merchantAddress && (
              <p className="text-sm text-muted-foreground">
                {invoice.merchantAddress}
              </p>
            )}
          </div>

          {/* Customer Info (if provided) */}
          {(invoice.customerName || invoice.customerPhone) && (
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Client
              </p>
              {invoice.customerName && (
                <p className="font-medium">{invoice.customerName}</p>
              )}
              {invoice.customerNcc && (
                <p className="text-sm text-muted-foreground">
                  NCC: {invoice.customerNcc}
                </p>
              )}
              {invoice.customerPhone && (
                <p className="text-sm text-muted-foreground">
                  Tél: {invoice.customerPhone}
                </p>
              )}
            </div>
          )}

          {/* Invoice Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
              <span className="text-muted-foreground">Désignation</span>
              <span className="font-medium text-right max-w-[60%]">
                {invoice.description}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
              <span className="text-muted-foreground">Montant HT</span>
              <span className="font-medium">
                {invoice.amountHt.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
              <span className="text-muted-foreground">
                TVA ({invoice.tvaRate}%)
              </span>
              <span className="font-medium">
                {invoice.tvaAmount.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3 -mx-3">
              <span className="font-bold text-lg">TOTAL TTC</span>
              <span className="font-bold text-xl text-primary">
                {invoice.amountTtc.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* QR Code with Security Hash */}
          <div className="flex flex-col items-center pt-4 space-y-3">
            <div className="p-3 bg-white rounded-xl border border-border shadow-sm">
              <QRCodeSVG
                value={qrData}
                size={100}
                level="M"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            
            {/* Security Hash Display */}
            {invoice.securityHash && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" />
                <span className="font-mono">{invoice.securityHash}</span>
              </div>
            )}
          </div>

          {/* Invoice Number & Date */}
          <div className="bg-muted/50 rounded-xl p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              N° Facture
            </p>
            <p className="font-mono text-lg font-bold">{invoice.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">
              {invoice.date.toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {invoice.transactionRef && (
              <p className="text-xs text-muted-foreground">
                Réf. transaction: {invoice.transactionRef}
              </p>
            )}
          </div>

          {/* Legal Mentions Footer */}
          <div className="text-center pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Facture certifiée conforme au format FNE</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Document à conserver pendant 10 ans conformément à la législation fiscale
            </p>
            <p className="text-[10px] text-muted-foreground">
              Réf: Ordonnance n°2021-593 du 15 septembre 2021
            </p>
            <div className="flex items-center justify-center gap-1 pt-1">
              <span className="text-[10px] text-muted-foreground">
                📱 Plateforme IFN - DGI Côte d'Ivoire
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-14 rounded-xl text-lg"
          onClick={async () => {
            setIsExportingPDF(true);
            try {
              await exportInvoiceToPDF(invoice);
              toast.success("Facture PDF téléchargée !");
            } catch (error) {
              console.error("Erreur export PDF:", error);
              toast.error("Impossible de créer le PDF");
            } finally {
              setIsExportingPDF(false);
            }
          }}
          disabled={isExportingPDF}
        >
          {isExportingPDF ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <FileDown className="w-5 h-5 mr-2" />
          )}
          Télécharger PDF
        </Button>

        <Button
          variant="outline"
          className="w-full h-14 rounded-xl text-lg"
          onClick={handleDownloadPNG}
        >
          <Download className="w-5 h-5 mr-2" />
          Télécharger Image
        </Button>

        <Button
          variant="outline"
          className="w-full h-14 rounded-xl text-lg"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Partager
        </Button>

        {onClose && (
          <Button
            variant="ghost"
            className="w-full h-12 rounded-xl text-muted-foreground"
            onClick={onClose}
          >
            Fermer
          </Button>
        )}
      </div>
    </div>
  );
}
