import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DishCard } from "@/components/recipes/DishCard";
import { RecipeModal } from "@/components/recipes/RecipeModal";
import { AddRecipeModal } from "@/components/recipes/AddRecipeModal";
import { useRecipes } from "@/context/RecipeContext";
import { Recipe, MealType } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function MyDishes() {
  const { recipes } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeFilters, setActiveFilters] = useState<MealType[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes
    .filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .filter((recipe) =>
      activeFilters.length === 0
        ? true
        : activeFilters.includes(recipe.mealType)
    );

  return (
    <MainLayout title="My Dishes" subtitle="Your personal recipe collection">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search dishes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-border bg-card shadow-soft"
          />
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary h-12 gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Dish
        </Button>
      </div>

      {/* 🍽 Meal Type Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: "breakfast", label: "Breakfast", emoji: "☕" },
          { key: "lunch", label: "Lunch", emoji: "🌞" },
          { key: "dinner", label: "Dinner", emoji: "🌙" },
          { key: "snacks", label: "Snacks", emoji: "🍪" },
        ].map((item) => {
          const active = activeFilters.includes(item.key as MealType);

          return (
            <button
              key={item.key}
              onClick={() =>
                setActiveFilters((prev) =>
                  active
                    ? prev.filter((f) => f !== item.key)
                    : [...prev, item.key as MealType]
                )
              }
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted hover:bg-muted/70 text-muted-foreground"
              )}
            >
              {item.emoji} {item.label}
            </button>
          );
        })}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <DishCard
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                showShelfIndicator
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            No dishes found
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}

      <RecipeModal
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
      <AddRecipeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </MainLayout>
  );
}
