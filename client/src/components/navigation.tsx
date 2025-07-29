import { Link, useLocation } from "wouter";
import { Home, Calendar, Search, ShoppingCart, BookOpen, Menu, User } from "lucide-react";

export function TopNavigation() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">GallyPal</h1>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {location !== '/' && (
              <Link href="/">
                <button className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
              </Link>
            )}
            <Link href="/profile">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </Link>
            <button className="p-2 rounded-md hover:bg-gray-100 sm:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:hidden">
      <div className="flex justify-around">
        <Link href="/">
          <button className={`flex flex-col items-center py-2 px-3 ${isActive('/') ? 'text-primary' : 'text-gray-600'}`}>
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        
        <Link href="/meal-planner">
          <button className={`flex flex-col items-center py-2 px-3 ${isActive('/meal-planner') ? 'text-primary' : 'text-gray-600'}`}>
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs">Planner</span>
          </button>
        </Link>
        
        <Link href="/food-search">
          <button className={`flex flex-col items-center py-2 px-3 ${isActive('/food-search') ? 'text-primary' : 'text-gray-600'}`}>
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Search</span>
          </button>
        </Link>
        
        <Link href="/grocery-list">
          <button className={`flex flex-col items-center py-2 px-3 ${isActive('/grocery-list') ? 'text-primary' : 'text-gray-600'}`}>
            <ShoppingCart className="w-6 h-6 mb-1" />
            <span className="text-xs">Grocery</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
