import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRecipes } from '@/context/RecipeContext';
import { GroceryItem, IngredientCategory, ShelfItem, MEAL_TYPES } from '@/types/recipe';
import { ShoppingCart, Check, Copy, Leaf, Drumstick, Sparkles, Package, Plus, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { weeklyMenu, shelfItems, addShelfItem, removeShelfItem, isOnShelf } = useRecipes();
  const { toast } = useToast();
  const [newShelfItem, setNewShelfItem] = useState('');

  const groceryList = useMemo(() => {
    const items: Record<string, GroceryItem> = {};
    
    Object.values(weeklyMenu).forEach(dayMeals => {
      MEAL_TYPES.forEach(mealType => {
        const recipe = dayMeals[mealType];
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
              onShelf: isOnShelf(ing.name),
            };
          }
        });
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
  }, [weeklyMenu, isOnShelf]);

  const totalItems = Object.values(groceryList).flat().length;
  const shelfItemsInList = Object.values(groceryList).flat().filter(item => item.onShelf);
  const itemsToBuy = Object.values(groceryList).flat().filter(item => !item.onShelf);

  const handleCopyList = () => {
    const text = Object.entries(groceryList)
      .filter(([_, items]) => items.length > 0)
      .map(([cat, items]) => {
        const config = categoryConfig[cat as IngredientCategory];
        const toBuy = items.filter(i => !i.onShelf);
        if (toBuy.length === 0) return '';
        return `${config.emoji} ${config.label}\n${toBuy.map(i => `  • ${i.name}: ${i.amount} ${i.unit}`).join('\n')}`;
      })
      .filter(Boolean)
      .join('\n\n');
    
    navigator.clipboard.writeText(text);
    toast({ title: '📋 Copied to clipboard!' });
  };

  const handleAddShelfItem = () => {
    if (!newShelfItem.trim()) return;
    addShelfItem({ name: newShelfItem.trim(), unit: '' });
    setNewShelfItem('');
    toast({ title: '✅ Added to shelf!' });
  };

  const hasItems = totalItems > 0;

  return (
    <MainLayout
      title="Grocery List"
      subtitle={hasItems ? `${itemsToBuy.length} items to buy • ${shelfItemsInList.length} already on shelf` : 'Generate a weekly menu to see your shopping list'}
    >
      {hasItems && (
        <Button onClick={handleCopyList} className="btn-secondary gap-2 mb-6">
          <Copy className="w-4 h-4" />
          Copy List (items to buy)
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
        <div className="space-y-8">
          {/* Items to buy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.entries(groceryList) as [IngredientCategory, GroceryItem[]][])
              .filter(([_, items]) => items.some(i => !i.onShelf))
              .map(([category, items], catIndex) => {
                const config = categoryConfig[category];
                const toBuyItems = items.filter(i => !i.onShelf);
                
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
                        <p className="text-sm text-muted-foreground">{toBuyItems.length} items to buy</p>
                      </div>
                    </div>

                    {/* Items list */}
                    <ul className="space-y-2">
                      {toBuyItems.map((item, index) => (
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

          {/* On Shelf Section */}
          <div className="floating-card border-2 border-dashed border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">My Shelf</h3>
                <p className="text-sm text-muted-foreground">Items you already have at home</p>
              </div>
            </div>

            {/* Add new shelf item */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add item to shelf..."
                value={newShelfItem}
                onChange={(e) => setNewShelfItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddShelfItem()}
                className="flex-1 rounded-xl"
              />
              <Button onClick={handleAddShelfItem} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {/* Shelf items */}
            <div className="flex flex-wrap gap-2">
              {shelfItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm group"
                >
                  <span>✓</span>
                  <span>{item.name}</span>
                  <button
                    onClick={() => removeShelfItem(item.id)}
                    className="w-4 h-4 rounded-full hover:bg-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>

            {/* Items from menu that are on shelf */}
            {shelfItemsInList.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Items from your menu that you already have:
                </p>
                <ul className="space-y-1">
                  {shelfItemsInList.map((item, index) => (
                    <li
                      key={`shelf-${item.name}-${index}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-primary" />
                      <span className="line-through">{item.name}</span>
                      <span className="text-xs">({item.amount} {item.unit})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
