import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useRecipes } from "@/context/RecipeContext";
import {
  Ingredient,
  IngredientCategory,
  StorageType,
  Recipe,
  MealType,
  mealTypeConfig,
} from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";

interface EditRecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function EditRecipeModal({
  recipe,
  open,
  onClose,
}: EditRecipeModalProps) {
  const { updateRecipe } = useRecipes();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState(30);
  const [batchServings, setBatchServings] = useState(4);
  const [storageType, setStorageType] = useState<StorageType>("fridge");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [instructionVideoUrl, setInstructionVideoUrl] = useState("");

  // Populate form when recipe changes
  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setPrepTime(recipe.prepTime);
      setBatchServings(recipe.batchServings);
      setStorageType(recipe.storageType);
      setMealType(recipe.mealType);
      setIngredients([...recipe.ingredients]);
      setSteps([...recipe.steps]);
      setInstructionVideoUrl(recipe.instructionVideoUrl || "");
    }
  }, [recipe]);

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: `new-${Date.now()}`,
        name: "",
        amount: 0,
        unit: "g",
        category: "vegetables_fruits",
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = () => {
    if (!recipe) return;

    if (!name.trim()) {
      toast({ title: "Please enter a dish name", variant: "destructive" });
      return;
    }

    const validIngredients = ingredients.filter(
      (i) => i.name.trim() && i.amount > 0
    );
    if (validIngredients.length === 0) {
      toast({
        title: "Please add at least one ingredient",
        variant: "destructive",
      });
      return;
    }

    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      toast({
        title: "Please add at least one cooking step",
        variant: "destructive",
      });
      return;
    }

    const updatedRecipe: Recipe = {
      id: recipe.id,
      name: name.trim(),
      prepTime,
      batchServings,
      storageType,
      mealType,
      ingredients: validIngredients,
      steps: validSteps,
      instructionVideoUrl: instructionVideoUrl.trim() || undefined, // ✅ ADD
    };

    updateRecipe(updatedRecipe);
    toast({ title: "✅ Recipe updated successfully!" });
    onClose();
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-0 shadow-float rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
            <span>✏️</span> Edit Dish
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Dish Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lemon Herb Chicken"
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div>
              <Label htmlFor="prepTime" className="text-sm font-medium">
                Prep Time (min)
              </Label>
              <Input
                id="prepTime"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                min={1}
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div>
              <Label htmlFor="servings" className="text-sm font-medium">
                Batch Servings
              </Label>
              <Input
                id="servings"
                type="number"
                value={batchServings}
                onChange={(e) => setBatchServings(Number(e.target.value))}
                min={1}
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Meal Type</Label>
              <Select
                value={mealType}
                onValueChange={(v) => setMealType(v as MealType)}
              >
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(mealTypeConfig) as [
                      MealType,
                      { label: string; emoji: string }
                    ][]
                  ).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      {config.emoji} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Storage Type</Label>
              <Select
                value={storageType}
                onValueChange={(v) => setStorageType(v as StorageType)}
              >
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fridge">🧊 Fridge (3-4 days)</SelectItem>
                  <SelectItem value="freezer">
                    ❄️ Freezer (2-3 weeks)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Ingredients
            </Label>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={ing.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={ing.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    className="flex-1 rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="Amt"
                    value={ing.amount || ""}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "amount",
                        Number(e.target.value)
                      )
                    }
                    className="w-20 rounded-xl"
                  />
                  <Input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    className="w-16 rounded-xl"
                  />
                  <Select
                    value={ing.category}
                    onValueChange={(v) =>
                      handleIngredientChange(
                        index,
                        "category",
                        v as IngredientCategory
                      )
                    }
                  >
                    <SelectTrigger className="w-28 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables_fruits">🥦 Veg</SelectItem>
                      <SelectItem value="protein">🍗 Protein</SelectItem>
                      <SelectItem value="seasonings">🧂 Season</SelectItem>
                      <SelectItem value="others">📦 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(index)}
                    className="rounded-xl text-muted-foreground hover:text-destructive"
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
              className="mt-2 rounded-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Ingredient
            </Button>
          </div>

          {/* Steps */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Cooking Steps
            </Label>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <Input
                    placeholder={`Step ${index + 1}...`}
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="flex-1 rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStep(index)}
                    className="rounded-xl text-muted-foreground hover:text-destructive"
                    disabled={steps.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              className="mt-2 rounded-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </div>
          {/* 🎬 Instruction Video */}
          <div>
            <Label className="text-sm font-medium">
              Instruction Video (optional)
            </Label>
            <Input
              placeholder="YouTube / Instagram / mp4 link..."
              value={instructionVideoUrl}
              onChange={(e) => setInstructionVideoUrl(e.target.value)}
              className="mt-1.5 rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports YouTube, Instagram Reels, or direct video links.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="btn-primary">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
