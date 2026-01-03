import { Button } from "@/components/ui/button";
import { Send, Download, QrCode, History } from "lucide-react";

interface QuickActionsProps {
  onSend: () => void;
  onDeposit: () => void;
  onHistory: () => void;
  onQrCode?: () => void;
}

export function QuickActions({ onSend, onDeposit, onHistory, onQrCode }: QuickActionsProps) {
  const actions = [
    {
      icon: Send,
      label: "Envoyer",
      onClick: onSend,
      variant: "default" as const,
    },
    {
      icon: Download,
      label: "Dépôt",
      onClick: onDeposit,
      variant: "secondary" as const,
    },
    {
      icon: History,
      label: "Historique",
      onClick: onHistory,
      variant: "outline" as const,
    },
  ];

  if (onQrCode) {
    actions.push({
      icon: QrCode,
      label: "Mon QR",
      onClick: onQrCode,
      variant: "outline" as const,
    });
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.slice(0, 3).map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          className="flex flex-col h-auto py-4 gap-2"
          onClick={action.onClick}
        >
          <action.icon className="h-5 w-5" />
          <span className="text-xs">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
