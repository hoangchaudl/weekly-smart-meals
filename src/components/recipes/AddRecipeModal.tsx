import { useState, useRef } from "react";
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
import { Plus, Trash2, Camera, Loader2, AlertCircle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AddRecipeModalProps {
  open: boolean;
  onClose: () => void;
}

interface ExtractedConfidence {
  name?: "high" | "medium" | "low";
  ingredients?: "high" | "medium" | "low";
  steps?: "high" | "medium" | "low";
}

export function AddRecipeModal({ open, onClose }: AddRecipeModalProps) {
  const { addRecipe } = useRecipes();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [instructionVideoUrl, setInstructionVideoUrl] = useState("");

  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState(30);
  const [batchServings, setBatchServings] = useState(4);
  const [storageType, setStorageType] = useState<StorageType>("fridge");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [ingredients, setIngredients] = useState<Omit<Ingredient, "id">[]>([
    { name: "", amount: 0, unit: "g", category: "vegetables_fruits" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [confidence, setConfidence] = useState<ExtractedConfidence | null>(
    null
  );

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", amount: 0, unit: "g", category: "vegetables_fruits" },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Omit<Ingredient, "id">,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await extractRecipeFromImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const extractRecipeFromImage = async (imageBase64: string) => {
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "extract-recipe",
        {
          body: { imageBase64 },
        }
      );

      if (error) {
        console.error("Error extracting recipe:", error);
        toast({
          title: "Failed to extract recipe",
          description: error.message || "Please try again or enter manually",
          variant: "destructive",
        });
        return;
      }

      if (data?.recipe) {
        const recipe = data.recipe;
        setName(recipe.name || "");
        setPrepTime(recipe.prepTime || 30);
        setBatchServings(recipe.batchServings || 4);
        setStorageType(recipe.storageType || "fridge");
        setMealType(recipe.mealType || "dinner");

        if (recipe.ingredients?.length > 0) {
          setIngredients(
            recipe.ingredients.map((ing: any) => ({
              name: ing.name || "",
              amount: ing.amount || 0,
              unit: ing.unit || "g",
              category: ing.category || "others",
            }))
          );
        }

        if (recipe.steps?.length > 0) {
          setSteps(recipe.steps);
        }

        if (recipe.confidence) {
          setConfidence(recipe.confidence);
        }

        toast({
          title: "✨ Recipe extracted! Please review and edit as needed.",
        });
      }
    } catch (err) {
      console.error("Extraction error:", err);
      toast({
        title: "Error processing image",
        description: "Please try a clearer image or enter manually",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // --- UPDATED FUNCTION START ---
  const handleSubmit = async () => {
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

    const recipe: Omit<Recipe, "id"> = {
      name: name.trim(),
      prepTime,
      batchServings,
      storageType,
      mealType,
      ingredients: validIngredients.map((ing, i) => ({
        ...ing,
        id: `new-${i}`,
      })),
      steps: validSteps,
      instructionVideoUrl: instructionVideoUrl.trim() || undefined,
    };

    try {
      // Wait for the database operation to finish
      await addRecipe(recipe);

      // If successful, show success toast
      toast({ title: "🎉 Recipe added successfully!" });
      handleReset();
      onClose();
    } catch (error) {
      // If error, show the real error message
      console.error("Add Recipe Error:", error);
      toast({
        title: "Failed to save recipe",
        description:
          (error as Error).message || "Please check your permissions.",
        variant: "destructive",
      });
    }
  };
  // --- UPDATED FUNCTION END ---

  const handleReset = () => {
    setName("");
    setPrepTime(30);
    setBatchServings(4);
    setStorageType("fridge");
    setMealType("dinner");
    setIngredients([
      { name: "", amount: 0, unit: "g", category: "vegetables_fruits" },
    ]);
    setSteps([""]);
    setConfidence(null);
    setInstructionVideoUrl("");
  };

  const getConfidenceColor = (level?: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "text-primary";
      case "medium":
        return "text-secondary-foreground";
      case "low":
        return "text-destructive";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-0 shadow-float rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
            <span>✨</span> Add New Dish
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Smart Import Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/20 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">📸 Smart Import</h4>
                <p className="text-xs text-muted-foreground">
                  Upload a photo of a recipe to auto-fill all fields
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="rounded-full gap-2"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Confidence indicator */}
          {confidence && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>AI Confidence:</span>
              <span
                className={cn(
                  "font-medium",
                  getConfidenceColor(confidence.name)
                )}
              >
                Name: {confidence.name}
              </span>
              <span>•</span>
              <span
                className={cn(
                  "font-medium",
                  getConfidenceColor(confidence.ingredients)
                )}
              >
                Ingredients: {confidence.ingredients}
              </span>
              <span>•</span>
              <span
                className={cn(
                  "font-medium",
                  getConfidenceColor(confidence.steps)
                )}
              >
                Steps: {confidence.steps}
              </span>
            </div>
          )}

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
                className={cn(
                  "mt-1.5 rounded-xl border-border",
                  confidence?.name === "low" && "ring-2 ring-destructive/50"
                )}
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
            <div className="col-span-2">
              <Label className="text-sm font-medium">
                Instruction Video URL (optional)
              </Label>
              <Input
                placeholder="YouTube or .mp4/.webm link"
                value={instructionVideoUrl}
                onChange={(e) => setInstructionVideoUrl(e.target.value)}
                className="mt-1.5 rounded-xl border-border"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <Label
              className={cn(
                "text-sm font-medium mb-3 block",
                confidence?.ingredients === "low" && "text-destructive"
              )}
            >
              Ingredients {confidence?.ingredients === "low" && "⚠️"}
            </Label>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-center">
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
            <Label
              className={cn(
                "text-sm font-medium mb-3 block",
                confidence?.steps === "low" && "text-destructive"
              )}
            >
              Cooking Steps {confidence?.steps === "low" && "⚠️"}
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
              Save Dish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
