import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, History, User, Truck } from "lucide-react";
import { useLanguage } from "@/shared/contexts";
import { useSensoryFeedback } from "@/shared/hooks";
import { cn } from "@/shared/lib";

interface ToolTile {
  icon: React.ElementType;
  label: string;
  path: string;
  audioHint?: string;
}

interface InclusiveToolsGridProps {
  onAudioPlay?: (text: string) => void;
  className?: string;
}

export const InclusiveToolsGrid: React.FC<InclusiveToolsGridProps> = ({
  onAudioPlay,
  className,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { triggerTap } = useSensoryFeedback();

  const tools: ToolTile[] = [
    {
      icon: Package,
      label: t("stock") || "Stock",
      path: "/marchand/stock",
      audioHint: "Ici, tu peux voir et gérer tes produits.",
    },
    {
      icon: History,
      label: t("transactions") || "Historique",
      path: "/marchand/historique",
      audioHint: "Ici, tu peux revoir tes ventes passées.",
    },
    {
      icon: User,
      label: t("my_profile") || "Profil",
      path: "/marchand/profil",
      audioHint: "Ici, tu peux modifier tes informations.",
    },
    {
      icon: Truck,
      label: t("suppliers") || "Fournisseurs",
      path: "/marchand/fournisseurs",
      audioHint: "Ici, tu peux commander chez les coopératives.",
    },
  ];

  const handleTileClick = (tool: ToolTile) => {
    triggerTap();
    navigate(tool.path);
  };

  const handleTileLongPress = (tool: ToolTile) => {
    if (onAudioPlay && tool.audioHint) {
      onAudioPlay(tool.audioHint);
    }
  };

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.path}
            onClick={() => handleTileClick(tool)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleTileLongPress(tool);
            }}
            className="inclusive-tool-tile"
            aria-label={tool.label}
          >
            <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
            <span className="text-base font-medium text-foreground">
              {tool.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
