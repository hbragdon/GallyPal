import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigation, BottomNavigation } from "@/components/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import type { Food } from "@shared/schema";

export default function FoodSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: searchResults, isLoading } = useQuery<Food[]>({
    queryKey: ['/api/foods/search', { q: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  const { data: allFoods } = useQuery<Food[]>({
    queryKey: ['/api/foods'],
  });

  const { data: categoryFoods } = useQuery<Food[]>({
    queryKey: ['/api/foods/category', selectedCategory],
    enabled: selectedCategory !== "all",
  });

  const categories = [
    { value: "all", label: "All Foods" },
    { value: "protein", label: "Proteins" },
    { value: "vegetable", label: "Vegetables" },
    { value: "fruit", label: "Fruits" },
    { value: "grain", label: "Grains" },
    { value: "dairy", label: "Dairy" },
  ];

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

  const getBadgeVariant = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'safe':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'avoid':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const displayFoods = searchQuery.length >= 2 
    ? searchResults 
    : selectedCategory === "all" 
      ? allFoods 
      : categoryFoods;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Food Search & Fat Content</h2>
          <p className="text-gray-600">Find foods and check their fat content for recovery planning</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Foods</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
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

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery.length >= 2 
                ? `Search Results for "${searchQuery}"` 
                : selectedCategory === "all" 
                  ? "All Foods" 
                  : `${categories.find(c => c.value === selectedCategory)?.label} Foods`
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchQuery.length >= 1 && searchQuery.length < 2 ? (
              <div className="text-center text-gray-500 py-8">
                Type at least 2 characters to search for foods
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : displayFoods && displayFoods.length > 0 ? (
              <div className="space-y-3">
                {displayFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${getSafetyColor(food.safetyLevel)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getSafetyIcon(food.safetyLevel)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{food.name}</h4>
                          <Badge variant={getBadgeVariant(food.safetyLevel)} className="text-xs">
                            {food.safetyLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{food.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Serving: {food.servingSize}</span>
                          <span>Category: {food.category}</span>
                          <span>Calories: {food.caloriesPer100g}/100g</span>
                        </div>
                        {food.recoveryNotes && (
                          <p className="text-xs text-blue-600 mt-1">{food.recoveryNotes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className={`text-lg font-semibold ${getSafetyTextColor(food.safetyLevel)}`}>
                        {food.fatPer100g}g
                      </div>
                      <div className="text-xs text-gray-500">fat per 100g</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {food.proteinPer100g}g protein
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {searchQuery.length >= 2 
                  ? `No foods found for "${searchQuery}"` 
                  : "No foods available"
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fat Content Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Fat Content Guide for Recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-safe-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-safe rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <h4 className="font-medium text-safe">Safe (0-5g fat)</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Very low fat foods that are gentle on your digestive system during recovery.
                </p>
              </div>

              <div className="p-4 bg-moderate-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-moderate rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <h4 className="font-medium text-moderate">Moderate (5-15g fat)</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Use in small portions and monitor your body's response. Best consumed later in recovery.
                </p>
              </div>

              <div className="p-4 bg-avoid-light rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-avoid rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">×</span>
                  </div>
                  <h4 className="font-medium text-avoid">Avoid (15g+ fat)</h4>
                </div>
                <p className="text-sm text-gray-600">
                  High fat foods that should be avoided, especially during early recovery phases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
      
      <BottomNavigation />
    </div>
  );
}
