import { Recipe, mealTypeConfig } from '@/types/recipe';
import { Clock, Users, Snowflake, Refrigerator, Home, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecipes } from '@/context/RecipeContext';
import { Button } from '@/components/ui/button';

interface DishCardProps {
  recipe: Recipe;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
  showShelfIndicator?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const categoryEmojis = {
  protein: '🍗',
  vegetables_fruits: '🥦',
  seasonings: '🧂',
  others: '📦',
};

export function DishCard({ 
  recipe, 
  onClick, 
  compact = false, 
  className, 
  showShelfIndicator = false,
  showActions = false,
  onEdit,
  onDelete 
}: DishCardProps) {
  const { isOnShelf, shelfItems } = useRecipes();
  const StorageIcon = recipe.storageType === 'freezer' ? Snowflake : Refrigerator;
  const mealConfig = mealTypeConfig[recipe.mealType];
  
  // Count ingredients on shelf
  const ingredientsOnShelf = recipe.ingredients.filter(ing => isOnShelf(ing.name)).length;
  const totalIngredients = recipe.ingredients.length;
  const hasShelfIngredients = showShelfIndicator && ingredientsOnShelf > 0;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'floating-card card-hover cursor-pointer group relative',
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Shelf indicator with count */}
      {hasShelfIngredients && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary flex items-center gap-1 shadow-md">
          <Home className="w-3 h-3 text-primary-foreground" />
          <span className="text-xs font-medium text-primary-foreground">{ingredientsOnShelf}/{totalIngredients}</span>
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 rounded-xl shadow-soft"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 rounded-xl shadow-soft hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{mealConfig.emoji}</span>
            <span className="text-xs text-muted-foreground">{mealConfig.label}</span>
          </div>
          <h3 className={cn(
            'font-display font-bold text-foreground truncate group-hover:text-primary transition-colors',
            compact ? 'text-base' : 'text-lg'
          )}>
            {recipe.name}
          </h3>
          
          {/* Quick stats */}
          <div className="flex items-center gap-3 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{recipe.prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{recipe.batchServings}</span>
            </div>
            <div className="flex items-center gap-1">
              <StorageIcon className={cn(
                'w-4 h-4',
                recipe.storageType === 'freezer' ? 'text-info' : 'text-primary'
              )} />
            </div>
          </div>
        </div>

        {/* Decorative badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-xl">
          {recipe.name.includes('Chicken') ? '🍗' : 
           recipe.name.includes('Beef') ? '🥩' :
           recipe.name.includes('Salmon') || recipe.name.includes('Shrimp') ? '🐟' :
           recipe.name.includes('Tofu') ? '🥬' :
           recipe.name.includes('Mushroom') ? '🍄' :
           '🍽️'}
        </div>
      </div>

      {/* Ingredients preview (non-compact only) */}
      {!compact && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {recipe.ingredients.slice(0, 4).map((ing) => (
            <span
              key={ing.id}
              className="category-badge bg-muted text-muted-foreground text-xs"
            >
              {categoryEmojis[ing.category]} {ing.name}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span className="category-badge bg-muted text-muted-foreground text-xs">
              +{recipe.ingredients.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
