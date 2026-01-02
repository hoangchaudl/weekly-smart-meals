import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import { useRecipes } from '@/context/RecipeContext';
import { Ingredient, IngredientCategory, StorageType, Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

interface AddRecipeModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddRecipeModal({ open, onClose }: AddRecipeModalProps) {
  const { addRecipe } = useRecipes();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [prepTime, setPrepTime] = useState(30);
  const [batchServings, setBatchServings] = useState(4);
  const [storageType, setStorageType] = useState<StorageType>('fridge');
  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id'>[]>([
    { name: '', amount: 0, unit: 'g', category: 'vegetables_fruits' }
  ]);
  const [steps, setSteps] = useState<string[]>(['']);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 0, unit: 'g', category: 'vegetables_fruits' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Omit<Ingredient, 'id'>, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
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
    if (!name.trim()) {
      toast({ title: 'Please enter a dish name', variant: 'destructive' });
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim() && i.amount > 0);
    if (validIngredients.length === 0) {
      toast({ title: 'Please add at least one ingredient', variant: 'destructive' });
      return;
    }

    const validSteps = steps.filter(s => s.trim());
    if (validSteps.length === 0) {
      toast({ title: 'Please add at least one cooking step', variant: 'destructive' });
      return;
    }

    const recipe: Omit<Recipe, 'id'> = {
      name: name.trim(),
      prepTime,
      batchServings,
      storageType,
      ingredients: validIngredients.map((ing, i) => ({ ...ing, id: `new-${i}` })),
      steps: validSteps,
    };

    addRecipe(recipe);
    toast({ title: '🎉 Recipe added successfully!' });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setPrepTime(30);
    setBatchServings(4);
    setStorageType('fridge');
    setIngredients([{ name: '', amount: 0, unit: 'g', category: 'vegetables_fruits' }]);
    setSteps(['']);
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
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-sm font-medium">Dish Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lemon Herb Chicken"
                className="mt-1.5 rounded-xl border-border"
              />
            </div>
            
            <div>
              <Label htmlFor="prepTime" className="text-sm font-medium">Prep Time (min)</Label>
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
              <Label htmlFor="servings" className="text-sm font-medium">Batch Servings</Label>
              <Input
                id="servings"
                type="number"
                value={batchServings}
                onChange={(e) => setBatchServings(Number(e.target.value))}
                min={1}
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-sm font-medium">Storage Type</Label>
              <Select value={storageType} onValueChange={(v) => setStorageType(v as StorageType)}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fridge">🧊 Fridge (3-4 days)</SelectItem>
                  <SelectItem value="freezer">❄️ Freezer (2-3 weeks)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Ingredients</Label>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="flex-1 rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="Amt"
                    value={ing.amount || ''}
                    onChange={(e) => handleIngredientChange(index, 'amount', Number(e.target.value))}
                    className="w-20 rounded-xl"
                  />
                  <Input
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="w-16 rounded-xl"
                  />
                  <Select
                    value={ing.category}
                    onValueChange={(v) => handleIngredientChange(index, 'category', v as IngredientCategory)}
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
            <Label className="text-sm font-medium mb-3 block">Cooking Steps</Label>
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
            <Button variant="outline" onClick={onClose} className="rounded-full px-6">
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
