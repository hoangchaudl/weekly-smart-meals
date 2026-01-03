import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Recipe } from '@/types/recipe';

interface DeleteConfirmModalProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ recipe, open, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!recipe) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-0 shadow-float rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-display font-bold flex items-center gap-2">
            <span>🗑️</span> Delete Recipe?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{recipe.name}"</span>? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="rounded-full px-6">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
