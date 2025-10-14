"use client";

import { motion } from "framer-motion";
import { Bell, Mail, Moon, Settings, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences and notifications
        </p>
      </div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 shadow-sm border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Notifications
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage how you receive updates
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="email-notifications"
                  className="text-foreground font-medium"
                >
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about new submissions
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="weekly-reports"
                  className="text-foreground font-medium"
                >
                  Weekly Reports
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get a weekly summary of your form performance
                </p>
              </div>
              <Switch id="weekly-reports" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="form-alerts"
                  className="text-foreground font-medium"
                >
                  Form Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a form receives a new submission
                </p>
              </div>
              <Switch id="form-alerts" defaultChecked />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card className="p-6 shadow-sm border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Preferences
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="auto-publish"
                  className="text-foreground font-medium"
                >
                  Auto-publish Forms
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically publish new forms after creation
                </p>
              </div>
              <Switch id="auto-publish" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="show-branding"
                  className="text-foreground font-medium"
                >
                  Show ShelfCue Branding
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display "Powered by ShelfCue" on your forms
                </p>
              </div>
              <Switch id="show-branding" defaultChecked />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
