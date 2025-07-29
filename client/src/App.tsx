import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MealPlanner from "@/pages/meal-planner";
import FoodSearch from "@/pages/food-search";
import GroceryList from "@/pages/grocery-list";
import Recipes from "@/pages/recipes";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/meal-planner" component={MealPlanner} />
      <Route path="/food-search" component={FoodSearch} />
      <Route path="/grocery-list" component={GroceryList} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
