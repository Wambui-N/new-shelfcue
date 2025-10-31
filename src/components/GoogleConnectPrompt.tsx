"use client";

import { motion } from "framer-motion";
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
      id: "sheets",
      icon: (
        <svg
          className="w-10 h-10 text-primary-foreground"
          viewBox="0 0 24 24"
          role="img"
          aria-labelledby="google-sheets-icon"
        >
          <title id="google-sheets-icon">Google Sheets</title>
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-1h8v-2H8v2zm0-4h8v-2H8v2zm0-4h8V9H8v2z"
          />
        </svg>
      ),
      title: "Google Sheets",
      description: "Automatically sync form submissions to spreadsheets",
      color: "bg-green-100 text-green-600",
    },
    {
      id: "calendar",
      icon: (
        <svg
          className="w-10 h-10 text-primary-foreground"
          viewBox="0 0 24 24"
          role="img"
          aria-labelledby="google-calendar-icon"
        >
          <title id="google-calendar-icon">Google Calendar</title>
          <path
            fill="currentColor"
            d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V8h14v10zM7 10h5v5H7z"
          />
        </svg>
      ),
      title: "Google Calendar",
      description: "Create calendar events from form submissions",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "shield",
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
                role="img"
                aria-labelledby="google-icon"
              >
                <title id="google-icon">Google</title>
                <path
                  fill="currentColor"
                  d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.88 21.35,11.1 21.35,11.1Z"
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
            {permissions.map((permission) => (
              <motion.div
                key={permission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: permission.id === "sheets" ? 0.3 : permission.id === "calendar" ? 0.4 : 0.5, duration: 0.4 }}
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
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" role="img" aria-labelledby="google-icon">
                <title id="google-icon">Google</title>
                <path
                  fill="currentColor"
                  d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.88 21.35,11.1 21.35,11.1Z"
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
