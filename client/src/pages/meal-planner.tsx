import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation, BottomNavigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, Edit3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MealPlan, Recipe } from "@shared/schema";

export default function MealPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mealPlan, isLoading: mealPlanLoading } = useQuery<MealPlan>({
    queryKey: ['/api/meal-plans/user-1', selectedDate],
  });

  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  const createMealPlanMutation = useMutation({
    mutationFn: async (newMealPlan: any) => {
      return apiRequest('POST', '/api/meal-plans', newMealPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      toast({
        title: "Success",
        description: "Meal plan created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create meal plan",
        variant: "destructive",
      });
    },
  });

  const handleCreateSampleMealPlan = () => {
    const sampleMealPlan = {
      userId: "user-1",
      date: selectedDate,
      meals: [
        { type: "breakfast", recipeId: "recipe-2", fatContent: "2.5" },
        { type: "lunch", recipeId: "recipe-1", fatContent: "4.2" },
        { type: "dinner", recipeId: "recipe-3", fatContent: "8.5" }
      ],
      totalFat: "15.2",
      notes: "Balanced low-fat meal plan"
    };

    createMealPlanMutation.mutate(sampleMealPlan);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getRecipeName = (recipeId: string) => {
    if (!recipes) return "Loading...";
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe?.name || "Unknown recipe";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Meal Planner</h2>
          <p className="text-gray-600">Plan your recovery-friendly meals</p>
        </div>

        {/* Date Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            />
          </CardContent>
        </Card>

        {/* Meal Plan Content */}
        {mealPlanLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : mealPlan ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Meal Plan for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Total fat: <span className={getSafetyColor(mealPlan.totalFat)}>{mealPlan.totalFat}g</span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealPlan.meals && Array.isArray(mealPlan.meals) ? 
                  mealPlan.meals.map((meal: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getMealIcon(meal.type)}</div>
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{meal.type}</h4>
                          <p className="text-sm text-gray-600">{getRecipeName(meal.recipeId)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getSafetyColor(meal.fatContent)}`}>
                          {meal.fatContent}g fat
                        </div>
                        <div className="text-xs text-gray-500">{getSafetyLevel(meal.fatContent)}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500 py-8">
                      No meals planned for this date
                    </div>
                  )
                }
              </div>
              
              {mealPlan.notes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{mealPlan.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No meal plan for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a personalized meal plan to track your recovery nutrition
                </p>
                <Button 
                  onClick={handleCreateSampleMealPlan}
                  disabled={createMealPlanMutation.isPending}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createMealPlanMutation.isPending ? 'Creating...' : 'Create Meal Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Add Suggestions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recovery-Friendly Recipes</CardTitle>
            <p className="text-sm text-gray-600">Quick suggestions for safe meals</p>
          </CardHeader>
          <CardContent>
            {recipes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.filter(r => r.safetyLevel === 'safe').map((recipe) => (
                  <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                      <div className="w-6 h-6 bg-safe rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-safe">{recipe.totalFatPerServing}g fat</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {recipe.prepTime && `${recipe.prepTime}m prep`}
                      {recipe.cookTime && ` • ${recipe.cookTime}m cook`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Loading recipes...
              </div>
            )}
          </CardContent>
        </Card>

      </main>
      
      <BottomNavigation />
    </div>
  );
}
