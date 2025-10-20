"use client";

import {
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type RoadmapStatus = "not_started" | "in_progress" | "beta" | "done";

interface RoadmapItem {
  id: string;
  title: string;
  status: RoadmapStatus;
  description?: string | null;
  created_at?: string | null;
}

export default function FeaturesHubPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);

  const statusBadge = (status: RoadmapStatus) => {
    switch (status) {
      case "done":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Done
          </span>
        );
      case "beta":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" /> Beta
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> In progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-600 border border-gray-200">
            Not started
          </span>
        );
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("roadmap_items")
          .select("id, title, status, description, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (isMounted && Array.isArray(data)) setRoadmap(data as RoadmapItem[]);
      } catch (_e) {
        // Fallback: static examples if table doesn't exist yet
        if (isMounted) {
          setRoadmap([
            { id: "1", title: "Developer API", status: "beta" },
            { id: "2", title: "Form visit analytics", status: "done" },
            { id: "3", title: "Question drop-off analytics", status: "done" },
            { id: "4", title: "Framer plugin", status: "done" },
            { id: "5", title: "AI assistant", status: "in_progress" },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRoadmap();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const submitRequest = async () => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      if (!title.trim()) throw new Error("Please enter a short title");
      const payload = {
        title: title.trim(),
        details: details.trim() || null,
      };
      const { error } = await (supabase as any)
        .from("feature_requests")
        .insert(payload);
      if (error) throw error;
      setTitle("");
      setDetails("");
      setMessage("Thanks! Your request has been submitted.");
    } catch (e: any) {
      setError(e?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<RoadmapStatus, RoadmapItem[]> = {
      not_started: [],
      in_progress: [],
      beta: [],
      done: [],
    };
    for (const item of roadmap) {
      (groups[item.status || "not_started"] || groups.not_started).push(item);
    }
    return groups;
  }, [roadmap]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-primary" /> Features Hub
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a feature request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tell us what would help you succeed. We prioritize the most
              impactful ideas.
            </p>
            <div className="space-y-2">
              <Label htmlFor="feature-title">Title</Label>
              <Input
                id="feature-title"
                placeholder="E.g., Slack integration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature-details">Details (optional)</Label>
              <Textarea
                id="feature-details"
                placeholder="What problem does this solve? Any specifics welcome."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={submitRequest} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Submit request
                  </>
                )}
              </Button>
              {message && (
                <span className="text-sm text-emerald-600">{message}</span>
              )}
              {error && (
                <span className="text-sm text-destructive">{error}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading
                roadmap...
              </div>
            ) : (
              <div className="space-y-4">
                {(
                  [
                    "beta",
                    "in_progress",
                    "done",
                    "not_started",
                  ] as RoadmapStatus[]
                ).map((status) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {statusBadge(status)}
                      <span className="text-sm font-medium capitalize">
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {grouped[status].length === 0 && (
                        <li className="text-xs text-muted-foreground">
                          No items yet
                        </li>
                      )}
                      {grouped[status].map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start justify-between rounded-md border p-3"
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
