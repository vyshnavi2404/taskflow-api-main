import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bug, CheckSquare, Clock, AlertCircle, User, Edit, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SubIssueForm from "@/components/forms/SubIssueForm";
import IssueForm from "@/components/forms/IssueForm";
import { useToast } from "@/hooks/use-toast";

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
  subIssues?: string[];
}

interface SubIssue {
  _id: string;
  customId: string;
  title: string;
  summary: string;
  subissueType: "SubTask" | "Bug";
  status: "Open" | "In Progress" | "Closed";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  parentIssue: string;
  projectId: string;
  sprintId: string;
}

const ITEMS_PER_PAGE = 5;

const IssueDetail = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issue/${issueId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete issue');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Issue deleted",
        description: "The issue has been successfully deleted.",
      });
      // Navigate back to sprint detail page
      if (issue?.sprintId) {
        navigate(`/sprints/${issue.sprintId}`);
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete sub-issue mutation
  const deleteSubIssueMutation = useMutation({
    mutationFn: async (subIssueId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subissue/${subIssueId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete sub-issue');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subissues', issueId] });
      toast({
        title: "Sub-issue deleted",
        description: "The sub-issue has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // First, get the issue to find the sprintId
  const { data: issue, isLoading: issueLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      // We need to find the issue by searching through sprints
      const sprintsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sprint`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!sprintsResponse.ok) throw new Error('Failed to fetch sprints');
      const sprints = await sprintsResponse.json();
      
      // Search through sprints to find the issue
      for (const sprint of sprints) {
        try {
          const issuesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issue/${sprint._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (issuesResponse.ok) {
            const issues = await issuesResponse.json();
            const foundIssue = issues.find((issue: Issue) => issue._id === issueId);
            if (foundIssue) {
              return foundIssue;
            }
          }
        } catch (error) {
          // Continue searching
        }
      }
      
      throw new Error('Issue not found');
    },
  });

  const { data: allSubIssues, isLoading: subIssuesLoading } = useQuery({
    queryKey: ['subissues', issueId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subissue/issue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch sub-issues');
      return response.json();
    },
    enabled: !!issueId,
  });

  // Pagination logic for sub-issues
  const totalPages = Math.ceil((allSubIssues?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const subIssues = allSubIssues?.slice(startIndex, endIndex) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Closed': return <CheckSquare className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Bug' ? <Bug className="h-4 w-4 text-red-500" /> : <CheckSquare className="h-4 w-4 text-blue-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (issueLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/projects/${issue?.projectId}`)} className="cursor-pointer">
                Project
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/sprints/${issue?.sprintId}`)} className="cursor-pointer">
                Sprint
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{issue?.customId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Issue Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {issue && getTypeIcon(issue.issueType)}
                <span className="text-lg text-gray-500">{issue?.customId}</span>
                <Badge className={`${issue ? getPriorityColor(issue.priority) : ''}`}>
                  {issue?.priority}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue?.title}</h1>
              <p className="text-gray-600 text-lg">{issue?.Summary}</p>
            </div>
            <div className="flex items-center space-x-2">
              <IssueForm 
                issue={issue}
                sprintId={issue?.sprintId!}
                projectId={issue?.projectId!}
                trigger={
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Issue
                  </Button>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this issue? This action cannot be undone and will also delete all sub-issues.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteIssueMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleteIssueMutation.isPending}
                    >
                      {deleteIssueMutation.isPending ? "Deleting..." : "Delete Issue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {issue && getStatusIcon(issue.status)}
              <Badge variant="secondary">
                {issue?.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Assigned to: {issue?.assignedTo}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Type: {issue?.issueType}</span>
            </div>
          </div>
        </div>

        {/* Sub-Issues Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Sub-Issues ({allSubIssues?.length || 0})
            </h2>
            {issueId && <SubIssueForm issueId={issueId} />}
          </div>
          
          {subIssuesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : subIssues?.length > 0 ? (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subIssues.map((subIssue: SubIssue) => (
                      <TableRow key={subIssue._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(subIssue.subissueType)}
                            <span className="text-sm">{subIssue.customId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{subIssue.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{subIssue.summary}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {subIssue.subissueType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getPriorityColor(subIssue.priority)}`}>
                            {subIssue.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subIssue.status)}
                            <Badge variant="secondary" className="text-xs">
                              {subIssue.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{subIssue.assignedTo}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <SubIssueForm 
                              subIssue={subIssue}
                              issueId={issueId!}
                              trigger={
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Sub-Issue</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this sub-issue? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteSubIssueMutation.mutate(subIssue._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteSubIssueMutation.isPending}
                                  >
                                    {deleteSubIssueMutation.isPending ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sub-issues yet</h3>
                <p className="text-gray-600 mb-4">Break down this issue into smaller tasks</p>
                {issueId && <SubIssueForm issueId={issueId} />}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IssueDetail;