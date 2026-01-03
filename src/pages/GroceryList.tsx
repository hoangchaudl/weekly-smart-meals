import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRecipes } from "@/context/RecipeContext";
import { GroceryItem, IngredientCategory, MEAL_TYPES } from "@/types/recipe";
import { Check, Package, Plus, X, Home, AlertCircle } from "lucide-react";
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
  const {
    weeklyMenu,
    shelfItems,
    addShelfItem,
    removeShelfItem,
    getShelfItem,
  } = useRecipes();
  const { toast } = useToast();

  // Inputs
  const [newShelfItem, setNewShelfItem] = useState("");
  const [newShelfAmount, setNewShelfAmount] = useState("");
  const [newShelfUnit, setNewShelfUnit] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const groceryList = useMemo(() => {
    const items: Record<string, GroceryItem> = {};

    Object.values(weeklyMenu).forEach((dayMeals) => {
      MEAL_TYPES.forEach((mealType) => {
        const recipe = dayMeals[mealType];
        if (!recipe) return;

        recipe.ingredients.forEach((ing) => {
          // Use name as key to combine same items (e.g. Chicken 100g + Chicken 50g)
          // We normalize to lowercase to match better
          const key = ing.name.toLowerCase();

          if (items[key]) {
            // If units match, we can sum them up!
            if (items[key].unit === ing.unit) {
              items[key].amount += ing.amount;
            } else {
              // If units differ (e.g. g vs kg), we might need a separate entry or advanced conversion.
              // For simplicity, we create a separate entry if units don't match.
              const complexKey = `${ing.name}-${ing.unit}`;
              if (!items[complexKey]) {
                items[complexKey] = { ...ing, category: ing.category };
              } else {
                items[complexKey].amount += ing.amount;
              }
            }
          } else {
            // Check shelf for this item
            const shelfItem = getShelfItem(ing.name);

            items[key] = {
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              category: ing.category,
              onShelfAmount: shelfItem?.amount,
              onShelfUnit: shelfItem?.unit,
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

    Object.values(items).forEach((item) => {
      grouped[item.category].push(item);
    });

    return grouped;
  }, [weeklyMenu, shelfItems]); // Re-run when shelf changes

  const toggleChecked = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddShelfItem = async () => {
    if (!newShelfItem.trim()) return;
    try {
      await addShelfItem({
        name: newShelfItem.trim(),
        amount: Number(newShelfAmount) || 0,
        unit: newShelfUnit.trim(),
      });
      setNewShelfItem("");
      setNewShelfAmount("");
      setNewShelfUnit("");
      toast({ title: "Updated Shelf Inventory!" });
    } catch (error) {
      toast({ title: "Failed to add item", variant: "destructive" });
    }
  };

  // Helper to calculate status
  const getStatus = (item: GroceryItem) => {
    if (item.onShelfAmount === undefined) return "need"; // Don't have it

    // Perfect Match (Same Unit)
    if (item.unit === item.onShelfUnit) {
      if (item.onShelfAmount >= item.amount) return "have_all"; // Have 150g, need 100g -> OK
      return "have_partial"; // Have 100g, need 150g -> Buy 50g
    }

    // Unit Mismatch (Simple check)
    return "have_unit_mismatch";
  };

  return (
    <MainLayout
      title="Grocery List"
      subtitle="Smart inventory tracking enabled"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {(Object.entries(groceryList) as [IngredientCategory, GroceryItem[]][])
          .filter(([_, items]) => items.length > 0)
          .map(([category, items]) => {
            const config = categoryConfig[category];
            return (
              <div key={category} className="floating-card h-fit">
                <div
                  className={cn(
                    "p-3 rounded-2xl mb-4 flex items-center gap-2",
                    config.bgColor
                  )}
                >
                  <span className="text-xl">{config.emoji}</span>
                  <h3 className="font-bold">{config.label}</h3>
                </div>

                <ul className="space-y-2">
                  {items.map((item) => {
                    const key = `${item.name}-${item.unit}`;
                    const checked = checkedItems[key];
                    const status = getStatus(item);

                    // Math for partials
                    const missingAmount =
                      status === "have_partial"
                        ? item.amount - (item.onShelfAmount || 0)
                        : 0;

                    return (
                      <li
                        key={key}
                        onClick={() => toggleChecked(key)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border border-transparent",
                          checked
                            ? "bg-muted/50 line-through text-muted-foreground"
                            : "hover:bg-white hover:shadow-sm",
                          status === "have_all" &&
                            !checked &&
                            "bg-green-50 border-green-200 opacity-60", // Dim if we have enough
                          status === "have_partial" &&
                            !checked &&
                            "bg-amber-50 border-amber-200" // Warn if partial
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                            checked
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30",
                            status === "have_all" &&
                              !checked &&
                              "bg-green-200 border-green-300" // Green check for owned
                          )}
                        >
                          {(checked || status === "have_all") && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>

                          {/* STATUS BADGES */}
                          {status === "have_all" && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">
                              Have All
                            </span>
                          )}
                          {status === "have_partial" && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-amber-700 font-medium bg-amber-100 px-1.5 rounded-md">
                                Have {item.onShelfAmount}
                                {item.unit}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (Buy {missingAmount}
                                {item.unit})
                              </span>
                            </div>
                          )}
                          {status === "have_unit_mismatch" && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                              Check Shelf ({item.onShelfAmount}
                              {item.onShelfUnit})
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              status === "have_partial" &&
                                "text-destructive font-bold"
                            )}
                          >
                            {item.amount} {item.unit}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>

      {/* 🏠 Smart Shelf Input */}
      <div className="border-t border-dashed border-border pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              My Smart Shelf
            </h2>
            <p className="text-muted-foreground text-sm">
              Track what you have. The list above will update automatically!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Item (e.g. Chicken)"
              value={newShelfItem}
              onChange={(e) => setNewShelfItem(e.target.value)}
              className="h-9 w-40 rounded-xl"
            />
            <Input
              type="number"
              placeholder="Amt"
              value={newShelfAmount}
              onChange={(e) => setNewShelfAmount(e.target.value)}
              className="h-9 w-16 rounded-xl"
            />
            <Input
              placeholder="Unit"
              value={newShelfUnit}
              onChange={(e) => setNewShelfUnit(e.target.value)}
              className="h-9 w-16 rounded-xl"
            />
            <Button
              size="sm"
              onClick={handleAddShelfItem}
              className="rounded-xl h-9"
            >
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Add</span>
            </Button>
          </div>
        </div>

        <div className="bg-white/50 rounded-3xl p-6 border border-white/60 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {shelfItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-white border border-border/50 rounded-full shadow-sm text-sm"
              >
                <span className="font-medium text-foreground/80">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-primary">
                  {item.amount}
                  {item.unit}
                </span>
                <button
                  onClick={() => removeShelfItem(item.id)}
                  className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
