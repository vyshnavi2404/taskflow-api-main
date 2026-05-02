import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit } from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

interface Issue {
  _id: string;
  customId: string;
  title: string;
  Summary: string;
  status: "Open" | "In Progress" | "Closed";
  issueType: "Task" | "Bug";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  sprintId: string;
  projectId: string;
}

interface User {
  fullName: string;
  email: string;
  role: string;
}

interface IssueFormProps {
  issue?: Issue;
  sprintId: string;
  projectId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const IssueForm = ({ issue, sprintId, projectId, onSuccess, trigger }: IssueFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const isEditing = !!issue;

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (issueData: any) => {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/issue/${issue._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/issue/${sprintId}`;
      
      const payload = isEditing 
        ? {
            title: issueData.title,
            Summary: issueData.Summary,
            status: issueData.status,
            issueType: issueData.issueType,
            priority: issueData.priority,
            assignedTo: issueData.assignedTo,
          }
        : { ...issueData, projectId };

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
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} issue`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', sprintId] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['issue', issue._id] });
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
    const issueData = {
      title: formData.get("title") as string,
      Summary: formData.get("summary") as string,
      status: formData.get("status") as string,
      issueType: formData.get("issueType") as string,
      priority: formData.get("priority") as string,
      assignedTo: formData.get("assignedTo") as string,
    };

    mutation.mutate(issueData);
  };

  const defaultTrigger = (
    <Button className="bg-blue-600 hover:bg-blue-700">
      <Plus className="h-4 w-4 mr-2" />
      New Issue
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update issue details.' : 'Add a new issue to track work items.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter issue title"
              defaultValue={issue?.title || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="Describe the issue"
              defaultValue={issue?.Summary || ""}
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueType">Type</Label>
              <Select name="issueType" defaultValue={issue?.issueType || ""} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={issue?.priority || ""} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={issue?.status || ""} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select name="assignedTo" defaultValue={issue?.assignedTo || ""} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user: User) => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                : (isEditing ? "Update Issue" : "Create Issue")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueForm;