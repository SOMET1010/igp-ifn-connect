import { useLanguage } from "@/contexts/LanguageContext";

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ isOnline }) => {
  const { t } = useLanguage();
  
  return (
    <div className={`text-center text-sm ${isOnline ? 'text-muted-foreground' : 'text-destructive'}`}>
      {isOnline ? t("saved_offline") : t("offline_message")}
    </div>
  );
};
