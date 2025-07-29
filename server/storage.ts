import { 
  type Food, type InsertFood,
  type Recipe, type InsertRecipe,
  type MealPlan, type InsertMealPlan,
  type GroceryList, type InsertGroceryList,
  type UserProgress, type InsertUserProgress,
  type User, type InsertUser,
  foods, recipes, mealPlans, groceryLists, userProgress, users
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Food methods
  getAllFoods(): Promise<Food[]>;
  getFoodById(id: string): Promise<Food | undefined>;
  searchFoods(query: string): Promise<Food[]>;
  getFoodsByCategory(category: string): Promise<Food[]>;
  createFood(food: InsertFood): Promise<Food>;

  // Recipe methods
  getAllRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | undefined>;
  getRecipesByTag(tag: string): Promise<Recipe[]>;
  getSafeRecipes(): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;

  // Meal plan methods
  getMealPlanByDate(userId: string, date: string): Promise<MealPlan | undefined>;
  getMealPlansForWeek(userId: string, weekStartDate: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, mealPlan: Partial<MealPlan>): Promise<MealPlan | undefined>;

  // Grocery list methods
  getActiveGroceryList(userId: string): Promise<GroceryList | undefined>;
  getGroceryListById(id: string): Promise<GroceryList | undefined>;
  createGroceryList(groceryList: InsertGroceryList): Promise<GroceryList>;
  updateGroceryList(id: string, groceryList: Partial<GroceryList>): Promise<GroceryList | undefined>;

  // User progress methods
  getUserProgressByDate(userId: string, date: string): Promise<UserProgress | undefined>;
  getUserProgressForWeek(userId: string, weekStartDate: string): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: string, progress: Partial<UserProgress>): Promise<UserProgress | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private foods: Map<string, Food>;
  private recipes: Map<string, Recipe>;
  private mealPlans: Map<string, MealPlan>;
  private groceryLists: Map<string, GroceryList>;
  private userProgress: Map<string, UserProgress>;

  constructor() {
    this.users = new Map();
    this.foods = new Map();
    this.recipes = new Map();
    this.mealPlans = new Map();
    this.groceryLists = new Map();
    this.userProgress = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create default user
    const defaultUser: User = {
      id: "user-1",
      username: "sarah",
      password: "password",
      name: "Sarah",
      surgeryDate: "2024-03-03", // 12 days ago from March 15
      dailyFatLimit: "30"
    };
    this.users.set(defaultUser.id, defaultUser);

    // Initialize foods with comprehensive low-fat options
    const sampleFoods: Food[] = [
      {
        id: "food-1",
        name: "Chicken Breast",
        category: "protein",
        fatPer100g: "3.6",
        caloriesPer100g: 165,
        proteinPer100g: "31.0",
        carbsPer100g: "0.0",
        fiberPer100g: "0.0",
        servingSize: "100g",
        servingWeight: 100,
        safetyLevel: "safe",
        description: "Skinless, boneless chicken breast",
        recoveryNotes: "Excellent lean protein source for recovery"
      },
      {
        id: "food-2",
        name: "White Fish Fillet",
        category: "protein", 
        fatPer100g: "1.3",
        caloriesPer100g: 82,
        proteinPer100g: "18.0",
        carbsPer100g: "0.0",
        fiberPer100g: "0.0",
        servingSize: "100g",
        servingWeight: 100,
        safetyLevel: "safe",
        description: "Cod, tilapia, or similar white fish",
        recoveryNotes: "Very low fat, easy to digest"
      },
      {
        id: "food-3",
        name: "Turkey Breast",
        category: "protein",
        fatPer100g: "2.4",
        caloriesPer100g: 135,
        proteinPer100g: "30.0",
        carbsPer100g: "0.0",
        fiberPer100g: "0.0",
        servingSize: "85g",
        servingWeight: 85,
        safetyLevel: "safe",
        description: "Skinless turkey breast",
        recoveryNotes: "Lean protein, remove all skin"
      },
      {
        id: "food-4",
        name: "Brown Rice",
        category: "grain",
        fatPer100g: "1.8",
        caloriesPer100g: 123,
        proteinPer100g: "2.6",
        carbsPer100g: "25.0",
        fiberPer100g: "1.8",
        servingSize: "1 cup cooked",
        servingWeight: 195,
        safetyLevel: "safe",
        description: "Cooked brown rice",
        recoveryNotes: "Good source of fiber and energy"
      },
      {
        id: "food-5",
        name: "Sweet Potato",
        category: "vegetable",
        fatPer100g: "0.3",
        caloriesPer100g: 103,
        proteinPer100g: "2.3",
        carbsPer100g: "24.0",
        fiberPer100g: "3.0",
        servingSize: "1 medium",
        servingWeight: 200,
        safetyLevel: "safe",
        description: "Baked sweet potato",
        recoveryNotes: "Rich in vitamins, very low fat"
      },
      {
        id: "food-6",
        name: "Broccoli",
        category: "vegetable",
        fatPer100g: "0.4",
        caloriesPer100g: 34,
        proteinPer100g: "2.8",
        carbsPer100g: "7.0",
        fiberPer100g: "2.6",
        servingSize: "1 cup",
        servingWeight: 91,
        safetyLevel: "safe",
        description: "Steamed broccoli",
        recoveryNotes: "High in nutrients, very low fat"
      },
      {
        id: "food-7",
        name: "Green Beans",
        category: "vegetable",
        fatPer100g: "0.1",
        caloriesPer100g: 31,
        proteinPer100g: "1.8",
        carbsPer100g: "7.0",
        fiberPer100g: "3.4",
        servingSize: "1 cup",
        servingWeight: 110,
        safetyLevel: "safe",
        description: "Steamed green beans",
        recoveryNotes: "Excellent low-fat vegetable"
      },
      {
        id: "food-8",
        name: "Oatmeal",
        category: "grain",
        fatPer100g: "6.9",
        caloriesPer100g: 68,
        proteinPer100g: "2.4",
        carbsPer100g: "12.0",
        fiberPer100g: "1.7",
        servingSize: "1 cup cooked",
        servingWeight: 234,
        safetyLevel: "safe",
        description: "Plain oatmeal cooked with water",
        recoveryNotes: "Good breakfast option, use water not milk"
      },
      {
        id: "food-9",
        name: "Banana",
        category: "fruit",
        fatPer100g: "0.3",
        caloriesPer100g: 89,
        proteinPer100g: "1.1",
        carbsPer100g: "23.0",
        fiberPer100g: "2.6",
        servingSize: "1 medium",
        servingWeight: 118,
        safetyLevel: "safe",
        description: "Fresh banana",
        recoveryNotes: "Easy to digest, good for potassium"
      },
      {
        id: "food-10",
        name: "Low-fat Greek Yogurt",
        category: "dairy",
        fatPer100g: "0.4",
        caloriesPer100g: 59,
        proteinPer100g: "10.0",
        carbsPer100g: "3.6",
        fiberPer100g: "0.0",
        servingSize: "1 cup",
        servingWeight: 245,
        safetyLevel: "safe",
        description: "Plain, non-fat Greek yogurt",
        recoveryNotes: "Good protein source, choose non-fat versions"
      },
      {
        id: "food-11",
        name: "Salmon Fillet",
        category: "protein",
        fatPer100g: "13.4",
        caloriesPer100g: 208,
        proteinPer100g: "22.0",
        carbsPer100g: "0.0",
        fiberPer100g: "0.0",
        servingSize: "85g",
        servingWeight: 85,
        safetyLevel: "moderate",
        description: "Atlantic salmon fillet",
        recoveryNotes: "Omega-3 rich but higher in fat, use small portions"
      },
      {
        id: "food-12",
        name: "Avocado",
        category: "fruit",
        fatPer100g: "29.5",
        caloriesPer100g: 322,
        proteinPer100g: "4.0",
        carbsPer100g: "17.0",
        fiberPer100g: "10.0",
        servingSize: "1 medium",
        servingWeight: 200,
        safetyLevel: "avoid",
        description: "Fresh avocado",
        recoveryNotes: "Very high fat content, avoid during early recovery"
      }
    ];

    sampleFoods.forEach(food => this.foods.set(food.id, food));

    // Initialize sample recipes
    const sampleRecipes: Recipe[] = [
      {
        id: "recipe-1",
        name: "Grilled Chicken with Steamed Vegetables",
        description: "Simple, recovery-friendly meal with lean protein and vegetables",
        instructions: "1. Season chicken breast with herbs and spices (no oil)\n2. Grill chicken on non-stick pan\n3. Steam broccoli and green beans\n4. Serve together",
        prepTime: 10,
        cookTime: 20,
        servings: 1,
        totalFatPerServing: "4.2",
        safetyLevel: "safe",
        ingredients: [
          { foodId: "food-1", amount: 100, unit: "g" },
          { foodId: "food-6", amount: 91, unit: "g" },
          { foodId: "food-7", amount: 110, unit: "g" }
        ],
        tags: ["lunch", "dinner", "low-fat", "protein-rich"]
      },
      {
        id: "recipe-2",
        name: "Oatmeal with Berries",
        description: "Nutritious breakfast perfect for recovery",
        instructions: "1. Cook oatmeal with water according to package directions\n2. Top with fresh berries\n3. Add a drizzle of honey if desired",
        prepTime: 5,
        cookTime: 5,
        servings: 1,
        totalFatPerServing: "2.5",
        safetyLevel: "safe",
        ingredients: [
          { foodId: "food-8", amount: 40, unit: "g" },
          { foodId: "food-9", amount: 80, unit: "g" }
        ],
        tags: ["breakfast", "low-fat", "fiber-rich"]
      },
      {
        id: "recipe-3",
        name: "Baked Cod with Sweet Potato",
        description: "Low-fat fish dinner with nutritious sweet potato",
        instructions: "1. Bake cod fillet with herbs and lemon\n2. Bake sweet potato until tender\n3. Steam green beans\n4. Serve together",
        prepTime: 15,
        cookTime: 25,
        servings: 1,
        totalFatPerServing: "8.5",
        safetyLevel: "moderate",
        ingredients: [
          { foodId: "food-2", amount: 150, unit: "g" },
          { foodId: "food-5", amount: 200, unit: "g" },
          { foodId: "food-7", amount: 110, unit: "g" }
        ],
        tags: ["dinner", "low-fat", "omega-3"]
      }
    ];

    sampleRecipes.forEach(recipe => this.recipes.set(recipe.id, recipe));

    // Initialize today's meal plan
    const todayMealPlan: MealPlan = {
      id: "mealplan-1",
      userId: "user-1",
      date: "2024-03-15",
      meals: [
        { type: "breakfast", recipeId: "recipe-2", fatContent: "2.5" },
        { type: "lunch", recipeId: "recipe-1", fatContent: "4.2" },
        { type: "dinner", recipeId: "recipe-3", fatContent: "8.5" }
      ],
      totalFat: "15.2",
      notes: "Good variety today, staying well under limit"
    };

    this.mealPlans.set(todayMealPlan.id, todayMealPlan);

    // Initialize today's progress
    const todayProgress: UserProgress = {
      id: "progress-1",
      userId: "user-1",
      date: "2024-03-15",
      fatIntake: "18.0",
      fatLimit: "30.0",
      recoveryDay: 12,
      notes: "Feeling good today",
      foodsEaten: [
        { foodId: "food-8", amount: 234, mealType: "breakfast" },
        { foodId: "food-9", amount: 80, mealType: "breakfast" },
        { foodId: "food-1", amount: 100, mealType: "lunch" },
        { foodId: "food-6", amount: 91, mealType: "lunch" },
        { foodId: "food-7", amount: 110, mealType: "lunch" }
      ]
    };

    this.userProgress.set(todayProgress.id, todayProgress);

    // Initialize grocery list
    const groceryList: GroceryList = {
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

    this.groceryLists.set(groceryList.id, groceryList);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...update };
    this.users.set(id, updated);
    return updated;
  }

  // Food methods
  async getAllFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async getFoodById(id: string): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async searchFoods(query: string): Promise<Food[]> {
    const foods = Array.from(this.foods.values());
    const lowerQuery = query.toLowerCase();
    return foods.filter(food => 
      food.name.toLowerCase().includes(lowerQuery) ||
      food.description?.toLowerCase().includes(lowerQuery) ||
      food.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getFoodsByCategory(category: string): Promise<Food[]> {
    return Array.from(this.foods.values()).filter(food => food.category === category);
  }

  async createFood(insertFood: InsertFood): Promise<Food> {
    const id = randomUUID();
    const food: Food = { ...insertFood, id };
    this.foods.set(id, food);
    return food;
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipesByTag(tag: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => 
      recipe.tags && Array.isArray(recipe.tags) && recipe.tags.includes(tag)
    );
  }

  async getSafeRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.safetyLevel === "safe");
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { ...insertRecipe, id };
    this.recipes.set(id, recipe);
    return recipe;
  }

  // Meal plan methods
  async getMealPlanByDate(userId: string, date: string): Promise<MealPlan | undefined> {
    return Array.from(this.mealPlans.values()).find(plan => 
      plan.userId === userId && plan.date === date
    );
  }

  async getMealPlansForWeek(userId: string, weekStartDate: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(plan => 
      plan.userId === userId && plan.date >= weekStartDate
    );
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = randomUUID();
    const mealPlan: MealPlan = { ...insertMealPlan, id };
    this.mealPlans.set(id, mealPlan);
    return mealPlan;
  }

  async updateMealPlan(id: string, update: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const existing = this.mealPlans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...update };
    this.mealPlans.set(id, updated);
    return updated;
  }

  // Grocery list methods
  async getActiveGroceryList(userId: string): Promise<GroceryList | undefined> {
    return Array.from(this.groceryLists.values()).find(list => 
      list.userId === userId && list.isActive
    );
  }

  async getGroceryListById(id: string): Promise<GroceryList | undefined> {
    return this.groceryLists.get(id);
  }

  async createGroceryList(insertGroceryList: InsertGroceryList): Promise<GroceryList> {
    const id = randomUUID();
    const groceryList: GroceryList = { ...insertGroceryList, id, createdAt: new Date() };
    this.groceryLists.set(id, groceryList);
    return groceryList;
  }

  async updateGroceryList(id: string, update: Partial<GroceryList>): Promise<GroceryList | undefined> {
    const existing = this.groceryLists.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...update };
    this.groceryLists.set(id, updated);
    return updated;
  }

  // User progress methods
  async getUserProgressByDate(userId: string, date: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(progress => 
      progress.userId === userId && progress.date === date
    );
  }

  async getUserProgressForWeek(userId: string, weekStartDate: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => 
      progress.userId === userId && progress.date >= weekStartDate
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateUserProgress(id: string, update: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const existing = this.userProgress.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...update };
    this.userProgress.set(id, updated);
    return updated;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, update: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Food methods
  async getAllFoods(): Promise<Food[]> {
    return await db.select().from(foods);
  }

  async getFoodById(id: string): Promise<Food | undefined> {
    const [food] = await db.select().from(foods).where(eq(foods.id, id));
    return food || undefined;
  }

  async searchFoods(query: string): Promise<Food[]> {
    return await db.select().from(foods).where(
      ilike(foods.name, `%${query}%`)
    );
  }

  async getFoodsByCategory(category: string): Promise<Food[]> {
    return await db.select().from(foods).where(eq(foods.category, category));
  }

  async createFood(insertFood: InsertFood): Promise<Food> {
    const [food] = await db
      .insert(foods)
      .values(insertFood)
      .returning();
    return food;
  }

  // Recipe methods
  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async getRecipesByTag(tag: string): Promise<Recipe[]> {
    // This would need a more complex query for JSONB array contains
    const allRecipes = await db.select().from(recipes);
    return allRecipes.filter(recipe => 
      recipe.tags && Array.isArray(recipe.tags) && recipe.tags.includes(tag)
    );
  }

  async getSafeRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes).where(eq(recipes.safetyLevel, "safe"));
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db
      .insert(recipes)
      .values(insertRecipe)
      .returning();
    return recipe;
  }

  // Meal plan methods
  async getMealPlanByDate(userId: string, date: string): Promise<MealPlan | undefined> {
    const [mealPlan] = await db.select().from(mealPlans).where(
      and(eq(mealPlans.userId, userId), eq(mealPlans.date, date))
    );
    return mealPlan || undefined;
  }

  async getMealPlansForWeek(userId: string, weekStartDate: string): Promise<MealPlan[]> {
    return await db.select().from(mealPlans).where(
      and(eq(mealPlans.userId, userId))
    );
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const [mealPlan] = await db
      .insert(mealPlans)
      .values(insertMealPlan)
      .returning();
    return mealPlan;
  }

  async updateMealPlan(id: string, update: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set(update)
      .where(eq(mealPlans.id, id))
      .returning();
    return mealPlan || undefined;
  }

  // Grocery list methods
  async getActiveGroceryList(userId: string): Promise<GroceryList | undefined> {
    const [groceryList] = await db.select().from(groceryLists).where(
      and(eq(groceryLists.userId, userId), eq(groceryLists.isActive, true))
    );
    return groceryList || undefined;
  }

  async getGroceryListById(id: string): Promise<GroceryList | undefined> {
    const [groceryList] = await db.select().from(groceryLists).where(eq(groceryLists.id, id));
    return groceryList || undefined;
  }

  async createGroceryList(insertGroceryList: InsertGroceryList): Promise<GroceryList> {
    const [groceryList] = await db
      .insert(groceryLists)
      .values(insertGroceryList)
      .returning();
    return groceryList;
  }

  async updateGroceryList(id: string, update: Partial<GroceryList>): Promise<GroceryList | undefined> {
    const [groceryList] = await db
      .update(groceryLists)
      .set(update)
      .where(eq(groceryLists.id, id))
      .returning();
    return groceryList || undefined;
  }

  // User progress methods
  async getUserProgressByDate(userId: string, date: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(
      and(eq(userProgress.userId, userId), eq(userProgress.date, date))
    );
    return progress || undefined;
  }

  async getUserProgressForWeek(userId: string, weekStartDate: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(
      eq(userProgress.userId, userId)
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateUserProgress(id: string, update: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [progress] = await db
      .update(userProgress)
      .set(update)
      .where(eq(userProgress.id, id))
      .returning();
    return progress || undefined;
  }
}

export const storage = new DatabaseStorage();
