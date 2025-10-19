"use client";

import { motion } from "framer-motion";
import {
  Archive,
  Calendar,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  Filter,
  LayoutGrid,
  Mail,
  MoreVertical,
  Search,
  Table as TableIcon,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubmissionsSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

type Submission = {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
  forms?: { title: string } | { title: string }[];
};

type FormSummary = { id: string; title: string };

export default function SubmissionsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [detailSubmission, setDetailSubmission] = useState<Submission | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSubmissions();
    fetchForms();
  }, [user]);

  const fetchForms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("forms")
        .select("id, title")
        .eq("user_id", user.id);

      if (!error) {
        setForms(data || []);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const fetchSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
    const { data, error } = await (supabase as any)
      .from("submissions")
        .select(`
          id, form_id, data, created_at,
          forms!inner (
            title
          )
        `)
        .eq("forms.user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error) {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sub) => {
        const name = String(sub.data?.name || sub.data?.full_name || "");
        const email = String(sub.data?.email || "");
        return (
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query)
        );
      });
    }

    // Form filter
    if (selectedFormId) {
      filtered = filtered.filter((sub) => sub.form_id === selectedFormId);
    }

    return filtered;
  }, [submissions, searchQuery, selectedFormId]);

  const getName = (submission: Submission) => {
    return String(
      submission.data?.name || submission.data?.full_name || "Lead",
    );
  };

  const getEmail = (submission: Submission) => {
    return String(submission.data?.email || "");
  };

  const getFormTitle = (submission: Submission) => {
    return Array.isArray(submission.forms)
      ? submission.forms[0]?.title
      : submission.forms?.title || "Form";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSelectSubmission = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  if (loading) {
    return <SubmissionsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-6 border-border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">
              View:
            </span>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="h-8 px-3"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-3"
              >
                <TableIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Form Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-3">
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedFormId
                    ? forms.find((f) => f.id === selectedFormId)?.title ||
                      "Form"
                    : "All Forms"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => setSelectedFormId(null)}>
                  All Forms
                </DropdownMenuItem>
                {forms.map((form) => (
                  <DropdownMenuItem
                    key={form.id}
                    onClick={() => setSelectedFormId(form.id)}
                  >
                    {form.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Submissions Content */}
      {filteredSubmissions.length === 0 ? (
        <Card className="border-2 border-dashed border-border">
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Mail className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No submissions yet
            </h3>
            <p className="text-muted-foreground text-center mb-8 max-w-md text-lg">
              Share your forms to start receiving submissions.
            </p>
          </div>
        </Card>
      ) : viewMode === "card" ? (
        // Card View
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="p-4 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {getName(submission).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {getName(submission)}
                      </div>
                      {getEmail(submission) && (
                        <div className="text-xs text-muted-foreground">
                          {getEmail(submission)}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {getFormTitle(submission)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDetailSubmission(submission)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{getTimeAgo(submission.created_at)}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        // Table View
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Form
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedIds.has(submission.id)}
                        onCheckedChange={() =>
                          handleSelectSubmission(submission.id)
                        }
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                          {getName(submission).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {getName(submission)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">
                        {getEmail(submission)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className="text-xs">
                        {getFormTitle(submission)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-muted-foreground">
                        {getTimeAgo(submission.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDetailSubmission(submission)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDetailSubmission(submission)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Submission Detail Dialog */}
      <Dialog
        open={detailSubmission !== null}
        onOpenChange={() => setDetailSubmission(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Submission Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Received{" "}
              {detailSubmission && getTimeAgo(detailSubmission.created_at)} via{" "}
              {detailSubmission && getFormTitle(detailSubmission)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {detailSubmission && (
              <div className="space-y-4">
                {Object.entries(detailSubmission.data).map(([key, value]) => (
                  <div
                    key={key}
                    className="border-b border-border pb-3 last:border-0"
                  >
                    <label className="text-sm font-medium text-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
