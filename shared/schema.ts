import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foods = pgTable("foods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // protein, vegetable, fruit, grain, dairy, etc.
  fatPer100g: decimal("fat_per_100g", { precision: 5, scale: 2 }).notNull(),
  caloriesPer100g: integer("calories_per_100g").notNull(),
  proteinPer100g: decimal("protein_per_100g", { precision: 5, scale: 2 }).notNull(),
  carbsPer100g: decimal("carbs_per_100g", { precision: 5, scale: 2 }).notNull(),
  fiberPer100g: decimal("fiber_per_100g", { precision: 5, scale: 2 }).notNull(),
  servingSize: text("serving_size").notNull(), // e.g., "100g", "1 cup", "1 medium"
  servingWeight: integer("serving_weight").notNull(), // weight in grams
  safetyLevel: text("safety_level").notNull(), // safe, moderate, avoid
  description: text("description"),
  recoveryNotes: text("recovery_notes"), // specific notes for gallbladder recovery
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions").notNull(),
  prepTime: integer("prep_time"), // minutes
  cookTime: integer("cook_time"), // minutes
  servings: integer("servings").notNull(),
  totalFatPerServing: decimal("total_fat_per_serving", { precision: 5, scale: 2 }).notNull(),
  safetyLevel: text("safety_level").notNull(), // safe, moderate, avoid
  ingredients: jsonb("ingredients").notNull(), // array of {foodId, amount, unit}
  tags: jsonb("tags"), // array of strings like "breakfast", "low-fat", "protein-rich"
});

export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  meals: jsonb("meals").notNull(), // array of {type: breakfast/lunch/dinner/snack, recipeId?, customMeal?, fatContent}
  totalFat: decimal("total_fat", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
});

export const groceryLists = pgTable("grocery_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  weekStartDate: text("week_start_date").notNull(), // YYYY-MM-DD format
  items: jsonb("items").notNull(), // array of {foodId, quantity, unit, checked, category}
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  fatIntake: decimal("fat_intake", { precision: 5, scale: 2 }).notNull(),
  fatLimit: decimal("fat_limit", { precision: 5, scale: 2 }).notNull().default("30"), // daily fat limit
  recoveryDay: integer("recovery_day").notNull(), // days since surgery
  notes: text("notes"),
  foodsEaten: jsonb("foods_eaten"), // array of {foodId, amount, mealType}
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  surgeryDate: text("surgery_date"), // YYYY-MM-DD format
  dailyFatLimit: decimal("daily_fat_limit", { precision: 5, scale: 2 }).default("30"),
});

// Insert schemas
export const insertFoodSchema = createInsertSchema(foods).omit({ id: true });
export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true });
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true });
export const insertGroceryListSchema = createInsertSchema(groceryLists).omit({ id: true, createdAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

// Types
export type Food = typeof foods.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type GroceryList = typeof groceryLists.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type User = typeof users.$inferSelect;

export type InsertFood = z.infer<typeof insertFoodSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type InsertGroceryList = z.infer<typeof insertGroceryListSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
