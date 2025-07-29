import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { TopNavigation, BottomNavigation } from "@/components/navigation";
import { FatTracker } from "@/components/fat-tracker";
import { QuickActions } from "@/components/quick-actions";
import { MealPlanPreview } from "@/components/meal-plan-preview";
import { FoodSearchInterface } from "@/components/food-search-interface";
import { GroceryListPreview } from "@/components/grocery-list-preview";
import type { User, UserProgress, Food } from "@shared/schema";

export default function Home() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/user-1'],
  });

  const { data: progress } = useQuery<UserProgress>({
    queryKey: ['/api/progress/user-1', today],
  });

  const { data: recentFoods } = useQuery<Food[]>({
    queryKey: ['/api/foods'],
    select: (foods) => foods.filter(f => f.safetyLevel === 'safe').slice(0, 3),
  });

  const getRecoveryDay = () => {
    if (!user?.surgeryDate) return 1;
    const surgery = new Date(user.surgeryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - surgery.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Good morning, {user?.name || 'there'}!
          </h2>
          <p className="text-gray-600">
            Day {progress?.recoveryDay || getRecoveryDay()} of recovery - You're doing great!
          </p>
        </div>

        {/* Daily Fat Tracker */}
        <FatTracker />

        {/* Quick Actions */}
        <QuickActions />

        {/* Meal Plan Preview */}
        <MealPlanPreview />

        {/* Food Search Interface */}
        <FoodSearchInterface />

        {/* Grocery List Preview */}
        <GroceryListPreview />

        {/* Educational Content */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recovery Tip for Week 2</h3>
              <p className="text-gray-700 mb-3">
                During your second week of recovery, you can gradually introduce more variety in your diet. 
                Continue to keep fat intake below 30g per day and focus on lean proteins and vegetables.
              </p>
              <button className="text-primary font-medium text-sm hover:text-primary-dark">
                View all recovery tips →
              </button>
            </div>
          </div>
        </div>

        {/* Recently Viewed Foods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Safe Foods for Recovery</h3>
          </div>
          <div className="p-4">
            {recentFoods ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentFoods.map((food) => (
                  <div key={food.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{food.name}</h4>
                      <div className="w-6 h-6 bg-safe rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{food.servingSize}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-safe">{food.fatPer100g}g fat</span>
                      <span className="text-xs text-gray-500 capitalize">{food.safetyLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Loading safe foods...
              </div>
            )}
          </div>
        </div>

      </main>
      
      <BottomNavigation />
    </div>
  );
}
