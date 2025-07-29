import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sun, Moon } from "lucide-react";
import type { MealPlan, Recipe } from "@shared/schema";

export function MealPlanPreview() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: mealPlan, isLoading } = useQuery<MealPlan>({
    queryKey: ['/api/meal-plans/user-1', today],
  });

  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4 p-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Sun className="w-5 h-5 text-safe" />;
      case 'lunch':
        return <Sun className="w-5 h-5 text-safe" />;
      case 'dinner':
        return <Moon className="w-5 h-5 text-moderate" />;
      default:
        return <Sun className="w-5 h-5 text-safe" />;
    }
  };

  const getMealName = (mealType: string, recipeId?: string) => {
    if (recipeId && recipes) {
      const recipe = recipes.find(r => r.id === recipeId);
      return recipe?.name || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
    }
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const getSafetyColor = (fatContent: string) => {
    const fat = parseFloat(fatContent);
    if (fat <= 5) return 'text-safe';
    if (fat <= 10) return 'text-moderate';
    return 'text-avoid';
  };

  const getSafetyLevel = (fatContent: string) => {
    const fat = parseFloat(fatContent);
    if (fat <= 5) return 'Safe';
    if (fat <= 10) return 'Moderate';
    return 'High';
  };

  const getBgColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
      case 'lunch':
        return 'bg-safe-light';
      case 'dinner':
        return 'bg-moderate-light';
      default:
        return 'bg-safe-light';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Today's Meal Plan</h3>
          <Link href="/meal-planner">
            <button className="text-primary text-sm font-medium hover:text-primary-dark">
              Edit Plan
            </button>
          </Link>
        </div>
      </div>

      {mealPlan?.meals && Array.isArray(mealPlan.meals) ? (
        <div>
          {mealPlan.meals.map((meal: any, index: number) => (
            <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getBgColor(meal.type)} rounded-lg flex items-center justify-center`}>
                    {getMealIcon(meal.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</h4>
                    <p className="text-sm text-gray-600">{getMealName(meal.type, meal.recipeId)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getSafetyColor(meal.fatContent)}`}>
                    {meal.fatContent}g fat
                  </div>
                  <div className="text-xs text-gray-500">{getSafetyLevel(meal.fatContent)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No meal plan for today. <Link href="/meal-planner" className="text-primary hover:text-primary-dark">Create one?</Link>
        </div>
      )}
    </div>
  );
}
