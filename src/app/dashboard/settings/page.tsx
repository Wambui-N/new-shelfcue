"use client";

import { motion } from "framer-motion";
import { Bell, CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SettingsSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
          Manage your account, billing, and notifications
        </p>
      </div>

      {/* Billing & Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 shadow-sm border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Billing & Subscription
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and billing information
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Current Plan
              </h3>
              <p className="text-sm text-muted-foreground">
                Professional Plan - $12/month
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Link>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
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
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
