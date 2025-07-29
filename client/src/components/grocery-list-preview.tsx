import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Printer, Share2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { GroceryList, Food } from "@shared/schema";

export function GroceryListPreview() {
  const { data: groceryList, isLoading } = useQuery<GroceryList>({
    queryKey: ['/api/grocery-lists/user-1/active'],
  });

  const { data: foods } = useQuery<Food[]>({
    queryKey: ['/api/foods'],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-gray-100 rounded"></div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!groceryList) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 text-center text-gray-500">
          No active grocery list. <Link href="/grocery-list" className="text-primary hover:text-primary-dark">Create one?</Link>
        </div>
      </div>
    );
  }

  const getFoodName = (foodId: string) => {
    if (!foods) return "Loading...";
    const food = foods.find(f => f.id === foodId);
    return food?.name || "Unknown food";
  };

  const groupedItems = groceryList.items?.reduce((groups: any, item: any) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {}) || {};

  const totalItems = groceryList.items?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{groceryList.name}</h3>
          <div className="flex items-center space-x-2">
            <button className="text-primary text-sm font-medium hover:text-primary-dark flex items-center space-x-1">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button className="text-primary text-sm font-medium hover:text-primary-dark flex items-center space-x-1">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Generated from your meal plan</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-safe rounded-full mr-2"></span>
                {category}
              </h4>
              <div className="space-y-2">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Checkbox 
                      checked={item.checked || false}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {getFoodName(item.foodId)} ({item.quantity} {item.unit})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalItems} items</span> • 
            Estimated cost: <span className="font-medium">$45-60</span>
          </div>
        </div>
      </div>
    </div>
  );
}
