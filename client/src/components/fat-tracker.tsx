import { useQuery } from "@tanstack/react-query";
import type { UserProgress } from "@shared/schema";

export function FatTracker() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: progress, isLoading } = useQuery<UserProgress>({
    queryKey: ['/api/progress/user-1', today],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="text-center text-gray-500">
          No progress data for today
        </div>
      </div>
    );
  }

  const currentFat = parseFloat(progress.fatIntake);
  const dailyLimit = parseFloat(progress.fatLimit);
  const progressPercentage = Math.min((currentFat / dailyLimit) * 100, 100);

  // Count foods by safety level
  const safeItems = progress.foodsEaten?.filter(food => {
    // This would ideally check the actual food safety level
    return true; // Simplified for now
  }).length || 0;

  const getProgressColor = () => {
    if (progressPercentage <= 60) return 'bg-safe';
    if (progressPercentage <= 85) return 'bg-moderate';
    return 'bg-avoid';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Today's Fat Intake</h3>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
      
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{currentFat}g consumed</span>
          <span>{dailyLimit}g daily limit</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-safe-light p-3 rounded-lg">
          <div className="text-lg font-semibold text-safe">{safeItems}</div>
          <div className="text-xs text-gray-600">Safe foods</div>
        </div>
        <div className="bg-moderate-light p-3 rounded-lg">
          <div className="text-lg font-semibold text-moderate">0</div>
          <div className="text-xs text-gray-600">Moderate</div>
        </div>
        <div className="bg-avoid-light p-3 rounded-lg">
          <div className="text-lg font-semibold text-avoid">0</div>
          <div className="text-xs text-gray-600">Avoided</div>
        </div>
      </div>
    </div>
  );
}
