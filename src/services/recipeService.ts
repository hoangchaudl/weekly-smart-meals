import { supabase } from "@/integrations/supabase/client";
import { Recipe } from "@/types/recipe";

// ✅ FIX: Added return type Promise<Recipe[]>
export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // ✅ FIX: Cast the raw DB data to your Recipe type
  return (data as unknown as Recipe[]) || [];
}

// ✅ FIX: Replaced 'any' with strict type
export async function createRecipe(recipe: Omit<Recipe, "id">) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("recipes").insert({
    ...recipe,
    // ✅ FIX: Supabase expects 'Json', so we cast these specific fields
    ingredients: recipe.ingredients as unknown as any,
    steps: recipe.steps as unknown as any,
    user_id: user?.id,
  });

  if (error) throw error;
}

// ✅ FIX: Replaced 'any' with strict type
export async function updateRecipeDb(recipe: Recipe) {
  // Extract ID to ensure we don't try to update the primary key column
  const { id, ...updates } = recipe;

  const { error } = await supabase
    .from("recipes")
    .update({
      ...updates,
      ingredients: updates.ingredients as unknown as any,
      steps: updates.steps as unknown as any,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteRecipeDb(id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
