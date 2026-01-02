import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DishCard } from '@/components/recipes/DishCard';
import { RecipeModal } from '@/components/recipes/RecipeModal';
import { useRecipes } from '@/context/RecipeContext';
import { Recipe, DAYS_OF_WEEK, MEAL_TYPES, mealTypeConfig, MealType } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Shuffle, Trash2, CalendarDays, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const dayColors = [
  'bg-primary/10 border-primary/30',
  'bg-secondary/20 border-secondary/40',
  'bg-accent/20 border-accent/40',
  'bg-info/20 border-info/40',
  'bg-primary/10 border-primary/30',
  'bg-secondary/20 border-secondary/40',
  'bg-accent/20 border-accent/40',
];

const dayEmojis = ['🌅', '🌤️', '☀️', '🌈', '🌸', '🎉', '🌙'];

export default function WeeklyMenu() {
  const { weeklyMenu, generateWeeklyMenu, clearWeeklyMenu, recipes } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const hasMenu = Object.values(weeklyMenu).some(dayMeals => 
    dayMeals.breakfast !== null || dayMeals.lunch !== null || dayMeals.dinner !== null
  );
  const hasRecipes = recipes.length > 0;

  return (
    <MainLayout
      title="Weekly Menu"
      subtitle="Your personalized 7-day meal plan"
    >
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button
          onClick={generateWeeklyMenu}
          disabled={!hasRecipes}
          className="btn-primary gap-2"
        >
          <Shuffle className="w-5 h-5" />
          {hasMenu ? 'Regenerate Menu' : 'Generate Weekly Menu'}
        </Button>
        {hasMenu && (
          <Button
            onClick={clearWeeklyMenu}
            variant="outline"
            className="btn-secondary gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Clear Menu
          </Button>
        )}
      </div>

      {!hasRecipes ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            Add some recipes first
          </h3>
          <p className="text-muted-foreground">
            Go to My Dishes to add recipes, then come back to generate your menu.
          </p>
        </div>
      ) : !hasMenu ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-sage flex items-center justify-center animate-pulse-soft">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            Ready to plan your week?
          </h3>
          <p className="text-muted-foreground mb-6">
            Click the button above to automatically create a delicious 7-day menu!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const dayMeals = weeklyMenu[day];
            return (
              <div
                key={day}
                className={cn(
                  'rounded-3xl p-1 animate-fade-in',
                  dayColors[dayIndex]
                )}
                style={{ animationDelay: `${dayIndex * 0.08}s` }}
              >
                <div className="bg-card rounded-[1.25rem] p-4">
                  {/* Day header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{dayEmojis[dayIndex]}</span>
                    <h3 className="font-display font-bold text-lg">{day}</h3>
                  </div>

                  {/* Meals grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MEAL_TYPES.map((mealType) => {
                      const dish = dayMeals[mealType];
                      const config = mealTypeConfig[mealType];
                      
                      return (
                        <div key={mealType} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{config.emoji}</span>
                            <span className="font-medium">{config.label}</span>
                          </div>
                          {dish ? (
                            <DishCard
                              recipe={dish}
                              onClick={() => setSelectedRecipe(dish)}
                              compact
                              className="shadow-none hover:shadow-soft"
                            />
                          ) : (
                            <div className="h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                              <p className="text-muted-foreground text-sm">No dish</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe modal */}
      <RecipeModal
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </MainLayout>
  );
}
