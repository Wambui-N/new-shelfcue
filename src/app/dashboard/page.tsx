"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface FormRecord {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  status: "draft" | "published";
  submissions?: number;
}

interface SubmissionRecord {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
  forms?: { title: string } | { title: string }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [forms, setForms] = useState<FormRecord[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<
    SubmissionRecord[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({
    totalForms: 0,
    publishedForms: 0,
    leadsThisWeek: 0,
    lastLeadTime: null as string | null,
  });

  const [historicalStats, setHistoricalStats] = useState({
    submissionsLastWeek: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch forms data
        const { data: formsData, error: formsError } = await supabase
          .from("forms")
          .select("id, title, description, created_at, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!formsError) {
          setForms(formsData as FormRecord[]);
          const publishedCount =
            formsData?.filter((form) => form.status === "published").length ||
            0;
          setDashboardStats((prev) => ({
            ...prev,
            totalForms: formsData?.length || 0,
            publishedForms: publishedCount,
          }));
        }

        // Fetch recent submissions
        const { data: submissionsData, error: submissionsError } =
          await supabase
            .from("submissions")
            .select(`
            id, form_id, data, created_at,
            forms!inner (
              title
            )
          `)
            .eq("forms.user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(7);

        if (!submissionsError) {
          setRecentSubmissions(submissionsData || []);

          // Calculate leads this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const leadsThisWeek =
            submissionsData?.filter(
              (sub) => new Date(sub.created_at) >= oneWeekAgo,
            ).length || 0;

          // Get last lead time
          const lastLeadTime = submissionsData?.[0]?.created_at || null;

          setDashboardStats((prev) => ({
            ...prev,
            leadsThisWeek,
            lastLeadTime,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  const getTrendPercentage = () => {
    const currentWeek = dashboardStats.leadsThisWeek;
    const lastWeek = historicalStats.submissionsLastWeek;
    if (lastWeek === 0) return currentWeek > 0 ? 100 : 0;
    return Math.round(((currentWeek - lastWeek) / lastWeek) * 100);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Quick Stats */}
      <motion.div
        className="bg-gradient-to-r from-primary via-primary to-accent rounded-3xl p-8 text-primary-foreground shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <motion.h1
            className="text-4xl font-bold mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Welcome back,{" "}
            {user?.user_metadata?.full_name ||
              user?.email?.split("@")[0] ||
              "User"}
            !
          </motion.h1>
          <motion.p
            className="text-primary-foreground/80 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Here's what's happening with your forms today
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Forms */}
          <Link href="/dashboard/forms">
            <motion.div
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-primary-foreground/20 transition-all duration-300 group border border-primary-foreground/20"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-foreground/20 rounded-xl">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <ArrowRight className="w-5 h-5 text-primary-foreground/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {dashboardStats.publishedForms}
              </div>
              <div className="text-primary-foreground/80 text-sm font-medium">
                Active Forms
              </div>
            </motion.div>
          </Link>

          {/* Leads This Week */}
          <Link href="/dashboard/submissions">
            <motion.div
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-primary-foreground/20 transition-all duration-300 group border border-primary-foreground/20"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-foreground/20 rounded-xl">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  {getTrendPercentage() > 0 ? (
                    <ChevronUp className="w-4 h-4 text-primary-foreground/80" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary-foreground/80" />
                  )}
                  <span className="text-sm text-primary-foreground/80 font-medium">
                    {getTrendPercentage()}%
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">
                {dashboardStats.leadsThisWeek}
              </div>
              <div className="text-primary-foreground/80 text-sm font-medium">
                Leads This Week
              </div>
            </motion.div>
          </Link>

          {/* Last Lead */}
          <Link href="/dashboard/submissions">
            <motion.div
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-primary-foreground/20 transition-all duration-300 group border border-primary-foreground/20"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-foreground/20 rounded-xl">
                  <Clock className="w-6 h-6 text-primary-foreground" />
                </div>
                <ArrowRight className="w-5 h-5 text-primary-foreground/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {dashboardStats.lastLeadTime
                  ? formatTimeAgo(dashboardStats.lastLeadTime)
                  : "No leads yet"}
              </div>
              <div className="text-primary-foreground/80 text-sm font-medium">
                Last Lead
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Recent Activity */}
        <motion.div
          className="xl:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="shadow-sm border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Recent Activity
                </h3>
                <Link
                  href="/dashboard/submissions"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>

              {recentSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Share your forms to start capturing leads!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSubmissions.slice(0, 5).map((submission) => (
                    <motion.div
                      key={submission.id}
                      className="flex items-center gap-3 p-4 rounded-xl hover:bg-accent transition-colors group border border-transparent hover:border-border"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          New submission
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          via{" "}
                          {Array.isArray(submission.forms)
                            ? submission.forms[0]?.title
                            : submission.forms?.title || "Unknown Form"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(submission.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Your Forms Section */}
        <motion.div
          className="xl:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="shadow-sm border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Your Forms
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Manage and track your form performance
                  </p>
                </div>
                <Link href="/editor/new">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Form
                  </Button>
                </Link>
              </div>

              {forms.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No forms yet
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Create your first form to start collecting data and building
                    your lead generation system.
                  </p>
                  <Link href="/editor/new">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Form
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {forms.slice(0, 6).map((form, index) => (
                    <motion.div
                      key={form.id}
                      className="flex items-center gap-4 p-6 bg-background border border-border rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ y: -2 }}
                    >
                      {/* Form Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>

                      {/* Form Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground truncate text-lg">
                            {form.title}
                          </h3>
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
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {form.submissions || 0} submissions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(form.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 hover:bg-accent"
                        >
                          <Link href={`/editor/${form.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 hover:bg-accent"
                        >
                          <Link href={`/dashboard/forms/${form.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {forms.length > 6 && (
                    <div className="text-center pt-6">
                      <Link
                        href="/dashboard/forms"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        View all {forms.length} forms
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
