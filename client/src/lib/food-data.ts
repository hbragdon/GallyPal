import type { Food, Recipe, UserProgress } from "@shared/schema";

// Fat content safety levels based on grams per serving
export const FAT_SAFETY_LEVELS = {
  SAFE: { min: 0, max: 5, label: 'safe' },
  MODERATE: { min: 5, max: 15, label: 'moderate' },
  AVOID: { min: 15, max: Infinity, label: 'avoid' }
} as const;

// Daily fat limit recommendations for gallbladder recovery
export const DAILY_FAT_LIMITS = {
  EARLY_RECOVERY: 20, // First 2-4 weeks
  MID_RECOVERY: 30,   // 1-3 months
  LATE_RECOVERY: 40   // 3+ months
} as const;

/**
 * Determines the safety level of a food based on its fat content
 */
export function getFoodSafetyLevel(fatContentPer100g: number, servingWeight: number = 100): 'safe' | 'moderate' | 'avoid' {
  const fatPerServing = (fatContentPer100g * servingWeight) / 100;
  
  if (fatPerServing <= FAT_SAFETY_LEVELS.SAFE.max) {
    return 'safe';
  } else if (fatPerServing <= FAT_SAFETY_LEVELS.MODERATE.max) {
    return 'moderate';
  } else {
    return 'avoid';
  }
}

/**
 * Calculates the total fat content for a recipe based on its ingredients
 */
export function calculateRecipeFatContent(ingredients: any[], foods: Food[], servings: number = 1): number {
  let totalFat = 0;
  
  ingredients.forEach(ingredient => {
    const food = foods.find(f => f.id === ingredient.foodId);
    if (food) {
      const fatPer100g = parseFloat(food.fatPer100g);
      const ingredientFat = (fatPer100g * ingredient.amount) / 100;
      totalFat += ingredientFat;
    }
  });
  
  return Math.round((totalFat / servings) * 100) / 100; // Round to 2 decimal places
}

/**
 * Gets the appropriate daily fat limit based on recovery stage
 */
export function getDailyFatLimit(recoveryDay: number): number {
  if (recoveryDay <= 28) {
    return DAILY_FAT_LIMITS.EARLY_RECOVERY;
  } else if (recoveryDay <= 90) {
    return DAILY_FAT_LIMITS.MID_RECOVERY;
  } else {
    return DAILY_FAT_LIMITS.LATE_RECOVERY;
  }
}

/**
 * Calculates progress percentage towards daily fat limit
 */
export function calculateFatProgress(currentFat: number, dailyLimit: number): number {
  return Math.min((currentFat / dailyLimit) * 100, 100);
}

/**
 * Determines if current fat intake is within safe range
 */
export function isFatIntakeSafe(currentFat: number, dailyLimit: number): boolean {
  return currentFat <= dailyLimit * 0.8; // Consider safe if under 80% of limit
}

/**
 * Gets color class for fat content display based on safety level
 */
export function getFatContentColor(fatContent: number, servingSize: number = 100): string {
  const safetyLevel = getFoodSafetyLevel(fatContent, servingSize);
  
  switch (safetyLevel) {
    case 'safe':
      return 'text-safe';
    case 'moderate':
      return 'text-moderate';
    case 'avoid':
      return 'text-avoid';
    default:
      return 'text-gray-600';
  }
}

/**
 * Formats fat content with appropriate unit and precision
 */
export function formatFatContent(fatGrams: number): string {
  return `${fatGrams.toFixed(1)}g`;
}

/**
 * Calculates estimated calories for a food item (rough estimation)
 */
export function estimateCalories(food: Food): number {
  const fat = parseFloat(food.fatPer100g);
  const protein = parseFloat(food.proteinPer100g);
  const carbs = parseFloat(food.carbsPer100g);
  
  // Calories: Fat = 9 cal/g, Protein = 4 cal/g, Carbs = 4 cal/g
  return Math.round((fat * 9) + (protein * 4) + (carbs * 4));
}

/**
 * Filters foods by safety level
 */
