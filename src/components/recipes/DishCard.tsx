import { Recipe, mealTypeConfig } from '@/types/recipe';
import { Clock, Users, Snowflake, Refrigerator, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecipes } from '@/context/RecipeContext';

interface DishCardProps {
  recipe: Recipe;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
  showShelfIndicator?: boolean;
}

const categoryEmojis = {
  protein: '🍗',
  vegetables_fruits: '🥦',
  seasonings: '🧂',
  others: '📦',
};

export function DishCard({ recipe, onClick, compact = false, className, showShelfIndicator = false }: DishCardProps) {
  const { isOnShelf } = useRecipes();
  const StorageIcon = recipe.storageType === 'freezer' ? Snowflake : Refrigerator;
  const mealConfig = mealTypeConfig[recipe.mealType];
  
  // Check if any ingredient is on shelf
  const hasShelfIngredients = showShelfIndicator && recipe.ingredients.some(ing => isOnShelf(ing.name));
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'floating-card card-hover cursor-pointer group relative',
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Shelf indicator */}
      {hasShelfIngredients && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
          <Home className="w-3 h-3 text-primary-foreground" />
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
