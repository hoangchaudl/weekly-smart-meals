import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRecipes } from "@/context/RecipeContext";
import { IngredientCategory, MEAL_TYPES, GroceryItem } from "@/types/recipe";
import { Check, Plus, X, Home } from "lucide-react";
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
  protein: { label: "Protein", emoji: "🥩", bgColor: "bg-accent/30" },
  seasonings: { label: "Seasonings", emoji: "🧂", bgColor: "bg-secondary/50" },
  others: { label: "Others", emoji: "📦", bgColor: "bg-info/30" },
};

// Local type to handle merged quantities
interface MergedGroceryItem {
  name: string;
  category: IngredientCategory;
  quantities: { amount: number; unit: string }[];
  onShelfAmount?: number;
  onShelfUnit?: string;
}

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
    const items: Record<string, MergedGroceryItem> = {};

    Object.values(weeklyMenu).forEach((dayMeals) => {
      MEAL_TYPES.forEach((mealType) => {
        const recipe = dayMeals[mealType];
        if (!recipe) return;

        recipe.ingredients.forEach((ing) => {
          // Normalize name and unit
          const cleanName = ing.name.trim();
          const cleanUnit = ing.unit.trim().toLowerCase();
          const key = cleanName.toLowerCase();

          if (!items[key]) {
            // New entry
            const shelfItem = getShelfItem(cleanName);
            items[key] = {
              name: cleanName,
              category: ing.category,
              quantities: [{ amount: ing.amount, unit: cleanUnit }],
              onShelfAmount: shelfItem?.amount,
              onShelfUnit: shelfItem?.unit,
            };
          } else {
            // Existing entry - try to merge amounts if unit matches
            const existingQtyIndex = items[key].quantities.findIndex(
              (q) => q.unit === cleanUnit
            );

            if (existingQtyIndex >= 0) {
              items[key].quantities[existingQtyIndex].amount += ing.amount;
            } else {
              items[key].quantities.push({
                amount: ing.amount,
                unit: cleanUnit,
              });
            }
          }
        });
      });
    });

    const grouped = {
      vegetables_fruits: [],
      protein: [],
      seasonings: [],
      others: [],
    } as Record<IngredientCategory, MergedGroceryItem[]>;

    Object.values(items).forEach((item) => {
      const category = item.category || "others";
      if (grouped[category]) {
        grouped[category].push(item);
      } else {
        grouped.others.push(item);
      }
    });

    return grouped;
  }, [weeklyMenu, shelfItems, getShelfItem]);

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

  // Helper to calculate status for merged items
  const getStatus = (item: MergedGroceryItem) => {
    if (item.onShelfAmount === undefined) return "need"; // Don't have it on shelf

    // If we have multiple different units (e.g. kg and lbs), logic gets hard.
    // We will check the first matching unit we find.
    for (const qty of item.quantities) {
      if (qty.unit === item.onShelfUnit) {
        if (item.onShelfAmount >= qty.amount) return "have_all";
        return "have_partial";
      }
    }

    return "have_unit_mismatch";
  };

  return (
    <MainLayout
      title="Grocery List"
      subtitle="Smart inventory tracking enabled"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {(
          Object.entries(groceryList) as [
            IngredientCategory,
            MergedGroceryItem[]
          ][]
        )
          .filter(([_, items]) => items.length > 0)
          .map(([category, items]) => {
            const config = categoryConfig[category];

            // SORTING LOGIC: Unchecked first, Checked last
            const sortedItems = [...items].sort((a, b) => {
              // We use the normalized name as the key
              const keyA = a.name.toLowerCase();
              const keyB = b.name.toLowerCase();
              const checkedA = !!checkedItems[keyA];
              const checkedB = !!checkedItems[keyB];

              if (checkedA === checkedB) return 0; // Maintain order if same status
              return checkedA ? 1 : -1; // If A is checked, it goes after B
            });

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
                  {sortedItems.map((item) => {
                    // Key is now just the name, since we merged units
                    const key = item.name.toLowerCase();
                    const checked = checkedItems[key];
                    const status = getStatus(item);

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
                            "bg-green-50 border-green-200 opacity-60",
                          status === "have_partial" &&
                            !checked &&
                            "bg-amber-50 border-amber-200"
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
                              "bg-green-200 border-green-300"
                          )}
                        >
                          {(checked || status === "have_all") && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <span className="font-medium capitalize">
                            {item.name}
                          </span>

                          {/* STATUS BADGES */}
                          {status === "have_all" && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">
                              Have All
                            </span>
                          )}
                          {status === "have_partial" && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-amber-700 font-medium bg-amber-100 px-1.5 rounded-md">
                                Have {item.onShelfAmount} {item.onShelfUnit}
                              </span>
                            </div>
                          )}
                          {status === "have_unit_mismatch" && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                              Check Shelf ({item.onShelfAmount}{" "}
                              {item.onShelfUnit})
                            </span>
                          )}
                        </div>

                        <div className="text-right flex flex-col items-end">
                          {/* Render all merged quantities */}
                          {item.quantities.map((q, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "text-sm font-medium whitespace-nowrap",
                                status === "have_partial" &&
                                  "text-destructive font-bold"
                              )}
                            >
                              {idx > 0 && (
                                <span className="text-muted-foreground mx-1">
                                  +
                                </span>
                              )}
                              {q.amount} {q.unit}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>

      {/* 📦 Smart Shelf Input */}
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
                  {item.amount} {item.unit}
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
