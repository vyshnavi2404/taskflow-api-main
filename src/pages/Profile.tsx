import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Shield, Edit, Save, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useState } from "react";

interface UserProfile {
  fullName: string;
  email: string;
  role: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{ fullName: string }>({ fullName: "" });

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (userData: { fullName: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (data) => {
      // Update localStorage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, fullName: data.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      refetch();
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    setEditData({ fullName: user?.fullName || "" });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ fullName: "" });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {!isEditing && (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled className="bg-gray-50" />
                      <p className="text-sm text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={user?.role || ""} disabled className="bg-gray-50" />
                      <p className="text-sm text-gray-500">Role is managed by administrators</p>
                    </div>

                    {updateMutation.error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">
                          {updateMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={updateMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline"
                        disabled={updateMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
                          <Badge variant="secondary" className="text-xs">
                            {user?.role === 'manager' ? 'Manager' : 'Developer'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Access Level</span>
                    <Badge variant="outline" className="capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Projects</span>
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Create Issues</span>
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manage Projects</span>
                    <Badge className={user?.role === 'manager' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                      {user?.role === 'manager' ? '✓' : '✗'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;