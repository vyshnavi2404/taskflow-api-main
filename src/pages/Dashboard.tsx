import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProjectForm from "@/components/forms/ProjectForm";

interface Project {
  _id: string;
  name: string;
  key: string;
  type: string;
  sprints?: string[];
}

interface User {
  fullName: string;
  email: string;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-600 mt-2">Manage your project portfolio</p>
          </div>
          {user.role === 'manager' && <ProjectForm />}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <Card 
                key={project._id} 
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </CardTitle>
                    <FolderOpen className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <CardDescription>
                    <Badge variant="outline" className="text-xs">
                      {project.key}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="capitalize">{project.type}</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {project.sprints?.length || 0} sprints
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first project</p>
              {user.role === 'manager' && <ProjectForm />}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;