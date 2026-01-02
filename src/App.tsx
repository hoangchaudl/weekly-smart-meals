import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RecipeProvider } from "@/context/RecipeContext";
import MyDishes from "./pages/MyDishes";
import WeeklyMenu from "./pages/WeeklyMenu";
import GroceryList from "./pages/GroceryList";
import MealPrep from "./pages/MealPrep";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RecipeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MyDishes />} />
            <Route path="/weekly-menu" element={<WeeklyMenu />} />
            <Route path="/grocery-list" element={<GroceryList />} />
            <Route path="/meal-prep" element={<MealPrep />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RecipeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
