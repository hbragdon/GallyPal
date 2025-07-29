import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavigation, BottomNavigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Target, Edit3, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    surgeryDate: "",
    dailyFatLimit: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ['/api/users/user-1'],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('PATCH', '/api/users/user-1', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const startEditing = () => {
    if (user) {
      setEditData({
        name: user.name,
        surgeryDate: user.surgeryDate || "",
        dailyFatLimit: user.dailyFatLimit || "30"
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveChanges = () => {
    updateUserMutation.mutate(editData);
  };

  const getRecoveryDay = () => {
    if (!user?.surgeryDate) return 1;
    const surgery = new Date(user.surgeryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - surgery.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRecoveryStage = (recoveryDay: number) => {
    if (recoveryDay <= 7) return { stage: "Early Recovery", color: "bg-blue-100 text-blue-800" };
    if (recoveryDay <= 28) return { stage: "Initial Recovery", color: "bg-yellow-100 text-yellow-800" };
    if (recoveryDay <= 90) return { stage: "Mid Recovery", color: "bg-green-100 text-green-800" };
    return { stage: "Late Recovery", color: "bg-purple-100 text-purple-800" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-white rounded-xl animate-pulse"></div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const recoveryDay = getRecoveryDay();
  const recoveryStage = getRecoveryStage(recoveryDay);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Profile</h2>
          <p className="text-gray-600">Manage your recovery information and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{user?.name || 'User'}</CardTitle>
                  <p className="text-gray-600">@{user?.username}</p>
                </div>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={startEditing}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={saveChanges}
                    disabled={updateUserMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {isEditing ? (
              <>
                {/* Edit Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surgeryDate">Surgery Date</Label>
                    <Input
                      id="surgeryDate"
                      type="date"
                      value={editData.surgeryDate}
                      onChange={(e) => setEditData({ ...editData, surgeryDate: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dailyFatLimit">Daily Fat Limit (grams)</Label>
                    <Input
                      id="dailyFatLimit"
                      type="number"
                      min="10"
                      max="100"
                      value={editData.dailyFatLimit}
                      onChange={(e) => setEditData({ ...editData, dailyFatLimit: e.target.value })}
                      placeholder="30"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Recommended: 20g (early), 30g (mid), 40g (late recovery)
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-gray-900">{recoveryDay}</div>
                    <div className="text-sm text-gray-600">Days since surgery</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Target className="w-8 h-8 text-safe mx-auto mb-2" />
                    <div className="text-2xl font-semibold text-gray-900">{user?.dailyFatLimit || 30}g</div>
                    <div className="text-sm text-gray-600">Daily fat limit</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">Good</div>
                    <div className="text-sm text-gray-600">Recovery progress</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Surgery Date</p>
                    <p className="font-medium">
                      {user?.surgeryDate 
                        ? new Date(user.surgeryDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <Badge className={recoveryStage.color}>
                    {recoveryStage.stage}
                  </Badge>
                </div>
              </>
            )}

          </CardContent>
        </Card>

        {/* Recovery Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recovery Guidelines for Day {recoveryDay}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-safe-light rounded-lg">
                <h4 className="font-medium text-safe mb-2">Recommended Foods</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {recoveryDay <= 7 ? (
                    <>
                      <li>• Clear broths</li>
                      <li>• Plain rice</li>
                      <li>• Bananas</li>
                      <li>• Toast</li>
                    </>
                  ) : recoveryDay <= 28 ? (
                    <>
                      <li>• Lean proteins</li>
                      <li>• Steamed vegetables</li>
                      <li>• Brown rice</li>
                      <li>• Fresh fruits</li>
                    </>
                  ) : (
                    <>
                      <li>• Varied lean proteins</li>
                      <li>• All vegetables</li>
                      <li>• Whole grains</li>
                      <li>• Most fruits</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-moderate-light rounded-lg">
                <h4 className="font-medium text-moderate mb-2">Use Caution</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {recoveryDay <= 7 ? (
                    <>
                      <li>• Small amounts of dairy</li>
                      <li>• Cooked vegetables</li>
                      <li>• White fish</li>
                    </>
                  ) : recoveryDay <= 28 ? (
                    <>
                      <li>• Low-fat dairy</li>
                      <li>• Olive oil (small amounts)</li>
                      <li>• Eggs</li>
                      <li>• Salmon</li>
                    </>
                  ) : (
                    <>
                      <li>• Moderate fat foods</li>
                      <li>• Nuts in small amounts</li>
                      <li>• Full-fat dairy occasionally</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-avoid-light rounded-lg">
                <h4 className="font-medium text-avoid mb-2">Avoid</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {recoveryDay <= 7 ? (
                    <>
                      <li>• Fried foods</li>
                      <li>• High-fat dairy</li>
                      <li>• Nuts</li>
                      <li>• Red meat</li>
                    </>
                  ) : recoveryDay <= 28 ? (
                    <>
                      <li>• Fried foods</li>
                      <li>• High-fat meats</li>
                      <li>• Nuts</li>
                      <li>• Cream-based sauces</li>
                    </>
                  ) : (
                    <>
                      <li>• Deep fried foods</li>
                      <li>• Very high fat meals</li>
                      <li>• Excessive portions</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Daily Reminders</p>
                  <p className="text-sm text-gray-600">Get notified to track your meals</p>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Fat Limit Warnings</p>
                  <p className="text-sm text-gray-600">Alert when approaching daily limit</p>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Weekly Progress Reports</p>
                  <p className="text-sm text-gray-600">Summary of your recovery progress</p>
                </div>
                <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
      
      <BottomNavigation />
    </div>
  );
}