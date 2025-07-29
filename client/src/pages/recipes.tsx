import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNavigation, BottomNavigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Users, Search, Filter } from "lucide-react";
import type { Recipe, Food } from "@shared/schema";

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState("all");
  const [selectedMealType, setSelectedMealType] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
  });

  const { data: foods } = useQuery<Food[]>({
    queryKey: ['/api/foods'],
  });

  const filteredRecipes = recipes?.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSafety = selectedSafetyLevel === "all" || recipe.safetyLevel === selectedSafetyLevel;
    
    const matchesMealType = selectedMealType === "all" || 
      (recipe.tags && Array.isArray(recipe.tags) && recipe.tags.includes(selectedMealType));
    
    return matchesSearch && matchesSafety && matchesMealType;
  }) || [];

  const getSafetyColor = (safetyLevel: string) => {
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

  const getSafetyBadgeVariant = (safetyLevel: string) => {
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

  const getFoodName = (foodId: string) => {
    if (!foods) return "Unknown ingredient";
    const food = foods.find(f => f.id === foodId);
    return food?.name || "Unknown ingredient";
  };

  const formatInstructions = (instructions: string) => {
    return instructions.split('\n').filter(step => step.trim()).map((step, index) => (
      <div key={index} className="flex items-start space-x-3 mb-3">
        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
          {index + 1}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{step.trim()}</p>
      </div>
    ));
  };

  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
          
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => setSelectedRecipe(null)}
            className="mb-6"
          >
            ← Back to Recipes
          </Button>

          {/* Recipe Detail */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{selectedRecipe.name}</CardTitle>
                  <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
                </div>
                <Badge variant={getSafetyBadgeVariant(selectedRecipe.safetyLevel)} className="text-sm">
                  {selectedRecipe.safetyLevel}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{selectedRecipe.servings} serving{selectedRecipe.servings !== 1 ? 's' : ''}</span>
                </div>
                {selectedRecipe.prepTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.prepTime}m prep</span>
                  </div>
                )}
                {selectedRecipe.cookTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.cookTime}m cook</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* Nutrition Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Nutrition Per Serving</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className={`text-lg font-semibold ${getSafetyColor(selectedRecipe.safetyLevel)}`}>
                      {selectedRecipe.totalFatPerServing}g
                    </div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-700">Est. 250</div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-700">Est. 25g</div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-700">Est. 15g</div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ingredients</h4>
                <div className="space-y-2">
                  {selectedRecipe.ingredients && Array.isArray(selectedRecipe.ingredients) ? 
                    selectedRecipe.ingredients.map((ingredient: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-gray-900">{getFoodName(ingredient.foodId)}</span>
                        <span className="text-gray-600 text-sm">{ingredient.amount}{ingredient.unit}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500 italic">Ingredients list not available</p>
                    )
                  }
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Instructions</h4>
                <div className="space-y-1">
                  {formatInstructions(selectedRecipe.instructions)}
                </div>
              </div>

              {/* Tags */}
              {selectedRecipe.tags && Array.isArray(selectedRecipe.tags) && selectedRecipe.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

        </main>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recovery-Friendly Recipes</h2>
          <p className="text-gray-600">Delicious, low-fat recipes perfect for your recovery journey</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Find Recipes</span>
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
                placeholder="Search recipes by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <Select value={selectedSafetyLevel} onValueChange={setSelectedSafetyLevel}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Safety Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Safety Levels</SelectItem>
                  <SelectItem value="safe">Safe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="avoid">Avoid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meal Types</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery ? `Search Results (${filteredRecipes.length})` : `All Recipes (${filteredRecipes.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 line-clamp-2">{recipe.name}</h4>
                      <Badge variant={getSafetyBadgeVariant(recipe.safetyLevel)} className="text-xs ml-2 flex-shrink-0">
                        {recipe.safetyLevel}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{recipe.servings}</span>
                        </div>
                        {recipe.prepTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{recipe.prepTime}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getSafetyColor(recipe.safetyLevel)}`}>
                        {recipe.totalFatPerServing}g fat per serving
                      </span>
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </div>

                    {recipe.tags && Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recipe.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedSafetyLevel !== "all" || selectedMealType !== "all"
                    ? "Try adjusting your search or filters"
                    : "No recipes available at the moment"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipe Categories */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recipe Categories</CardTitle>
            <p className="text-sm text-gray-600">Browse recipes by meal type and safety level</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-safe-light rounded-lg text-center">
                <div className="w-12 h-12 bg-safe rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-safe mb-1">Safe Recipes</h4>
                <p className="text-sm text-gray-600">
                  {recipes?.filter(r => r.safetyLevel === 'safe').length || 0} recipes
                </p>
              </div>

              <div className="p-4 bg-moderate-light rounded-lg text-center">
                <div className="w-12 h-12 bg-moderate rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-moderate mb-1">Moderate Recipes</h4>
                <p className="text-sm text-gray-600">
                  {recipes?.filter(r => r.safetyLevel === 'moderate').length || 0} recipes
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-blue-700 mb-1">Breakfast</h4>
                <p className="text-sm text-gray-600">
                  {recipes?.filter(r => r.tags && Array.isArray(r.tags) && r.tags.includes('breakfast')).length || 0} recipes
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-purple-700 mb-1">Low-Fat</h4>
                <p className="text-sm text-gray-600">
                  {recipes?.filter(r => r.tags && Array.isArray(r.tags) && r.tags.includes('low-fat')).length || 0} recipes
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
