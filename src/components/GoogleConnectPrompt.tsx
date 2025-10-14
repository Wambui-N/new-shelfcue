"use client";

import { motion } from "framer-motion";
import { Calendar, CheckCircle, Sheet, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GoogleConnectPromptProps {
  onConnect: () => void;
  onSkip: () => void;
}

export function GoogleConnectPrompt({
  onConnect,
  onSkip,
}: GoogleConnectPromptProps) {
  const permissions = [
    {
      icon: <Sheet className="w-5 h-5" />,
      title: "Google Sheets",
      description: "Automatically sync form submissions to spreadsheets",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Google Calendar",
      description: "Create calendar events from form submissions",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Access",
      description: "Your data is encrypted and never shared with third parties",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                className="w-10 h-10 text-primary-foreground"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </motion.div>

            <h2 className="text-3xl font-bold text-foreground mb-3">
              Connect Google Workspace
            </h2>
            <p className="text-lg text-muted-foreground">
              Supercharge your forms with Google integrations
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mb-8">
            {permissions.map((permission, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
              >
                <div className="flex items-start gap-4 p-4 bg-background-secondary rounded-xl border border-border">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${permission.color}`}
                  >
                    {permission.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {permission.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Permissions Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Permissions We'll Request
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    • <strong>View and manage Google Sheets</strong> - To sync
                    form submissions
                  </li>
                  <li>
                    • <strong>View and manage Google Calendar</strong> - To
                    create events
                  </li>
                  <li>
                    • <strong>View Google Drive files</strong> - To list your
                    existing sheets
                  </li>
                </ul>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                  You can revoke access anytime from your Google Account
                  settings
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onConnect}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
              </svg>
              Connect Google Account
            </Button>
            <Button onClick={onSkip} variant="outline" className="flex-1 h-12">
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            You can always connect Google later from your dashboard settings
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
