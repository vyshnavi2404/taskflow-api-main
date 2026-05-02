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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issue/stats/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold">Welcome back, {user.fullName}!</h1>
            <p className="text-blue-100 mt-2 opacity-90">Here's an overview of your team's activity.</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Users className="h-32 w-32" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold text-gray-500">Total Tasks</CardDescription>
              <CardTitle className="text-2xl">{statsLoading ? "..." : stats?.totalTasks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold text-gray-500">In Progress</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{statsLoading ? "..." : stats?.inProgressTasks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold text-gray-500">Completed</CardDescription>
              <CardTitle className="text-2xl text-green-600">{statsLoading ? "..." : stats?.closedTasks}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-bold text-gray-500">Overdue</CardDescription>
              <CardTitle className="text-2xl text-red-600">{statsLoading ? "..." : stats?.overdueTasks}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <p className="text-sm text-gray-500">Manage your workspace and teams</p>
            </div>
            {user.role === 'Admin' && <ProjectForm />}
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse h-48"></Card>
              ))}
            </div>
          ) : projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: Project) => (
                <Card 
                  key={project._id} 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-t-indigo-500 hover:-translate-y-1"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-mono">{project.key}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center capitalize"><FolderOpen className="h-4 w-4 mr-2 text-indigo-500" />{project.type}</span>
                        <span className="flex items-center"><Users className="h-4 w-4 mr-2 text-indigo-500" />{project.sprints?.length || 0} sprints</span>
                      </div>
                      <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-medium">View Project Details →</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 border-dashed bg-gray-50/50">
              <CardContent>
                <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create a project to start organizing tasks and collaborating with your team.</p>
                {user.role === 'Admin' && <ProjectForm />}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;