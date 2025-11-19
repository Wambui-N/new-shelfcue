"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Eye,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnalyticsSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface FormAnalytics {
  form_title: string;
  total_submissions: number;
  total_views: number;
  conversion_rate: number;
}

interface AnalyticsData {
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  conversionRate: number;
  formsThisMonth: number;
  submissionsThisMonth: number;
  formAnalytics: FormAnalytics[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalForms: 0,
    totalSubmissions: 0,
    totalViews: 0,
    conversionRate: 0,
    formsThisMonth: 0,
    submissionsThisMonth: 0,
    formAnalytics: [] as FormAnalytics[],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch forms
        const { data: forms, error: formsError } = await supabase
          .from("forms")
          .select("id, title, status")
          .eq("user_id", user.id);

        if (!formsError) {
          setAnalyticsData((prev) => ({
            ...prev,
            totalForms: forms?.length || 0,
          }));
        }

        // Fetch submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from("submissions")
          .select("id, form_id, created_at")
          .in("form_id", forms?.map((f: { id: string }) => f.id) || []);

        if (!submissionsError) {
          // Calculate metrics
          const totalSubmissions = submissions?.length || 0;
          const totalViews = totalSubmissions * 10; // Mock views calculation

          // Calculate this month
          const now = new Date();
          const firstDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          );

          const formsThisMonth =
            forms?.filter(
              (form: { created_at: string }) =>
                new Date(form.created_at) >= firstDayOfMonth,
            ).length || 0;

          const submissionsThisMonth =
            submissions?.filter(
              (sub: { created_at: string }) =>
                new Date(sub.created_at) >= firstDayOfMonth,
            ).length || 0;

          const conversionRate =
            totalViews > 0
              ? Math.round((totalSubmissions / totalViews) * 100)
              : 0;

          setAnalyticsData((prev) => ({
            ...prev,
            totalSubmissions,
            totalViews,
            conversionRate,
            formsThisMonth,
            submissionsThisMonth,
          }));

          // Calculate per-form analytics
          const formAnalytics =
            forms?.map((form: { id: string; title: string }) => {
              const formSubmissions =
                submissions?.filter(
                  (sub: { form_id: string }) => sub.form_id === form.id,
                ) || [];
              const formViews = formSubmissions.length * 10;
              const formConversion =
                formViews > 0
                  ? Math.round((formSubmissions.length / formViews) * 100)
                  : 0;

              return {
                form_title: form.title,
                total_submissions: formSubmissions.length,
                total_views: formViews,
                conversion_rate: formConversion,
              };
            }) || [];

          setAnalyticsData((prev) => ({
            ...prev,
            formAnalytics,
          }));
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, supabase.from]);

  const metrics = [
    {
      title: "Total Forms",
      value: analyticsData.totalForms,
      change: {
        value: analyticsData.formsThisMonth,
        type: analyticsData.formsThisMonth > 0 ? "increase" : "neutral",
        label: "this month",
      },
      icon: <FileText className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      title: "Form Views",
      value: analyticsData.totalViews.toLocaleString(),
      change: {
        value: Math.round(analyticsData.totalViews * 0.2),
        type: "increase",
        label: "this month",
      },
      icon: <Eye className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      title: "Submissions",
      value: analyticsData.totalSubmissions.toLocaleString(),
      change: {
        value: analyticsData.submissionsThisMonth,
        type: analyticsData.submissionsThisMonth > 0 ? "increase" : "neutral",
        label: "this month",
      },
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: `${analyticsData.conversionRate}%`,
      change: {
        value: Math.round(analyticsData.conversionRate * 10) / 10,
        type: analyticsData.conversionRate > 0 ? "increase" : "neutral",
        label: "overall",
      },
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-600",
    },
  ];

  const recentActivity = analyticsData.formAnalytics.map(
    (form: FormAnalytics) => ({
      form: form.form_title || "Untitled Form",
      submissions: form.total_submissions,
      views: form.total_views,
      conversion: form.conversion_rate,
      trend: form.conversion_rate >= 15 ? "up" : "down",
    }),
  );

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your form performance and understand your audience
        </p>
      </div>

      {/* Time Range Selector */}
      <Card className="p-4 border-border shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Overview</h3>
          <div className="flex space-x-2">
            {["Last 7 days", "Last 30 days", "Last 3 months"].map(
              (range, index) => (
                <Badge
                  key={range}
                  variant={index === 0 ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {range}
                </Badge>
              ),
            )}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card className="p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${metric.color}`}
                >
                  {metric.icon}
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  {metric.change.type === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : metric.change.type === "decrease" ? (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span
                    className={
                      metric.change.type === "increase"
                        ? "text-green-600"
                        : metric.change.type === "decrease"
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }
                  >
                    {metric.change.value} {metric.change.label}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Performance */}
        <Card className="shadow-sm border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-primary" />
              Form Performance
            </h3>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((form, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-foreground">
                          {form.form}
                        </h4>
                        {form.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">
                            {form.submissions}
                          </span>
                          <p className="text-xs">Submissions</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            {form.views}
                          </span>
                          <p className="text-xs">Views</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            {form.conversion}%
                          </span>
                          <p className="text-xs">Conversion</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No form data yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first form to start seeing analytics
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Insights */}
        <Card className="shadow-sm border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <TrendingUp className="mr-3 h-5 w-5 text-green-600" />
              Quick Insights
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {recentActivity.length > 0 ? (
              <>
                {/* Best performing form */}
                {(() => {
                  const bestForm = recentActivity.reduce(
                    (best, current) =>
                      current.conversion > best.conversion ? current : best,
                    recentActivity[0],
                  );
                  return (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">
                            Best Performing Form
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            "{bestForm.form}" has the highest conversion rate at{" "}
                            {bestForm.conversion}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Total activity insight */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Total Activity
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You've received {analyticsData.totalSubmissions}{" "}
                        submissions from {analyticsData.totalViews} views
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optimization tip */}
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        Optimization Tip
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        {analyticsData.conversionRate < 10
                          ? "Your conversion rate could be improved. Try simplifying your forms or adding clear call-to-actions."
                          : analyticsData.conversionRate < 20
                            ? "Good conversion rate! Consider A/B testing different form layouts to optimize further."
                            : "Excellent conversion rate! Share your successful forms as templates for new ones."}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No insights yet</p>
                <p className="text-sm text-muted-foreground">
                  Insights will appear once you have form data
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="border-2 border-dashed border-border">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            More Analytics Coming Soon
          </h3>
          <p className="text-muted-foreground mb-4">
            We're working on advanced charts, detailed reports, and custom date
            ranges.
          </p>
          <Badge variant="secondary">Expected: Q2 2026</Badge>
        </div>
      </Card>
    </div>
  );
}
