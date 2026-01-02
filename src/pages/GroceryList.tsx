import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRecipes } from '@/context/RecipeContext';
import { GroceryItem, IngredientCategory } from '@/types/recipe';
import { ShoppingCart, Check, Copy, Leaf, Drumstick, Sparkles, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const categoryConfig: Record<IngredientCategory, { 
  label: string; 
  emoji: string; 
  icon: typeof Leaf;
  color: string;
  bgColor: string;
}> = {
  vegetables_fruits: {
    label: 'Vegetables & Fruits',
    emoji: '🥦',
    icon: Leaf,
    color: 'text-primary-foreground',
    bgColor: 'bg-primary/20',
  },
  protein: {
    label: 'Protein',
    emoji: '🍗',
    icon: Drumstick,
    color: 'text-accent-foreground',
    bgColor: 'bg-accent/30',
  },
  seasonings: {
    label: 'Seasonings',
    emoji: '🧂',
    icon: Sparkles,
    color: 'text-secondary-foreground',
    bgColor: 'bg-secondary/50',
  },
  others: {
    label: 'Others',
    emoji: '📦',
    icon: Package,
    color: 'text-info-foreground',
    bgColor: 'bg-info/30',
  },
};

export default function GroceryList() {
  const { weeklyMenu } = useRecipes();
  const { toast } = useToast();

  const groceryList = useMemo(() => {
    const items: Record<string, GroceryItem> = {};
    
    Object.values(weeklyMenu).forEach(recipe => {
      if (!recipe) return;
      
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}-${ing.unit}`;
        if (items[key]) {
          items[key].amount += ing.amount;
        } else {
          items[key] = {
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: ing.category,
          };
        }
      });
    });

    // Group by category
    const grouped: Record<IngredientCategory, GroceryItem[]> = {
      vegetables_fruits: [],
      protein: [],
      seasonings: [],
      others: [],
    };

    Object.values(items).forEach(item => {
      grouped[item.category].push(item);
    });

    // Sort each category alphabetically
    Object.keys(grouped).forEach(cat => {
      grouped[cat as IngredientCategory].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [weeklyMenu]);

  const totalItems = Object.values(groceryList).flat().length;

  const handleCopyList = () => {
    const text = Object.entries(groceryList)
      .filter(([_, items]) => items.length > 0)
      .map(([cat, items]) => {
        const config = categoryConfig[cat as IngredientCategory];
        return `${config.emoji} ${config.label}\n${items.map(i => `  • ${i.name}: ${i.amount} ${i.unit}`).join('\n')}`;
      })
      .join('\n\n');
    
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied to clipboard!' });
  };

  const hasItems = totalItems > 0;

  return (
    <MainLayout
      title="Grocery List"
      subtitle={hasItems ? `${totalItems} items from your weekly menu` : 'Generate a weekly menu to see your shopping list'}
    >
      {hasItems && (
        <Button onClick={handleCopyList} className="btn-secondary gap-2 mb-6">
          <Copy className="w-4 h-4" />
          Copy List
        </Button>
      )}

      {!hasItems ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            No items yet
          </h3>
          <p className="text-muted-foreground">
            Generate a weekly menu first to see your grocery list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.entries(groceryList) as [IngredientCategory, GroceryItem[]][])
            .filter(([_, items]) => items.length > 0)
            .map(([category, items], catIndex) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              
              return (
                <div
                  key={category}
                  className="floating-card animate-fade-in"
                  style={{ animationDelay: `${catIndex * 0.1}s` }}
                >
                  {/* Category header */}
                  <div className={cn('flex items-center gap-3 p-3 rounded-2xl mb-4', config.bgColor)}>
                    <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
                      <span className="text-xl">{config.emoji}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-bold">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">{items.length} items</p>
                    </div>
                  </div>

                  {/* Items list */}
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li
                        key={`${item.name}-${index}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary transition-colors">
                          <Check className="w-3 h-3 text-transparent group-hover:text-primary transition-colors" />
                        </div>
                        <span className="flex-1 font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {item.amount} {item.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      )}
    </MainLayout>
  );
}