export function filterFoodsBySafety(foods: Food[], safetyLevel: 'safe' | 'moderate' | 'avoid'): Food[] {
  return foods.filter(food => food.safetyLevel === safetyLevel);
}

/**
 * Sorts foods by fat content (ascending)
 */
export function sortFoodsByFatContent(foods: Food[]): Food[] {
  return [...foods].sort((a, b) => parseFloat(a.fatPer100g) - parseFloat(b.fatPer100g));
}

/**
 * Filters recipes by safety level
 */
export function filterRecipesBySafety(recipes: Recipe[], safetyLevel: 'safe' | 'moderate' | 'avoid'): Recipe[] {
  return recipes.filter(recipe => recipe.safetyLevel === safetyLevel);
}

/**
 * Gets meal type recommendations based on recovery stage
 */
export function getMealRecommendations(recoveryDay: number): {
  recommended: string[];
  caution: string[];
  avoid: string[];
} {
  if (recoveryDay <= 7) {
    return {
      recommended: ['Clear broths', 'Plain rice', 'Bananas', 'Toast', 'Lean chicken breast'],
      caution: ['Small amounts of dairy', 'Cooked vegetables', 'White fish'],
      avoid: ['Fried foods', 'High-fat dairy', 'Nuts', 'Red meat', 'Chocolate']
    };
  } else if (recoveryDay <= 28) {
    return {
      recommended: ['Lean proteins', 'Steamed vegetables', 'Brown rice', 'Oatmeal', 'Fresh fruits'],
      caution: ['Low-fat dairy', 'Olive oil (small amounts)', 'Eggs', 'Salmon'],
      avoid: ['Fried foods', 'High-fat meats', 'Nuts', 'Avocado', 'Cream-based sauces']
    };
  } else {
    return {
      recommended: ['Varied lean proteins', 'All vegetables', 'Whole grains', 'Most fruits'],
      caution: ['Moderate fat foods', 'Nuts in small amounts', 'Full-fat dairy occasionally'],
      avoid: ['Deep fried foods', 'Very high fat meals', 'Excessive portions']
    };
  }
}

/**
 * Validates if a meal plan is within safe fat limits
 */
export function validateMealPlan(meals: any[], dailyLimit: number): {
  isValid: boolean;
  totalFat: number;
  warnings: string[];
} {
  let totalFat = 0;
  const warnings: string[] = [];
  
  meals.forEach(meal => {
    const mealFat = parseFloat(meal.fatContent || '0');
    totalFat += mealFat;
    
    if (mealFat > 10) {
      warnings.push(`${meal.type} contains high fat content (${mealFat}g)`);
    }
  });
  
  const isValid = totalFat <= dailyLimit;
  
  if (totalFat > dailyLimit * 0.8) {
    warnings.push(`Total fat intake (${totalFat}g) is approaching daily limit (${dailyLimit}g)`);
  }
  
  return {
    isValid,
    totalFat: Math.round(totalFat * 100) / 100,
    warnings
  };
}

/**
 * Generates grocery list categories for better organization
 */
export function categorizeGroceryItems(foods: Food[]): { [category: string]: Food[] } {
  const categories: { [key: string]: Food[] } = {
    'Proteins': [],
    'Vegetables': [],
    'Fruits': [],
    'Grains': [],
    'Dairy': [],
    'Other': []
  };
  
  foods.forEach(food => {
    const category = food.category.charAt(0).toUpperCase() + food.category.slice(1);
    if (categories[category]) {
      categories[category].push(food);
    } else {
      categories['Other'].push(food);
    }
  });
  
  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });
  
  return categories;
}

/**
 * Suggests alternative foods with lower fat content
 */
export function suggestLowerFatAlternatives(food: Food, allFoods: Food[]): Food[] {
  const sameCategory = allFoods.filter(f => 
    f.category === food.category && 
    f.id !== food.id &&
    parseFloat(f.fatPer100g) < parseFloat(food.fatPer100g)
  );
  
  return sameCategory
    .sort((a, b) => parseFloat(a.fatPer100g) - parseFloat(b.fatPer100g))
    .slice(0, 3);
}
