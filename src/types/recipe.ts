export type IngredientCategory = 'vegetables_fruits' | 'protein' | 'seasonings' | 'others';

export type StorageType = 'fridge' | 'freezer';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

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
  mealType: MealType;
  imageUrl?: string;
}

export interface DayMeals {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
}

export interface WeeklyMenu {
  [key: string]: DayMeals;
}

export interface ShelfItem {
  id: string;
  name: string;
  unit: string;
}

export interface GroceryItem {
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  onShelf?: boolean;
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const mealTypeConfig: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '☀️' },
  dinner: { label: 'Dinner', emoji: '🌙' },
};
