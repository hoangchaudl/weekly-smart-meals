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
  fetchWeeklySchedule,
  saveWeeklySchedule,
  fetchShelfItems,
  addShelfItemDb,
  removeShelfItemDb,
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
  addShelfItem: (item: Omit<ShelfItem, "id">) => Promise<void>;
  removeShelfItem: (id: string) => Promise<void>;
  isOnShelf: (ingredientName: string) => boolean;
  getShelfItem: (ingredientName: string) => ShelfItem | undefined; // 👈 CRITICAL NEW LINE
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

  const [shelfItems, setShelfItems] = useState<ShelfItem[]>([]);

  useEffect(() => {
    fetchRecipes().then(setRecipes).catch(console.error);
    fetchWeeklySchedule().then((savedMenu) => {
      if (savedMenu) setWeeklyMenu(savedMenu);
    });
    fetchShelfItems().then(setShelfItems).catch(console.error);
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

  const updateMenu = (newMenu: WeeklyMenu) => {
    setWeeklyMenu(newMenu);
    saveWeeklySchedule(newMenu).catch((err) =>
      console.error("Failed to save menu:", err)
    );
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
    updateMenu(newMenu);
  };

  const clearWeeklyMenu = () => {
    const menu: WeeklyMenu = {};
    DAYS_OF_WEEK.forEach((d) => (menu[d] = createEmptyDayMeals()));
    updateMenu(menu);
  };

  const setMealForDay = (
    day: DayOfWeek,
    meal: MealType,
    recipe: Recipe | null
  ) => {
    const newMenu = { ...weeklyMenu };
    newMenu[day] = { ...newMenu[day], [meal]: recipe };
    updateMenu(newMenu);
  };

  const swapMeals = (
    fd: DayOfWeek,
    fm: MealType,
    td: DayOfWeek,
    tm: MealType
  ) => {
    const newMenu = structuredClone(weeklyMenu);
    [newMenu[fd][fm], newMenu[td][tm]] = [newMenu[td][tm], newMenu[fd][fm]];
    updateMenu(newMenu);
  };

  const addShelfItem = async (item: Omit<ShelfItem, "id">) => {
    await addShelfItemDb(item);
    setShelfItems(await fetchShelfItems());
  };

  const removeShelfItem = async (id: string) => {
    await removeShelfItemDb(id);
    setShelfItems(await fetchShelfItems());
  };

  const isOnShelf = (name: string) =>
    shelfItems.some((i) => i.name.toLowerCase() === name.toLowerCase());

  // 👇 CRITICAL NEW FUNCTION
  const getShelfItem = (name: string) => {
    return shelfItems.find((i) => i.name.toLowerCase() === name.toLowerCase());
  };

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
        getShelfItem, // 👈 Don't forget to export it!
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
