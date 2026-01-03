import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DishCard } from '@/components/recipes/DishCard';
import { RecipeModal } from '@/components/recipes/RecipeModal';
import { useRecipes } from '@/context/RecipeContext';
import { Recipe, DAYS_OF_WEEK, MEAL_TYPES, mealTypeConfig, MealType, DayOfWeek } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Shuffle, Trash2, CalendarDays, Sparkles, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

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

interface DraggableMealProps {
  id: string;
  recipe: Recipe;
  onClick: () => void;
}

function DraggableMeal({ id, recipe, onClick }: DraggableMealProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { recipe },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative', isDragging && 'opacity-50')}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-2 p-1 rounded-lg bg-muted/80 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <DishCard
        recipe={recipe}
        onClick={onClick}
        compact
        className="shadow-none hover:shadow-soft"
      />
    </div>
  );
}

interface DroppableMealSlotProps {
  id: string;
  children: React.ReactNode;
}

function DroppableMealSlot({ id, children }: DroppableMealSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl transition-all duration-200 min-h-[80px] group',
        isOver && 'ring-2 ring-primary ring-offset-2 bg-primary/10'
      )}
    >
      {children}
    </div>
  );
}

export default function WeeklyMenu() {
  const { weeklyMenu, generateWeeklyMenu, clearWeeklyMenu, recipes, swapMeals } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const hasMenu = Object.values(weeklyMenu).some(dayMeals => 
    dayMeals.breakfast !== null || dayMeals.lunch !== null || dayMeals.dinner !== null
  );
  const hasRecipes = recipes.length > 0;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const data = active.data.current as { recipe: Recipe } | undefined;
    if (data?.recipe) {
      setActiveRecipe(data.recipe);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveRecipe(null);

    if (!over || active.id === over.id) return;

    // Parse the IDs to get day and meal type
    const [fromDay, fromMeal] = (active.id as string).split('-') as [DayOfWeek, MealType];
    const [toDay, toMeal] = (over.id as string).split('-') as [DayOfWeek, MealType];

    swapMeals(fromDay, fromMeal, toDay, toMeal);
  };

  return (
    <MainLayout
      title="Weekly Menu"
      subtitle="Your personalized 7-day meal plan — drag dishes to rearrange"
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
                        const slotId = `${day}-${mealType}`;
                        
                        return (
                          <DroppableMealSlot key={mealType} id={slotId}>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{config.emoji}</span>
                                <span className="font-medium">{config.label}</span>
                              </div>
                              {dish ? (
                                <DraggableMeal
                                  id={slotId}
                                  recipe={dish}
                                  onClick={() => setSelectedRecipe(dish)}
                                />
                              ) : (
                                <div className="h-20 rounded-2xl bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                                  <p className="text-muted-foreground text-sm">Drop here</p>
                                </div>
                              )}
                            </div>
                          </DroppableMealSlot>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeRecipe ? (
              <div className="opacity-90 rotate-3 scale-105">
                <DishCard
                  recipe={activeRecipe}
                  compact
                  className="shadow-float"
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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
