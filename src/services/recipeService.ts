import { supabase } from "@/integrations/supabase/client";
import { WeeklyMenu } from "@/types/recipe";

// --- RECIPES ---
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

// --- WEEKLY MENU ---
export async function fetchWeeklySchedule() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("weekly_schedule")
    .select("menu")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") console.error(error);
  return data?.menu || null;
}

export async function saveWeeklySchedule(menu: WeeklyMenu) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("weekly_schedule")
    .upsert({ user_id: user.id, menu: menu });
  if (error) throw error;
}

// --- MY SHELF (New!) ---
export async function fetchShelfItems() {
  const { data, error } = await supabase
    .from("shelf_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addShelfItemDb(item: {
  name: string;
  amount: number;
  unit: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("shelf_items").insert({
    ...item,
    user_id: user.id,
  });
  if (error) throw error;
}

export async function removeShelfItemDb(id: string) {
  const { error } = await supabase.from("shelf_items").delete().eq("id", id);
  if (error) throw error;
}
