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
import { useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Profile from "./pages/Profile";
const queryClient = new QueryClient();

// 1. I removed <BrowserRouter> from here because we moved it up!
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MyDishes />} />
    <Route path="/weekly-menu" element={<WeeklyMenu />} />
    <Route path="/grocery-list" element={<GroceryList />} />
    <Route path="/meal-prep" element={<MealPrep />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const { session } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* 2. I moved <BrowserRouter> here so it wraps EVERYTHING */}
        <BrowserRouter>
          {/* 🔐 AUTH GATE */}
          {!session ? (
            <Login />
          ) : (
            <RecipeProvider>
              <AppRoutes />
            </RecipeProvider>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
