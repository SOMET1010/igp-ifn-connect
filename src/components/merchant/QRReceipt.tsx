import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface TransactionDetails {
  reference: string;
  amount: number;
  paymentMethod: string;
  cmuDeduction: number;
  rstiDeduction: number;
  date: Date;
  merchantName?: string;
}

interface QRReceiptProps {
  transaction: TransactionDetails;
}

export function QRReceipt({ transaction }: QRReceiptProps) {
  const qrData = JSON.stringify({
    ref: transaction.reference,
    amount: transaction.amount,
    method: transaction.paymentMethod,
    cmu: transaction.cmuDeduction,
    rsti: transaction.rstiDeduction,
    date: transaction.date.toISOString(),
    merchant: transaction.merchantName || "Marchand IFN",
  });

  const paymentLabels: Record<string, string> = {
    cash: "Espèces",
    mobile_money: "Mobile Money",
    transfer: "Virement",
  };

  const shareText = `
🧾 Reçu IFN - ${transaction.reference}
💰 Montant: ${transaction.amount.toLocaleString()} FCFA
💳 Paiement: ${paymentLabels[transaction.paymentMethod] || transaction.paymentMethod}
📅 Date: ${transaction.date.toLocaleDateString("fr-FR")}
🏥 CMU: ${transaction.cmuDeduction.toLocaleString()} FCFA
💼 RSTI: ${transaction.rstiDeduction.toLocaleString()} FCFA
  `.trim();

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleShareSMS = () => {
    const encodedText = encodeURIComponent(shareText);
    window.location.href = `sms:?body=${encodedText}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reçu ${transaction.reference}`,
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Reçu copié dans le presse-papier");
  };

  return (
    <Card className="border-2 border-secondary overflow-hidden">
      <div className="bg-secondary text-secondary-foreground p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">Transaction réussie</h3>
        </div>
        <p className="text-secondary-foreground/80 text-sm">
          {transaction.date.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <QRCodeSVG
              value={qrData}
              size={160}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
        </div>

        {/* Transaction details */}
        <div className="text-center space-y-1">
          <p className="text-4xl font-bold text-foreground">
            {transaction.amount.toLocaleString()}
            <span className="text-lg text-muted-foreground ml-1">FCFA</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {paymentLabels[transaction.paymentMethod] || transaction.paymentMethod}
          </p>
        </div>

        {/* Reference */}
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Référence</p>
          <p className="font-mono text-lg font-bold text-foreground mt-1">{transaction.reference}</p>
        </div>

        {/* Deductions */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg bg-destructive/10">
            <p className="text-xs text-muted-foreground">CMU (1%)</p>
            <p className="font-bold text-destructive">-{transaction.cmuDeduction.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/10">
            <p className="text-xs text-muted-foreground">RSTI (0.5%)</p>
            <p className="font-bold text-secondary">+{transaction.rstiDeduction.toLocaleString()}</p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="space-y-3">
          {/* WhatsApp - Primary button */}
          <Button
            className="w-full h-14 rounded-xl text-lg bg-[#25D366] hover:bg-[#128C7E] text-white"
            onClick={handleShareWhatsApp}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Partager sur WhatsApp
          </Button>
          
          {/* SMS - Secondary button */}
          <Button
            variant="outline"
            className="w-full h-14 rounded-xl text-lg"
            onClick={handleShareSMS}
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Envoyer par SMS
          </Button>
          
          {/* Generic share / Copy */}
          <Button
            variant="ghost"
            className="w-full h-12 rounded-xl text-muted-foreground"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Autres options
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
