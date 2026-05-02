import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface Sprint {
  _id: string;
  sprintName: string;
  sprintType: string;
  projectId: string;
}

interface SprintFormProps {
  sprint?: Sprint;
  projectId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const SprintForm = ({ sprint, projectId, onSuccess, trigger }: SprintFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const isEditing = !!sprint;

  const mutation = useMutation({
    mutationFn: async (sprintData: { sprintName: string; sprintType: string; projectId?: string }) => {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/sprint/${sprint._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/sprint`;
      
      const payload = isEditing 
        ? { sprintName: sprintData.sprintName, sprintType: sprintData.sprintType }
        : { ...sprintData, projectId };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} sprint`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['sprint', sprint._id] });
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
    const sprintData = {
      sprintName: formData.get("sprintName") as string,
      sprintType: formData.get("sprintType") as string,
    };

    mutation.mutate(sprintData);
  };

  const defaultTrigger = (
    <Button className="bg-blue-600 hover:bg-blue-700">
      <Plus className="h-4 w-4 mr-2" />
      New Sprint
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
          <DialogTitle>{isEditing ? 'Edit Sprint' : 'Create New Sprint'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update sprint details.' : 'Add a new sprint to organize your work iterations.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprintName">Sprint Name</Label>
            <Input
              id="sprintName"
              name="sprintName"
              placeholder="Enter sprint name"
              defaultValue={sprint?.sprintName || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sprintType">Sprint Type</Label>
            <Select name="sprintType" defaultValue={sprint?.sprintType || ""} required>
              <SelectTrigger>
                <SelectValue placeholder="Select sprint type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="release">Release</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
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
                : (isEditing ? "Update Sprint" : "Create Sprint")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SprintForm;