import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRecipes } from '@/context/RecipeContext';
import { Recipe } from '@/types/recipe';
import { 
  ClipboardList, 
  Snowflake, 
  Refrigerator, 
  Clock, 
  ChefHat,
  Lightbulb,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrepTask {
  recipe: Recipe;
  day: 'Saturday' | 'Sunday';
  priority: number;
}

export default function MealPrep() {
  const { weeklyMenu } = useRecipes();

  const prepGuide = useMemo(() => {
    const dishes = Object.values(weeklyMenu).filter((d): d is Recipe => d !== null);
    
    // Separate by storage type
    const freezerDishes = dishes.filter(d => d.storageType === 'freezer');
    const fridgeDishes = dishes.filter(d => d.storageType === 'fridge');
    
    // Sort by prep time (longest first)
    const sortedFreezer = [...freezerDishes].sort((a, b) => b.prepTime - a.prepTime);
    const sortedFridge = [...fridgeDishes].sort((a, b) => b.prepTime - a.prepTime);
    
    // Saturday: freezer dishes (longer storage) + some fridge dishes
    // Sunday: remaining fridge dishes
    const saturdayTasks: PrepTask[] = sortedFreezer.map((recipe, i) => ({
      recipe,
      day: 'Saturday',
      priority: i + 1,
    }));
    
    const halfFridge = Math.ceil(sortedFridge.length / 2);
    sortedFridge.slice(0, halfFridge).forEach((recipe, i) => {
      saturdayTasks.push({
        recipe,
        day: 'Saturday',
        priority: saturdayTasks.length + 1,
      });
    });
    
    const sundayTasks: PrepTask[] = sortedFridge.slice(halfFridge).map((recipe, i) => ({
      recipe,
      day: 'Sunday',
      priority: i + 1,
    }));

    const totalPrepTime = dishes.reduce((sum, d) => sum + d.prepTime, 0);
    const saturdayTime = saturdayTasks.reduce((sum, t) => sum + t.recipe.prepTime, 0);
    const sundayTime = sundayTasks.reduce((sum, t) => sum + t.recipe.prepTime, 0);

    return {
      saturdayTasks,
      sundayTasks,
      freezerCount: freezerDishes.length,
      fridgeCount: fridgeDishes.length,
      totalPrepTime,
      saturdayTime,
      sundayTime,
    };
  }, [weeklyMenu]);

  const hasMenu = prepGuide.saturdayTasks.length > 0 || prepGuide.sundayTasks.length > 0;

  const speedTips = [
    { icon: '🍗', tip: 'Batch cook all proteins at once on one sheet pan' },
    { icon: '🥗', tip: 'Wash and chop all vegetables before starting' },
    { icon: '🫙', tip: 'Store sauces separately to keep dishes fresh' },
    { icon: '📝', tip: 'Label containers with dish name and cook date' },
    { icon: '🧊', tip: 'Let food cool before refrigerating to prevent condensation' },
    { icon: '♻️', tip: 'Use the same base ingredients across multiple dishes' },
  ];

  return (
    <MainLayout
      title="Weekend Meal Prep"
      subtitle="Your smart cooking workflow for the week ahead"
    >
      {!hasMenu ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            No prep guide yet
          </h3>
          <p className="text-muted-foreground">
            Generate a weekly menu first to get your personalized meal prep workflow.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="floating-card text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-display font-bold">{prepGuide.totalPrepTime}</p>
              <p className="text-sm text-muted-foreground">Total minutes</p>
            </div>
            <div className="floating-card text-center">
              <Snowflake className="w-6 h-6 mx-auto mb-2 text-info" />
              <p className="text-2xl font-display font-bold">{prepGuide.freezerCount}</p>
              <p className="text-sm text-muted-foreground">Freezer meals</p>
            </div>
            <div className="floating-card text-center">
              <Refrigerator className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-display font-bold">{prepGuide.fridgeCount}</p>
              <p className="text-sm text-muted-foreground">Fridge meals</p>
            </div>
            <div className="floating-card text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
              <p className="text-2xl font-display font-bold">2</p>
              <p className="text-sm text-muted-foreground">Prep days</p>
            </div>
          </div>

          {/* Prep timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saturday */}
            <div className="floating-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl gradient-sage flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">Saturday</h3>
                  <p className="text-sm text-muted-foreground">
                    ~{prepGuide.saturdayTime} minutes • {prepGuide.saturdayTasks.length} dishes
                  </p>
                </div>
              </div>

              {prepGuide.saturdayTasks.length > 0 ? (
                <div className="space-y-3">
                  {prepGuide.saturdayTasks.map((task, index) => (
                    <div
                      key={task.recipe.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.recipe.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{task.recipe.prepTime} min</span>
                          {task.recipe.storageType === 'freezer' ? (
                            <Snowflake className="w-3 h-3 text-info" />
                          ) : (
                            <Refrigerator className="w-3 h-3 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">Rest day! 🌟</p>
              )}
            </div>

            {/* Sunday */}
            <div className="floating-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl gradient-lemon flex items-center justify-center">
                  <span className="text-2xl">🌙</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">Sunday</h3>
                  <p className="text-sm text-muted-foreground">
                    ~{prepGuide.sundayTime} minutes • {prepGuide.sundayTasks.length} dishes
                  </p>
                </div>
              </div>

              {prepGuide.sundayTasks.length > 0 ? (
                <div className="space-y-3">
                  {prepGuide.sundayTasks.map((task, index) => (
                    <div
                      key={task.recipe.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.recipe.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{task.recipe.prepTime} min</span>
                          <Refrigerator className="w-3 h-3 text-primary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">Light day - quick prep only! ✨</p>
              )}
            </div>
          </div>

          {/* Storage guide */}
          <div className="floating-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-info-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg">Storage Guide</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Refrigerator className="w-5 h-5 text-primary" />
                  <span className="font-medium">Fridge Storage</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep meals fresh for 3-4 days. Store in airtight containers. 
                  Reheat thoroughly before serving.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-info/20">
                <div className="flex items-center gap-2 mb-2">
                  <Snowflake className="w-5 h-5 text-info" />
                  <span className="font-medium">Freezer Storage</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lasts 2-3 weeks frozen. Thaw overnight in fridge before reheating. 
                  Label with date for tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Speed tips */}
          <div className="floating-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-display font-bold text-lg">Speed-Cooking Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {speedTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-muted/30 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="text-xl">{tip.icon}</span>
                  <p className="text-sm">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
