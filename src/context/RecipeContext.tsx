import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Recipe,
  WeeklyMenu,
  DAYS_OF_WEEK,
  DayOfWeek,
  ShelfItem,
  MealType,
  DayMeals,
} from "@/types/recipe";
import {
  fetchRecipes,
  createRecipe,
  updateRecipeDb,
  deleteRecipeDb,
} from "@/services/recipeService";

interface RecipeContextType {
  recipes: Recipe[];
  weeklyMenu: WeeklyMenu;
  shelfItems: ShelfItem[];
  addRecipe: (recipe: Omit<Recipe, "id">) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  generateWeeklyMenu: () => void;
  clearWeeklyMenu: () => void;
  setMealForDay: (
    day: DayOfWeek,
    mealType: MealType,
    recipe: Recipe | null
  ) => void;
  swapMeals: (
    fromDay: DayOfWeek,
    fromMeal: MealType,
    toDay: DayOfWeek,
    toMeal: MealType
  ) => void;
  addShelfItem: (item: Omit<ShelfItem, "id">) => void;
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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach((day) => {
      menu[day] = createEmptyDayMeals();
    });
    return menu;
  });

  const [shelfItems, setShelfItems] = useState<ShelfItem[]>([
    { id: "1", name: "Olive oil", unit: "tbsp" },
    { id: "2", name: "Soy sauce", unit: "tbsp" },
    { id: "3", name: "Garlic", unit: "cloves" },
    { id: "4", name: "Salt", unit: "tsp" },
    { id: "5", name: "Pepper", unit: "tsp" },
  ]);

  useEffect(() => {
    fetchRecipes().then(setRecipes).catch(console.error);
  }, []);

  const addRecipe = async (recipe: Omit<Recipe, "id">) => {
    await createRecipe(recipe);
    setRecipes(await fetchRecipes());
  };

  const updateRecipe = async (recipe: Recipe) => {
    await updateRecipeDb(recipe);
    setRecipes(await fetchRecipes());
  };

  const deleteRecipe = async (id: string) => {
    await deleteRecipeDb(id);
    setRecipes(await fetchRecipes());
  };

  const generateWeeklyMenu = () => {
    if (!recipes.length) return;

    const newMenu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach((day, i) => {
      const byType = (t: MealType) =>
        recipes.filter((r) => r.mealType === t)[i % recipes.length] || null;

      newMenu[day] = {
        breakfast: byType("breakfast"),
        lunch: byType("lunch"),
        dinner: byType("dinner"),
      };
    });

    setWeeklyMenu(newMenu);
  };

  const clearWeeklyMenu = () => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach((d) => (menu[d] = createEmptyDayMeals()));
    setWeeklyMenu(menu);
  };

  const setMealForDay = (
    day: DayOfWeek,
    meal: MealType,
    recipe: Recipe | null
  ) =>
    setWeeklyMenu((p) => ({
      ...p,
      [day]: { ...p[day], [meal]: recipe },
    }));

  const swapMeals = (
    fd: DayOfWeek,
    fm: MealType,
    td: DayOfWeek,
    tm: MealType
  ) =>
    setWeeklyMenu((p) => {
      const next = structuredClone(p);
      [next[fd][fm], next[td][tm]] = [next[td][tm], next[fd][fm]];
      return next;
    });

  const addShelfItem = (item: Omit<ShelfItem, "id">) =>
    setShelfItems((p) => [...p, { ...item, id: Date.now().toString() }]);

  const removeShelfItem = (id: string) =>
    setShelfItems((p) => p.filter((i) => i.id !== id));

  const isOnShelf = (name: string) =>
    shelfItems.some((i) => i.name.toLowerCase() === name.toLowerCase());

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        weeklyMenu,
        shelfItems,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        generateWeeklyMenu,
        clearWeeklyMenu,
        setMealForDay,
        swapMeals,
        addShelfItem,
        removeShelfItem,
        isOnShelf,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipes must be used within RecipeProvider");
  return ctx;
}
