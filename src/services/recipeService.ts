// NOTE: This file contains stubs for database operations.
// The actual database tables have not been created yet.
// The app currently uses local state via RecipeContext.

import { WeeklyMenu } from "@/types/recipe";

// --- RECIPES ---
export async function fetchRecipes() {
  // Stub: Return empty array until DB is set up
  console.warn("fetchRecipes: Database not configured, returning empty array");
  return [];
}

export async function createRecipe(recipe: any) {
  console.warn("createRecipe: Database not configured");
  throw new Error("Database not configured");
}

export async function updateRecipeDb(recipe: any) {
  console.warn("updateRecipeDb: Database not configured");
  throw new Error("Database not configured");
}

export async function deleteRecipeDb(id: string) {
  console.warn("deleteRecipeDb: Database not configured");
  throw new Error("Database not configured");
}

// --- WEEKLY MENU ---
export async function fetchWeeklySchedule(): Promise<WeeklyMenu | null> {
  console.warn("fetchWeeklySchedule: Database not configured");
  return null;
}

export async function saveWeeklySchedule(menu: WeeklyMenu) {
  console.warn("saveWeeklySchedule: Database not configured");
  throw new Error("Database not configured");
}

// --- MY SHELF ---
export async function fetchShelfItems() {
  console.warn("fetchShelfItems: Database not configured");
  return [];
}

export async function addShelfItemDb(item: {
  name: string;
  amount: number;
  unit: string;
}) {
  console.warn("addShelfItemDb: Database not configured");
  throw new Error("Database not configured");
}

export async function removeShelfItemDb(id: string) {
  console.warn("removeShelfItemDb: Database not configured");
  throw new Error("Database not configured");
}
