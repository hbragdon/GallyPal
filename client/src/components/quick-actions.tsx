import { Link } from "wouter";
import { Calendar, ShoppingBag, Search, BookOpen } from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <Link href="/meal-planner">
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow w-full">
          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-3 mx-auto">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-gray-900">Meal Planner</span>
        </button>
      </Link>

      <Link href="/grocery-list">
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow w-full">
          <div className="w-12 h-12 bg-safe-light rounded-lg flex items-center justify-center mb-3 mx-auto">
            <ShoppingBag className="w-6 h-6 text-safe" />
          </div>
          <span className="text-sm font-medium text-gray-900">Grocery List</span>
        </button>
      </Link>

      <Link href="/food-search">
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow w-full">
          <div className="w-12 h-12 bg-moderate-light rounded-lg flex items-center justify-center mb-3 mx-auto">
            <Search className="w-6 h-6 text-moderate" />
          </div>
          <span className="text-sm font-medium text-gray-900">Food Search</span>
        </button>
      </Link>

      <Link href="/recipes">
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow w-full">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
            <BookOpen className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Recipes</span>
        </button>
      </Link>
    </div>
  );
}
