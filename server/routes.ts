import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoodSchema, insertRecipeSchema, insertMealPlanSchema, insertGroceryListSchema, insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Food routes
  app.get("/api/foods", async (req, res) => {
    try {
      const foods = await storage.getAllFoods();
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch foods" });
    }
  });

  app.get("/api/foods/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const foods = await storage.searchFoods(q);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  app.get("/api/foods/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const foods = await storage.getFoodsByCategory(category);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch foods by category" });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const food = await storage.getFoodById(id);
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food" });
    }
  });

  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/safe", async (req, res) => {
    try {
      const recipes = await storage.getSafeRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe recipes" });
    }
  });

  app.get("/api/recipes/tag/:tag", async (req, res) => {
    try {
      const { tag } = req.params;
      const recipes = await storage.getRecipesByTag(tag);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes by tag" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recipe = await storage.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  // Meal plan routes
  app.get("/api/meal-plans/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const mealPlan = await storage.getMealPlanByDate(userId, date);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plan" });
    }
  });

  app.get("/api/meal-plans/:userId/week/:weekStartDate", async (req, res) => {
    try {
      const { userId, weekStartDate } = req.params;
      const mealPlans = await storage.getMealPlansForWeek(userId, weekStartDate);
      res.json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const validatedData = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(validatedData);
      res.status(201).json(mealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  app.patch("/api/meal-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const mealPlan = await storage.updateMealPlan(id, req.body);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meal plan" });
    }
  });

  // Grocery list routes
  app.get("/api/grocery-lists/:userId/active", async (req, res) => {
    try {
      const { userId } = req.params;
      const groceryList = await storage.getActiveGroceryList(userId);
      if (!groceryList) {
        return res.status(404).json({ message: "No active grocery list found" });
      }
      res.json(groceryList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grocery list" });
    }
  });

  app.get("/api/grocery-lists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const groceryList = await storage.getGroceryListById(id);
      if (!groceryList) {
        return res.status(404).json({ message: "Grocery list not found" });
      }
      res.json(groceryList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grocery list" });
    }
  });

  app.post("/api/grocery-lists", async (req, res) => {
    try {
      const validatedData = insertGroceryListSchema.parse(req.body);
      const groceryList = await storage.createGroceryList(validatedData);
      res.status(201).json(groceryList);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid grocery list data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create grocery list" });
    }
  });

  app.patch("/api/grocery-lists/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const groceryList = await storage.updateGroceryList(id, req.body);
      if (!groceryList) {
        return res.status(404).json({ message: "Grocery list not found" });
      }
      res.json(groceryList);
    } catch (error) {
      res.status(500).json({ message: "Failed to update grocery list" });
    }
  });

  // User progress routes
  app.get("/api/progress/:userId/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const progress = await storage.getUserProgressByDate(userId, date);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get("/api/progress/:userId/week/:weekStartDate", async (req, res) => {
    try {
      const { userId, weekStartDate } = req.params;
      const progress = await storage.getUserProgressForWeek(userId, weekStartDate);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createUserProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  app.patch("/api/progress/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await storage.updateUserProgress(id, req.body);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
