import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";

// READ
export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

// CREATE
export async function createRecipe(recipe: Omit<Recipe, "id">) {
  const { error } = await supabase.from("recipes").insert(recipe);
  if (error) throw error;
}

// UPDATE
export async function updateRecipeDb(recipe: Recipe) {
  const { error } = await supabase
    .from("recipes")
    .update(recipe)
    .eq("id", recipe.id);

  if (error) throw error;
}

// DELETE
export async function deleteRecipeDb(id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
