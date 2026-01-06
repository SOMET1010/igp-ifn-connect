import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mapping catégorie → emoji géant
const CATEGORY_ICONS: Record<string, string> = {
  "Légumes": "🥬",
  "Fruits": "🍌",
  "Céréales": "🌾",
  "Tubercules": "🥔",
  "Huiles": "🫒",
  "Épices": "🌶️",
  "Boissons": "🍵",
  "Viandes": "🍖",
  "Poissons": "🐟",
  "Autres": "📦",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Légumes": "from-green-500 to-emerald-600",
  "Fruits": "from-yellow-500 to-orange-500",
  "Céréales": "from-amber-500 to-yellow-600",
  "Tubercules": "from-orange-600 to-amber-700",
  "Huiles": "from-lime-500 to-green-600",
  "Épices": "from-red-500 to-orange-600",
  "Boissons": "from-cyan-500 to-teal-600",
  "Viandes": "from-rose-500 to-red-600",
  "Poissons": "from-blue-500 to-cyan-600",
  "Autres": "from-gray-500 to-slate-600",
};

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  productCount?: number;
}

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryCarousel({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const allCategories: Category[] = [
    { id: 'all', name: 'Tous', productCount: categories.reduce((sum, c) => sum + (c.productCount || 0), 0) },
    ...categories
  ];

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md h-8 w-8 rounded-full"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md h-8 w-8 rounded-full"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allCategories.map((category) => {
          const isSelected = category.id === 'all' 
            ? selectedCategory === null 
            : selectedCategory === category.id;
          const emoji = category.id === 'all' ? '🛒' : (CATEGORY_ICONS[category.name] || '📦');
          const gradientClass = category.id === 'all' 
            ? 'from-primary to-primary/80' 
            : (CATEGORY_COLORS[category.name] || 'from-gray-500 to-slate-600');

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id === 'all' ? null : category.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-2xl transition-all duration-200",
                "border-2 shadow-sm hover:shadow-md active:scale-95",
                isSelected 
                  ? `bg-gradient-to-br ${gradientClass} text-white border-transparent` 
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              {/* Emoji Icon - 48x48px target */}
              <span className="text-4xl mb-1" role="img" aria-label={category.name}>
                {emoji}
              </span>
              
              {/* Category Name */}
              <span className={cn(
                "text-xs font-medium truncate max-w-[70px]",
                isSelected ? "text-white" : "text-foreground"
              )}>
                {category.name}
              </span>
              
              {/* Product Count */}
              {category.productCount !== undefined && category.productCount > 0 && (
                <span className={cn(
                  "text-[10px]",
                  isSelected ? "text-white/80" : "text-muted-foreground"
                )}>
                  {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
