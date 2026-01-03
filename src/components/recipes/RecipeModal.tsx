import { Recipe } from "@/types/recipe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Users,
  Snowflake,
  Refrigerator,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecipes } from "@/context/RecipeContext";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditRecipeModal } from "./EditRecipeModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useState } from "react";

interface RecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

const categoryColors = {
  vegetables_fruits: "bg-primary/20 text-primary-foreground",
  protein: "bg-accent/30 text-accent-foreground",
  seasonings: "bg-secondary/50 text-secondary-foreground",
  others: "bg-info/30 text-info-foreground",
};

const categoryEmojis = {
  vegetables_fruits: "🥦",
  protein: "🍗",
  seasonings: "🧂",
  others: "📦",
};

export function RecipeModal({ recipe, open, onClose }: RecipeModalProps) {
  const { isOnShelf } = useRecipes();
  const { deleteRecipe } = useRecipes();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!recipe) return null;

  const StorageIcon =
    recipe.storageType === "freezer" ? Snowflake : Refrigerator;
  const ingredientsOnShelf = recipe.ingredients.filter((ing) =>
    isOnShelf(ing.name)
  ).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-0 shadow-float rounded-3xl p-0">
        {/* Header with gradient */}
        <div className="gradient-sage p-6 pb-8 rounded-t-3xl">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle className="text-2xl font-display font-bold text-foreground">
              {recipe.name}
            </DialogTitle>

            {/* 🔧 CHANGE: edit/delete INSIDE recipe modal */}
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{recipe.prepTime} min</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {recipe.batchServings} servings
              </span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-3 py-1.5 rounded-full">
              <StorageIcon
                className={cn(
                  "w-4 h-4",
                  recipe.storageType === "freezer"
                    ? "text-info"
                    : "text-primary"
                )}
              />
              <span className="text-sm font-medium capitalize">
                {recipe.storageType}
              </span>
            </div>
            {ingredientsOnShelf > 0 && (
              <div className="flex items-center gap-2 bg-primary/80 backdrop-blur px-3 py-1.5 rounded-full">
                <Home className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">
                  {ingredientsOnShelf}/{recipe.ingredients.length} on shelf
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Ingredients */}
          <section>
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">🥘</span> Ingredients
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {recipe.ingredients.map((ing) => {
                const onShelf = isOnShelf(ing.name);
                return (
                  <div
                    key={ing.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-2xl relative",
                      onShelf
                        ? "bg-primary/30 ring-2 ring-primary/50"
                        : categoryColors[ing.category]
                    )}
                  >
                    <span>{categoryEmojis[ing.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ing.name}</p>
                      <p className="text-xs opacity-75">
                        {ing.amount} {ing.unit}
                      </p>
                    </div>
                    {onShelf && (
                      <Home className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">👨‍🍳</span> Cooking Steps
            </h3>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-muted/50 rounded-2xl group hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed pt-1">{step}</p>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                </div>
              ))}
            </div>
          </section>

          {/* Storage tip */}
          <div
            className={cn(
              "p-4 rounded-2xl flex items-center gap-3",
              recipe.storageType === "freezer" ? "bg-info/20" : "bg-primary/10"
            )}
          >
            <StorageIcon className="w-6 h-6" />
            <div>
              <p className="font-medium text-sm">Storage Tip</p>
              <p className="text-xs text-muted-foreground">
                {recipe.storageType === "freezer"
                  ? "Store in freezer for up to 2-3 weeks. Thaw overnight in fridge before reheating."
                  : "Store in fridge for 3-4 days. Reheat thoroughly before serving."}
              </p>
            </div>
          </div>
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
          onConfirm={() => {
            deleteRecipe(recipe.id);
            setIsDeleting(false);
            onClose(); // close recipe modal after delete
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
