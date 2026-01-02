import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Recipe, WeeklyMenu, DAYS_OF_WEEK, DayOfWeek } from '@/types/recipe';
import { sampleRecipes } from '@/data/sampleRecipes';

interface RecipeContextType {
  recipes: Recipe[];
  weeklyMenu: WeeklyMenu;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  generateWeeklyMenu: () => void;
  clearWeeklyMenu: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach(day => {
      menu[day] = null;
    });
    return menu;
  });

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
    
    // Shuffle recipes
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);
    
    const newMenu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      // Cycle through recipes if we have fewer than 7
      newMenu[day] = shuffled[index % shuffled.length] || null;
    });
    
    setWeeklyMenu(newMenu);
  };

  const clearWeeklyMenu = () => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach(day => {
      menu[day] = null;
    });
    setWeeklyMenu(menu);
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      weeklyMenu,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      generateWeeklyMenu,
      clearWeeklyMenu,
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
