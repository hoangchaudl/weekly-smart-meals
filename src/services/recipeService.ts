import { supabase } from "@/integrations/supabase/client";

export async function fetchRecipes() {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createRecipe(recipe: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("recipes").insert({
    ...recipe,
    user_id: user?.id,
  });

  if (error) throw error;
}

export async function updateRecipeDb(recipe: any) {
  const { error } = await supabase
    .from("recipes")
    .update(recipe)
    .eq("id", recipe.id);

  if (error) throw error;
}

export async function deleteRecipeDb(id: string) {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
