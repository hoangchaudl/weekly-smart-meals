import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DishCard } from "@/components/recipes/DishCard";
import { RecipeModal } from "@/components/recipes/RecipeModal";
import { AddRecipeModal } from "@/components/recipes/AddRecipeModal";
// 🔧 CHANGE: removed EditRecipeModal & DeleteConfirmModal imports
import { useRecipes } from "@/context/RecipeContext";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MyDishes() {
  const { recipes } = useRecipes(); // 🔧 CHANGE: deleteRecipe no longer needed here
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // 🔧 CHANGE: removed editingRecipe & deletingRecipe states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <MainLayout title="My Dishes" subtitle="Your personal recipe collection">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                showActions
                // 🔧 CHANGE: no onEdit / onDelete props anymore
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
            {searchQuery ? "No dishes found" : "No dishes yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? "Try a different search term"
              : "Add your first recipe to get started!"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Dish
            </Button>
          )}
        </div>
      )}

      {/* Recipe detail modal */}
      <RecipeModal
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* 🔧 CHANGE: Edit & Delete modals removed — now live inside DishCard */}

      {/* Add recipe modal */}
      <AddRecipeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </MainLayout>
  );
}
