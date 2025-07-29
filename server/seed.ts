import { db } from "./db";
import { foods, recipes, users, groceryLists, mealPlans, userProgress } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Clear existing data first
  await db.delete(userProgress);
  await db.delete(mealPlans);
  await db.delete(groceryLists);
  await db.delete(recipes);
  await db.delete(foods);
  await db.delete(users);

  // Seed users
  const user = await db
    .insert(users)
    .values({
      id: "user-1",
      username: "sarah",
      password: "password123", // In real app, this would be hashed
      name: "Sarah Johnson",
      surgeryDate: "2024-03-01",
      dailyFatLimit: "25",
    })
    .returning();

  console.log("Seeded user:", user[0].name);

  // Seed foods
  const foodsData = [
    {
      id: "food-1",
      name: "Chicken Breast",
      category: "Proteins",
      description: "Lean protein, skinless",
      fatPer100g: "3.6",
      caloriesPer100g: 165,
      proteinPer100g: "31",
      carbsPer100g: "0",
      fiberPer100g: "0",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "safe"
    },
    {
      id: "food-2",
      name: "Salmon Fillet",
      category: "Proteins", 
      description: "Rich in omega-3 fatty acids",
      fatPer100g: "13.4",
      caloriesPer100g: 208,
      proteinPer100g: "25",
      carbsPer100g: "0",
      fiberPer100g: "0",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "moderate"
    },
    {
      id: "food-3",
      name: "White Rice",
      category: "Grains",
      description: "Plain, cooked white rice",
      fatPer100g: "0.3",
      caloriesPer100g: 130,
      proteinPer100g: "2.7",
      carbsPer100g: "28",
      fiberPer100g: "0.4",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "safe"
    },
    {
      id: "food-4",
      name: "Banana",
      category: "Fruits",
      description: "Fresh, medium-sized banana",
      fatPer100g: "0.3",
      caloriesPer100g: 89,
      proteinPer100g: "1.1",
      carbsPer100g: "23",
      fiberPer100g: "2.6",
      servingSize: "1 medium",
      servingWeight: 120,
      safetyLevel: "safe"
    },
    {
      id: "food-5",
      name: "Sweet Potato",
      category: "Vegetables",
      description: "Baked sweet potato with skin",
      fatPer100g: "0.1",
      caloriesPer100g: 86,
      proteinPer100g: "1.6",
      carbsPer100g: "20",
      fiberPer100g: "3.0",
      servingSize: "150g",
      servingWeight: 150,
      safetyLevel: "safe"
    },
    {
      id: "food-6",
      name: "Broccoli",
      category: "Vegetables",
      description: "Fresh, steamed broccoli",
      fatPer100g: "0.4",
      caloriesPer100g: 34,
      proteinPer100g: "2.8",
      carbsPer100g: "7",
      fiberPer100g: "2.6",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "safe"
    },
    {
      id: "food-7",
      name: "Spinach",
      category: "Vegetables", 
      description: "Fresh baby spinach leaves",
      fatPer100g: "0.4",
      caloriesPer100g: 23,
      proteinPer100g: "2.9",
      carbsPer100g: "3.6",
      fiberPer100g: "2.2",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "safe"
    },
    {
      id: "food-8",
      name: "Greek Yogurt",
      category: "Dairy",
      description: "Non-fat plain Greek yogurt",
      fatPer100g: "0.4",
      caloriesPer100g: 59,
      proteinPer100g: "10",
      carbsPer100g: "3.6",
      fiberPer100g: "0",
      servingSize: "170g",
      servingWeight: 170,
      safetyLevel: "safe"
    },
    {
      id: "food-9",
      name: "Oatmeal",
      category: "Grains",
      description: "Plain rolled oats, cooked",
      fatPer100g: "1.4",
      caloriesPer100g: 68,
      proteinPer100g: "2.4",
      carbsPer100g: "12",
      fiberPer100g: "1.7",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "safe"
    },
    {
      id: "food-10",
      name: "Cottage Cheese",
      category: "Dairy",
      description: "Low-fat cottage cheese",
      fatPer100g: "1.0",
      caloriesPer100g: 72,
      proteinPer100g: "12",
      carbsPer100g: "4.3",
      fiberPer100g: "0",
      servingSize: "100g",
      servingWeight: 100,
      safetyLevel: "safe"
    }
  ];

  await db.insert(foods).values(foodsData);
  console.log("Seeded", foodsData.length, "foods");

  // Seed recipes
  const recipesData = [
    {
      id: "recipe-1",
      name: "Grilled Chicken with Steamed Vegetables",
      description: "Simple, low-fat meal perfect for early recovery",
      ingredients: [
        { foodId: "food-1", amount: 150, unit: "g" },
        { foodId: "food-6", amount: 100, unit: "g" },
        { foodId: "food-5", amount: 100, unit: "g" }
      ],
      instructions: "1. Season chicken breast with herbs and grill until cooked through.\n2. Steam broccoli and sweet potato until tender.\n3. Serve together with a small amount of olive oil if tolerated.",
      prepTime: 25,
      servings: 1,
      totalFatPerServing: "5.5",
      safetyLevel: "safe",
      tags: ["low-fat", "protein", "vegetables"]
    },
    {
      id: "recipe-2", 
      name: "Banana Oat Breakfast Bowl",
      description: "Gentle breakfast option rich in fiber",
      ingredients: [
        { foodId: "food-9", amount: 100, unit: "g" },
        { foodId: "food-4", amount: 120, unit: "g" },
        { foodId: "food-8", amount: 85, unit: "g" }
      ],
      instructions: "1. Cook oatmeal according to package directions.\n2. Slice banana and mix with Greek yogurt.\n3. Top oatmeal with banana-yogurt mixture.",
      prepTime: 10,
      servings: 1,
      totalFatPerServing: "1.8",
      safetyLevel: "safe",
      tags: ["breakfast", "fiber", "low-fat"]
    }
  ];

  await db.insert(recipes).values(recipesData);
  console.log("Seeded", recipesData.length, "recipes");

  // Seed grocery list
  const groceryListData = {
    id: "grocery-1",
    userId: "user-1",
    name: "Week of March 15",
    weekStartDate: "2024-03-15",
    items: [
      { foodId: "food-1", quantity: 2, unit: "lbs", checked: false, category: "Proteins" },
      { foodId: "food-2", quantity: 1, unit: "lb", checked: false, category: "Proteins" },
      { foodId: "food-10", quantity: 1, unit: "container", checked: false, category: "Proteins" },
      { foodId: "food-6", quantity: 2, unit: "heads", checked: false, category: "Vegetables" },
      { foodId: "food-7", quantity: 1, unit: "bag", checked: false, category: "Vegetables" },
      { foodId: "food-5", quantity: 3, unit: "pieces", checked: false, category: "Vegetables" }
    ],
    isActive: true,
    createdAt: new Date()
  };

  await db.insert(groceryLists).values(groceryListData);
  console.log("Seeded grocery list");

  console.log("Database seeding completed!");
}