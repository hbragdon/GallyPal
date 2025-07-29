import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation, BottomNavigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Printer, Share2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GroceryList, Food } from "@shared/schema";

export default function GroceryListPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groceryList, isLoading } = useQuery<GroceryList>({
    queryKey: ['/api/grocery-lists/user-1/active'],
  });

  const { data: foods } = useQuery<Food[]>({
    queryKey: ['/api/foods'],
  });

  const updateGroceryListMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PATCH', `/api/grocery-lists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-lists'] });
      toast({
        title: "Success",
        description: "Grocery list updated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update grocery list",
        variant: "destructive",
      });
    },
  });

  const createGroceryListMutation = useMutation({
    mutationFn: async (newList: any) => {
      return apiRequest('POST', '/api/grocery-lists', newList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grocery-lists'] });
      toast({
        title: "Success",
        description: "Grocery list created!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create grocery list",
        variant: "destructive",
      });
    },
  });

  const getFoodName = (foodId: string) => {
    if (!foods) return "Loading...";
    const food = foods.find(f => f.id === foodId);
    return food?.name || "Unknown food";
  };

  const getFoodSafetyLevel = (foodId: string) => {
    if (!foods) return "safe";
    const food = foods.find(f => f.id === foodId);
    return food?.safetyLevel || "safe";
  };

  const handleItemCheck = (itemIndex: number, checked: boolean) => {
    if (!groceryList) return;

    const updatedItems = [...(groceryList.items || [])];
    if (updatedItems[itemIndex]) {
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], checked };
    }

    updateGroceryListMutation.mutate({
      id: groceryList.id,
      data: { items: updatedItems }
    });
  };

  const groupedItems = groceryList?.items?.reduce((groups: any, item: any, index: number) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push({ ...item, originalIndex: index });
    return groups;
  }, {}) || {};

  const totalItems = groceryList?.items?.length || 0;
  const checkedItemsCount = groceryList?.items?.filter((item: any) => item.checked).length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((checkedItemsCount / totalItems) * 100) : 0;

  const handleCreateSampleGroceryList = () => {
    const currentDate = new Date();
    const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    
    const sampleList = {
      userId: "user-1",
      name: `Grocery List - Week of ${weekStart.toLocaleDateString()}`,
      weekStartDate: weekStart.toISOString().split('T')[0],
      items: [
        { foodId: "food-1", quantity: 2, unit: "lbs", checked: false, category: "Proteins" },
        { foodId: "food-2", quantity: 1, unit: "lb", checked: false, category: "Proteins" },
        { foodId: "food-3", quantity: 1, unit: "lb", checked: false, category: "Proteins" },
        { foodId: "food-10", quantity: 2, unit: "containers", checked: false, category: "Dairy" },
        { foodId: "food-6", quantity: 2, unit: "heads", checked: false, category: "Vegetables" },
        { foodId: "food-7", quantity: 1, unit: "bag", checked: false, category: "Vegetables" },
        { foodId: "food-5", quantity: 4, unit: "pieces", checked: false, category: "Vegetables" },
        { foodId: "food-4", quantity: 1, unit: "bag", checked: false, category: "Grains" },
        { foodId: "food-8", quantity: 1, unit: "container", checked: false, category: "Grains" },
        { foodId: "food-9", quantity: 6, unit: "pieces", checked: false, category: "Fruits" }
      ],
      isActive: true
    };

    createGroceryListMutation.mutate(sampleList);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: groceryList?.name || 'Grocery List',
        text: 'Check out my recovery-friendly grocery list from GallyPal',
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Grocery list link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-white rounded-xl animate-pulse"></div>
          </div>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Grocery List</h2>
          <p className="text-gray-600">Your recovery-friendly shopping list</p>
        </div>

        {!groceryList ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Grocery List
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a grocery list based on your meal plans to make shopping easier
                </p>
                <Button 
                  onClick={handleCreateSampleGroceryList}
                  disabled={createGroceryListMutation.isPending}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createGroceryListMutation.isPending ? 'Creating...' : 'Create Grocery List'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{groceryList.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Week of {new Date(groceryList.weekStartDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{completionPercentage}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {checkedItemsCount} of {totalItems} items completed
                  </span>
                  <span className="font-medium text-gray-900">
                    Estimated cost: $45-60
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Grocery Items */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Items</CardTitle>
                <p className="text-sm text-gray-600">
                  Organized by category for easy shopping
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-safe rounded-full mr-2"></span>
                        {category}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {items.length} items
                        </Badge>
                      </h4>
                      <div className="space-y-2 ml-4">
                        {items.map((item: any) => {
                          const safetyLevel = getFoodSafetyLevel(item.foodId);
                          return (
                            <div key={item.originalIndex} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                              <Checkbox 
                                checked={item.checked || false}
                                onCheckedChange={(checked) => handleItemCheck(item.originalIndex, !!checked)}
                                className="w-4 h-4"
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {getFoodName(item.foodId)} ({item.quantity} {item.unit})
                                  </span>
                                  {safetyLevel && (
                                    <Badge 
                                      variant={safetyLevel === 'safe' ? 'default' : safetyLevel === 'moderate' ? 'secondary' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {safetyLevel}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shopping Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recovery Shopping Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Reading Labels</h4>
                    <p className="text-sm text-blue-800">
                      Always check nutrition labels for fat content per serving. Look for items with less than 3g fat per serving.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Fresh is Best</h4>
                    <p className="text-sm text-green-800">
                      Choose fresh fruits and vegetables when possible. They're naturally low in fat and high in nutrients.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Lean Proteins</h4>
                    <p className="text-sm text-yellow-800">
                      Select skinless poultry, white fish, and lean cuts of meat. Avoid processed meats which are often high in fat.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Preparation Methods</h4>
                    <p className="text-sm text-purple-800">
                      Stock up on cooking sprays and herbs for flavor without adding fat. Avoid oils and butter during early recovery.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

      </main>
      
      <BottomNavigation />
    </div>
  );
}
