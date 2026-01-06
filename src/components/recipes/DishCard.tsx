import { useState } from "react";
import { Recipe, mealTypeConfig } from "@/types/recipe";
import { Clock, Users, Snowflake, Refrigerator, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecipes } from "@/context/RecipeContext";
import { EditRecipeModal } from "./EditRecipeModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface DishCardProps {
  recipe: Recipe;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
  showShelfIndicator?: boolean;
}

const categoryEmojis = {
  protein: "🥩",
  vegetables_fruits: "🥦",
  seasonings: "🧂",
  others: "📦",
};

export function DishCard({
  recipe,
  onClick,
  compact = false,
  className,
  showShelfIndicator = false,
}: DishCardProps) {
  const { isOnShelf, deleteRecipe } = useRecipes();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mealAccent =
    {
      breakfast: "meal-accent-breakfast",
      lunch: "meal-accent-lunch",
      dinner: "meal-accent-dinner",
      snacks: "meal-accent-lunch",
    }[recipe.mealType] || "meal-accent-dinner";

  const StorageIcon =
    recipe.storageType === "freezer" ? Snowflake : Refrigerator;
  const mealConfig = mealTypeConfig[recipe.mealType];

  const ingredientsOnShelf = recipe.ingredients.filter((ing) =>
    isOnShelf(ing.name)
  ).length;

  return (
    <>
      <div
        onClick={() => onClick?.()}
        className={cn(
          "cursor-pointer group relative bg-white/80 backdrop-blur-sm",
          "rounded-[1.75rem] border border-white/60",
          "hover:shadow-soft transition-all duration-300",
          mealAccent,
          compact ? "p-4" : "p-6",
          className
        )}
      >
        {showShelfIndicator && ingredientsOnShelf > 0 && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary/90 flex items-center gap-1 shadow-soft">
            <Home className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">
              {ingredientsOnShelf}/{recipe.ingredients.length}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
              <span>{mealConfig.emoji}</span>
              {mealConfig.label}
            </div>

            <h3
              className={cn(
                "font-display font-bold text-foreground",
                compact ? "text-base" : "text-lg"
              )}
            >
              {recipe.name}
            </h3>

            <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.prepTime} min
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.batchServings}
              </div>
              <StorageIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center text-xl shadow-soft">
            {recipe.ingredients[0]
              ? categoryEmojis[recipe.ingredients[0].category]
              : "🥘"}
          </div>
        </div>

        {!compact && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {recipe.ingredients.slice(0, 4).map((ing) => (
              <span
                key={ing.id}
                className="category-badge bg-white/70 text-muted-foreground text-xs"
              >
                {categoryEmojis[ing.category]} {ing.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <EditRecipeModal
        recipe={recipe}
        open={isEditing}
        onClose={() => setIsEditing(false)}
      />
      <DeleteConfirmModal
        recipe={recipe}
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={() => deleteRecipe(recipe.id)}
      />
    </>
  );
}
