import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface Project {
  _id: string;
  name: string;
  key: string;
  type: string;
}

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const ProjectForm = ({ project, onSuccess, trigger }: ProjectFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const mutation = useMutation({
    mutationFn: async (projectData: { name: string; key: string; type: string }) => {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/project/${project._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/project`;
      
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} project`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      }
      setIsOpen(false);
      setError("");
      onSuccess?.();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const projectData = {
      name: formData.get("name") as string,
      key: formData.get("key") as string,
      type: formData.get("type") as string,
    };

    mutation.mutate(projectData);
  };

  const defaultTrigger = (
    <Button className="bg-blue-600 hover:bg-blue-700">
      <Plus className="h-4 w-4 mr-2" />
      New Project
    </Button>
  );

  const editTrigger = (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (isEditing ? editTrigger : defaultTrigger)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update project details.' : 'Add a new project to organize your work.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              defaultValue={project?.name || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Project Key</Label>
            <Input
              id="key"
              name="key"
              placeholder="e.g., PROJ"
              defaultValue={project?.key || ""}
              required
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Project Type</Label>
            <Select name="type" defaultValue={project?.type || ""} required>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Project" : "Create Project")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;