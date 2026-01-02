export type IngredientCategory = 'vegetables_fruits' | 'protein' | 'seasonings' | 'others';

export type StorageType = 'fridge' | 'freezer';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number; // in minutes
  storageType: StorageType;
  batchServings: number;
  imageUrl?: string;
}

export interface WeeklyMenu {
  [key: string]: Recipe | null;
}

export interface GroceryItem {
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
