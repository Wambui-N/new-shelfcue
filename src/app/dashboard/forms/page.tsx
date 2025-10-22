"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  Edit,
  Eye,
  FileText,
  Filter,
  Grid3x3,
  List,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormsListSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Form = Database["public"]["Tables"]["forms"]["Row"] & {
  submissions_count?: number;
};

import { useRouter } from "next/navigation";

export default function FormsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [sortBy, _setSortBy] = useState<"created" | "name" | "submissions">(
    "created",
  );
  const [sortDirection, _setSortDirection] = useState<"asc" | "desc">("desc");

  // Delete dialog state
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [_error, setError] = useState<string | null>(null);
  const [canCreateForm, setCanCreateForm] = useState(true);

  const fetchForms = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Temporarily allow form creation on the client side.
      // Enforcement will happen on the backend.
      setCanCreateForm(true);

      const { data, error } = await supabase
        .from("forms")
        .select("id, title, status, created_at, submissions(id)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Map the data to include submissions count
      const dataWithCount = (data || []).map((form: any) => ({
        ...form,
        submissions_count: Array.isArray(form.submissions)
          ? form.submissions.length
          : 0,
      }));

      setForms(dataWithCount as Form[]);
    } catch (error) {
      console.error("Error fetching forms:", error);
      setError("Failed to load forms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const filteredAndSortedForms = useMemo(() => {
    const filtered = forms.filter((form) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = form.title.toLowerCase().includes(query);
        const matchesDescription =
          form.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter !== "all" && form.status !== statusFilter) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "created":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "submissions":
          comparison = (a.submissions_count || 0) - (b.submissions_count || 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [forms, searchQuery, statusFilter, sortBy, sortDirection]);

  const filterCounts = useMemo(
    () => ({
      all: forms.length,
      published: forms.filter((f) => f.status === "published").length,
      draft: forms.filter((f) => f.status === "draft").length,
    }),
    [forms],
  );

  const handleSelectForm = (formId: string) => {
    const newSelected = new Set(selectedForms);
    if (newSelected.has(formId)) {
      newSelected.delete(formId);
    } else {
      newSelected.add(formId);
    }
    setSelectedForms(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedForms.size === filteredAndSortedForms.length) {
      setSelectedForms(new Set());
    } else {
      setSelectedForms(new Set(filteredAndSortedForms.map((form) => form.id)));
    }
  };

  const handleStatusToggle = async (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";

    try {
      const { error } = await (supabase as any)
        .from("forms")
        .update({ status: newStatus })
        .eq("id", formId);

      if (!error) {
        setForms(
          forms.map((form) =>
            form.id === formId
              ? { ...form, status: newStatus as "draft" | "published" }
              : form,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating form status:", error);
    }
  };

  const handleDeleteForm = async () => {
    if (!formToDelete || deleteConfirmation !== "DELETE" || !user?.id) return;

    try {
      const { error } = await (supabase as any)
        .from("forms")
        .delete()
        .eq("id", formToDelete.id);

      if (!error) {
        setForms(forms.filter((form) => form.id !== formToDelete.id));
        setDeleteDialogOpen(false);
        setFormToDelete(null);
        setDeleteConfirmation("");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  const handleBulkActivate = async () => {
    const formIds = Array.from(selectedForms);

    try {
      const { error } = await (supabase as any)
        .from("forms")
        .update({ status: "published" })
        .in("id", formIds);

      if (!error) {
        setForms(
          forms.map((form) =>
            selectedForms.has(form.id)
              ? { ...form, status: "published" as const }
              : form,
          ),
        );
        setSelectedForms(new Set());
      }
    } catch (error) {
      console.error("Error activating forms:", error);
    }
  };

  const handleBulkDeactivate = async () => {
    const formIds = Array.from(selectedForms);

    try {
      const { error } = await (supabase as any)
        .from("forms")
        .update({ status: "draft" })
        .in("id", formIds);

      if (!error) {
        setForms(
          forms.map((form) =>
            selectedForms.has(form.id)
              ? { ...form, status: "draft" as const }
              : form,
          ),
        );
        setSelectedForms(new Set());
      }
    } catch (error) {
      console.error("Error deactivating forms:", error);
    }
  };

  const _getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <FormsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Forms
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage all your forms and view performance
          </p>
        </div>
        <div className="flex justify-end">
          {canCreateForm ? (
            <Button onClick={() => router.push("/editor/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          ) : (
            <Button onClick={() => router.push("/dashboard/billing")}>
              <Plus className="mr-2 h-4 w-4" />
              Subscribe to Create Forms
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-4 sm:p-6 border-border shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top Row - View Toggle and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                View:
              </span>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search forms..."
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
          </div>

          {/* Bottom Row - Status Filter */}
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-3">
                  <Filter className="w-4 h-4 mr-2" />
                  Status
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  <div className="flex items-center justify-between w-full">
                    <span>All</span>
                    <Badge variant="secondary" className="ml-2">
                      {filterCounts.all}
                    </Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Active</span>
                    <Badge variant="secondary" className="ml-2">
                      {filterCounts.published}
                    </Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                  <div className="flex items-center justify-between w-full">
                    <span>Draft</span>
                    <Badge variant="secondary" className="ml-2">
                      {filterCounts.draft}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedForms.size > 0 && (
        <motion.div
          className="bg-primary/10 border border-primary/20 rounded-xl p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium text-primary">
                {selectedForms.size} form{selectedForms.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkActivate}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                  className="text-xs"
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Deactivate
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedForms(new Set())}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Forms Content */}
      {filteredAndSortedForms.length === 0 ? (
        <Card className="border-2 border-dashed border-border">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-primary-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 text-center">
              {searchQuery ? "No forms match your search" : "No forms yet"}
            </h3>
            <p className="text-muted-foreground text-center mb-6 sm:mb-8 max-w-md text-sm sm:text-lg">
              {searchQuery
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Create your first form to start capturing leads and syncing them to Google Sheets automatically."}
            </p>
            {searchQuery ? (
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear search
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/editor/new")}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Your First Form
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 px-2 sm:px-4">
            <Checkbox
              id="select-all"
              checked={
                selectedForms.size === filteredAndSortedForms.length &&
                filteredAndSortedForms.length > 0
              }
              onCheckedChange={handleSelectAll}
              className="border-2 border-foreground/30 data-[state=checked]:border-primary"
            />
            <label
              htmlFor="select-all"
              className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
            >
              Select all forms ({filteredAndSortedForms.length})
            </label>
          </div>

          {viewMode === "grid" ? (
            // Grid View
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedForms.map((form, index) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card
                    className={`group hover:shadow-xl transition-all duration-300 h-full flex flex-col ${
                      selectedForms.has(form.id)
                        ? "ring-2 ring-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <div className="p-4 sm:p-5 flex flex-col h-full">
                      {/* Checkbox and Status Badge Row */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <Checkbox
                          checked={selectedForms.has(form.id)}
                          onCheckedChange={() => handleSelectForm(form.id)}
                          className="border-2 border-foreground/30 data-[state=checked]:border-primary"
                        />
                        <Badge
                          variant={
                            form.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {form.status === "published" ? "Active" : "Draft"}
                        </Badge>
                      </div>

                      {/* Form Name */}
                      <Link
                        href={`/editor/${form.id}`}
                        className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2"
                      >
                        {form.title}
                      </Link>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4 min-h-[2rem] sm:min-h-[2.5rem]">
                        {form.description || "No description"}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{form.submissions_count || 0} submissions</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 mt-auto border-t border-border">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            asChild
                          >
                            <Link href={`/editor/${form.id}`}>
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            asChild
                          >
                            <Link href={`/dashboard/forms/${form.id}`}>
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/editor/${form.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusToggle(form.id, form.status)
                              }
                            >
                              {form.status === "published" ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setFormToDelete(form);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // Table View - Hidden on mobile, show grid instead
            <div className="hidden lg:block">
              <Card className="border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left">
                          <Checkbox
                            checked={
                              selectedForms.size ===
                                filteredAndSortedForms.length &&
                              filteredAndSortedForms.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                            className="border-2 border-foreground/30 data-[state=checked]:border-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          Form Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          Submissions
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAndSortedForms.map((form) => (
                        <tr
                          key={form.id}
                          className={`hover:bg-accent/50 transition-colors ${
                            selectedForms.has(form.id) ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <Checkbox
                              checked={selectedForms.has(form.id)}
                              onCheckedChange={() => handleSelectForm(form.id)}
                              className="border-2 border-foreground/30 data-[state=checked]:border-primary"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {form.title}
                                </div>
                                {form.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {form.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={form.status === "published"}
                                onCheckedChange={() =>
                                  handleStatusToggle(form.id, form.status)
                                }
                              />
                              <Badge
                                variant={
                                  form.status === "published"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {form.status === "published"
                                  ? "Active"
                                  : "Draft"}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-foreground">
                              {form.submissions_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(form.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                asChild
                              >
                                <Link href={`/editor/${form.id}`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
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
                                  <DropdownMenuItem asChild>
                                    <Link href={`/editor/${form.id}`}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusToggle(form.id, form.status)
                                    }
                                  >
                                    {form.status === "published" ? (
                                      <>
                                        <Pause className="w-4 h-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setFormToDelete(form);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
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
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">
              Delete "{formToDelete?.title}"?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will delete the form and all{" "}
              {formToDelete?.submissions_count || 0} submissions. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Type "DELETE" to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteForm}
              disabled={deleteConfirmation !== "DELETE"}
            >
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
