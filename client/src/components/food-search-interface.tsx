import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Food } from "@shared/schema";

export function FoodSearchInterface() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading } = useQuery<Food[]>({
    queryKey: ['/api/foods/search', { q: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  const getSafetyIcon = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe':
        return <span className="text-white text-xs font-medium">✓</span>;
      case 'moderate':
        return <span className="text-white text-xs font-medium">!</span>;
      case 'avoid':
        return <span className="text-white text-xs font-medium">×</span>;
      default:
        return null;
    }
  };

  const getSafetyColor = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe':
        return 'bg-safe';
      case 'moderate':
        return 'bg-moderate';
      case 'avoid':
        return 'bg-avoid';
      default:
        return 'bg-gray-400';
    }
  };

  const getSafetyTextColor = (safetyLevel: string) => {
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
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Food & Check Fat Content</h3>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Search for foods (e.g., 'chicken breast', 'avocado')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4">
        {searchQuery.length < 2 ? (
          <div className="text-center text-gray-500 py-8">
            Type at least 2 characters to search for foods
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="space-y-3">
            {searchResults.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getSafetyColor(food.safetyLevel)} rounded-full flex items-center justify-center`}>
                    {getSafetyIcon(food.safetyLevel)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{food.name} ({food.servingSize})</h4>
                    <p className="text-sm text-gray-600">{food.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getSafetyTextColor(food.safetyLevel)}`}>
                    {food.fatPer100g}g fat
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{food.safetyLevel}</div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className="text-center text-gray-500 py-8">
            No foods found for "{searchQuery}"
          </div>
        ) : null}
      </div>
    </div>
  );
}
