import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Layers, ArrowRight, FolderPlus, Briefcase } from "lucide-react";
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

const projectColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
];

const colorForKey = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return projectColors[Math.abs(hash) % projectColors.length];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/project`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
  });

  if (!user) return null;

  const totalProjects = projects?.length || 0;
  const totalSprints =
    projects?.reduce((sum, p) => sum + (p.sprints?.length || 0), 0) || 0;
  const firstName = user.fullName?.split(" ")[0] || "there";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, {firstName}
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your projects today.
            </p>
          </div>
          {user.role === "manager" && <ProjectForm />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-gray-200/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoading ? "—" : totalProjects}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Sprints</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {isLoading ? "—" : totalSprints}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200/60">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Your Role</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 capitalize">
                    {user.role}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-violet-50 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          {totalProjects > 0 && (
            <span className="text-sm text-gray-500">
              {totalProjects} {totalProjects === 1 ? "project" : "projects"}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-gray-200/60">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="border-gray-200/60 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg ${colorForKey(
                        project.key || project.name
                      )} flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm`}
                    >
                      {(project.key || project.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {project.key}
                        </Badge>
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <span className="capitalize text-xs font-medium">
                      {project.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <Layers className="h-3.5 w-3.5" />
                      {project.sprints?.length || 0}{" "}
                      {(project.sprints?.length || 0) === 1 ? "sprint" : "sprints"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {user.role === "manager"
                  ? "Get started by creating your first project."
                  : "No projects have been created yet. Check back later."}
              </p>
              {user.role === "manager" && <ProjectForm />}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
