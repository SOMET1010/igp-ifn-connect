import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export interface InvoiceData {
  invoiceNumber: string;
  merchantName: string;
  merchantPhone: string;
  merchantNcc?: string;
  merchantAddress?: string;
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
}

interface FNEInvoiceProps {
  invoice: InvoiceData;
  onClose?: () => void;
}

export function FNEInvoice({ invoice, onClose }: FNEInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    inv: invoice.invoiceNumber,
    amt: invoice.amountTtc,
    date: invoice.date.toISOString(),
    seller: invoice.merchantNcc || invoice.merchantName,
    platform: "IFN-DGI",
  });

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

VENDEUR: ${invoice.merchantName}
${invoice.merchantNcc ? `NCC: ${invoice.merchantNcc}` : ""}

${invoice.customerName ? `CLIENT: ${invoice.customerName}` : ""}

Désignation: ${invoice.description}
Montant HT: ${invoice.amountHt.toLocaleString()} FCFA
TVA (${invoice.tvaRate}%): ${invoice.tvaAmount.toLocaleString()} FCFA
━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL TTC: ${invoice.amountTtc.toLocaleString()} FCFA

📱 Généré via IFN - DGI Côte d'Ivoire
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
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">📄</span>
            <h3 className="text-lg font-bold uppercase tracking-wider">
              Facture Normalisée Électronique
            </h3>
          </div>
          <p className="text-primary-foreground/80 text-sm">
            DGI - Direction Générale des Impôts
          </p>
        </div>

        <CardContent className="p-6 space-y-5 text-foreground">
          {/* Seller Info */}
          <div className="border-b border-border pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Vendeur
            </p>
            <p className="font-bold text-lg">{invoice.merchantName}</p>
            {invoice.merchantNcc && (
              <p className="text-sm text-muted-foreground">
                NCC: {invoice.merchantNcc}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Tél: {invoice.merchantPhone}
            </p>
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

          {/* QR Code */}
          <div className="flex justify-center pt-4">
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

          {/* Footer */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              📱 Facture générée via la plateforme IFN
            </p>
            <p className="text-xs text-muted-foreground">
              Direction Générale des Impôts - Côte d'Ivoire
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-14 rounded-xl text-lg"
          onClick={handleDownloadPNG}
        >
          <Download className="w-5 h-5 mr-2" />
          Télécharger la facture
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
