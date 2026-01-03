import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRecipes } from "@/context/RecipeContext";
import { GroceryItem, IngredientCategory, MEAL_TYPES } from "@/types/recipe";
import {
  ShoppingCart,
  Check,
  Copy,
  Leaf,
  Drumstick,
  Sparkles,
  Package,
  Plus,
  X,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categoryConfig = {
  vegetables_fruits: {
    label: "Vegetables & Fruits",
    emoji: "🥦",
    bgColor: "bg-primary/20",
  },
  protein: { label: "Protein", emoji: "🍗", bgColor: "bg-accent/30" },
  seasonings: { label: "Seasonings", emoji: "🧂", bgColor: "bg-secondary/50" },
  others: { label: "Others", emoji: "📦", bgColor: "bg-info/30" },
};

export default function GroceryList() {
  const { weeklyMenu, shelfItems, addShelfItem, removeShelfItem, isOnShelf } =
    useRecipes();
  const { toast } = useToast();
  const [newShelfItem, setNewShelfItem] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({}); // ✅ NEW

  const groceryList = useMemo(() => {
    const items: Record<string, GroceryItem> = {};

    Object.values(weeklyMenu).forEach((dayMeals) => {
      MEAL_TYPES.forEach((mealType) => {
        const recipe = dayMeals[mealType];
        if (!recipe) return;

        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name}-${ing.unit}`;
          if (!items[key]) {
            items[key] = {
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              category: ing.category,
              onShelf: isOnShelf(ing.name),
            };
          }
        });
      });
    });

    const grouped = {
      vegetables_fruits: [],
      protein: [],
      seasonings: [],
      others: [],
    } as Record<IngredientCategory, GroceryItem[]>;

    Object.values(items).forEach((item) => grouped[item.category].push(item));
    return grouped;
  }, [weeklyMenu, isOnShelf]);

  const toggleChecked = (item: GroceryItem) => {
    const key = `${item.name}-${item.unit}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <MainLayout
      title="Grocery List"
      subtitle="Tap items to cross-check while shopping"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.entries(groceryList) as [IngredientCategory, GroceryItem[]][])
          .filter(([_, items]) => items.length > 0)
          .map(([category, items]) => {
            const config = categoryConfig[category];
            return (
              <div key={category} className="floating-card">
                <div className={cn("p-3 rounded-2xl mb-4", config.bgColor)}>
                  <h3 className="font-bold">{config.label}</h3>
                </div>

                <ul className="space-y-2">
                  {items.map((item) => {
                    const key = `${item.name}-${item.unit}`;
                    const checked = checkedItems[key];

                    return (
                      <li
                        key={key}
                        onClick={() => toggleChecked(item)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition",
                          checked
                            ? "bg-primary/20 line-through text-muted-foreground"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            checked
                              ? "bg-primary border-primary"
                              : "border-border"
                          )}
                        >
                          {checked && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>

                        <span className="flex-1 font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-sm">
                          {item.amount} {item.unit}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>
    </MainLayout>
  );
}
