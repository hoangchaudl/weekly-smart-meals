import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Recipe, WeeklyMenu, DAYS_OF_WEEK, DayOfWeek, ShelfItem, MealType, DayMeals } from '@/types/recipe';
import { sampleRecipes } from '@/data/sampleRecipes';

interface RecipeContextType {
  recipes: Recipe[];
  weeklyMenu: WeeklyMenu;
  shelfItems: ShelfItem[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  generateWeeklyMenu: () => void;
  clearWeeklyMenu: () => void;
  addShelfItem: (item: Omit<ShelfItem, 'id'>) => void;
  removeShelfItem: (id: string) => void;
  isOnShelf: (ingredientName: string) => boolean;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

const createEmptyDayMeals = (): DayMeals => ({
  breakfast: null,
  lunch: null,
  dinner: null,
});

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach(day => {
      menu[day] = createEmptyDayMeals();
    });
    return menu;
  });
  const [shelfItems, setShelfItems] = useState<ShelfItem[]>([
    { id: '1', name: 'Olive oil', unit: 'tbsp' },
    { id: '2', name: 'Soy sauce', unit: 'tbsp' },
    { id: '3', name: 'Garlic', unit: 'cloves' },
    { id: '4', name: 'Salt', unit: 'tsp' },
    { id: '5', name: 'Pepper', unit: 'tsp' },
  ]);

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const updateRecipe = (recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const generateWeeklyMenu = () => {
    if (recipes.length === 0) return;
    
    // Group recipes by meal type
    const breakfastRecipes = recipes.filter(r => r.mealType === 'breakfast');
    const lunchRecipes = recipes.filter(r => r.mealType === 'lunch');
    const dinnerRecipes = recipes.filter(r => r.mealType === 'dinner');
    
    // Shuffle each group
    const shuffledBreakfast = [...breakfastRecipes].sort(() => Math.random() - 0.5);
    const shuffledLunch = [...lunchRecipes].sort(() => Math.random() - 0.5);
    const shuffledDinner = [...dinnerRecipes].sort(() => Math.random() - 0.5);
    
    const newMenu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      newMenu[day] = {
        breakfast: shuffledBreakfast.length > 0 ? shuffledBreakfast[index % shuffledBreakfast.length] : null,
        lunch: shuffledLunch.length > 0 ? shuffledLunch[index % shuffledLunch.length] : null,
        dinner: shuffledDinner.length > 0 ? shuffledDinner[index % shuffledDinner.length] : null,
      };
    });
    
    setWeeklyMenu(newMenu);
  };

  const clearWeeklyMenu = () => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach(day => {
      menu[day] = createEmptyDayMeals();
    });
    setWeeklyMenu(menu);
  };

  const addShelfItem = (item: Omit<ShelfItem, 'id'>) => {
    const newItem: ShelfItem = {
      ...item,
      id: Date.now().toString(),
    };
    setShelfItems(prev => [...prev, newItem]);
  };

  const removeShelfItem = (id: string) => {
    setShelfItems(prev => prev.filter(item => item.id !== id));
  };

  const isOnShelf = (ingredientName: string) => {
    return shelfItems.some(item => 
      item.name.toLowerCase() === ingredientName.toLowerCase()
    );
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      weeklyMenu,
      shelfItems,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      generateWeeklyMenu,
      clearWeeklyMenu,
      addShelfItem,
      removeShelfItem,
      isOnShelf,
    }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
}
