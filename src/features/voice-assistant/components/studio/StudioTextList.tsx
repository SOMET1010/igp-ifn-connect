import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CheckCircle, Circle, Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextItem {
  key: string;
  value: string;
  category: string;
  isRecorded: boolean;
}

interface StudioTextListProps {
  items: TextItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onPlay: (key: string) => void;
}

// Group translation keys by category
const CATEGORIES: Record<string, string[]> = {
  "Accueil": ["welcome", "platform_title", "platform_subtitle", "who_are_you", "choose_access", "help_text", "country"],
  "Rôles": ["merchant", "merchant_desc", "agent", "agent_desc", "cooperative", "cooperative_desc", "admin", "admin_desc"],
  "Dashboard": ["daily_sales", "transactions", "view_history", "collect_payment", "stock_alerts", "my_stock", "rsti_balance", "credits"],
  "Actions": ["confirm", "cancel", "save", "add", "delete", "edit", "back", "next", "close", "search", "loading"],
  "Paiement": ["cash", "mobile_money", "transfer", "amount", "fcfa", "payment_success", "payment_recorded"],
  "Caisse": ["my_cashier", "record_sale", "confirm_payment", "transaction_success", "amount_to_collect", "new_sale"],
  "Audio": ["audio_play", "audio_dashboard", "audio_cashier_input", "audio_cashier_confirm", "audio_cashier_success", "offline_notice", "login_intro", "otp_instruction"],
};

export function StudioTextList({ items, selectedKey, onSelect, onPlay }: StudioTextListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'pending' && !item.isRecorded) ||
      (filter === 'done' && item.isRecorded);

    return matchesSearch && matchesFilter;
  });

  // Group by category
  const groupedItems: Record<string, TextItem[]> = {};
  filteredItems.forEach(item => {
    let category = 'Autres';
    for (const [cat, keys] of Object.entries(CATEGORIES)) {
      if (keys.includes(item.key)) {
        category = cat;
        break;
      }
    }
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });

  const pendingCount = items.filter(i => !i.isRecorded).length;
  const doneCount = items.filter(i => i.isRecorded).length;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un texte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col" onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="all" className="text-xs">
            Tous ({items.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            🔴 À faire ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="done" className="text-xs">
            🟢 Fait ({doneCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="p-4 space-y-4">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {category} ({categoryItems.length})
                  </h3>
                  <div className="space-y-1">
                    {categoryItems.map((item) => (
                      <div
                        key={item.key}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                          selectedKey === item.key
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-muted border border-transparent"
                        )}
                        onClick={() => onSelect(item.key)}
                      >
                        {item.isRecorded ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.value}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {item.key}
                          </p>
                        </div>

                        {item.isRecorded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlay(item.key);
                            }}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun texte trouvé
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
