"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Plus,
  Sheet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface GoogleIntegrationPanelProps {
  formId: string;
  formFields: Array<{ id: string; label: string; type: string }>;
}

export function GoogleIntegrationPanel({
  formId,
  formFields,
}: GoogleIntegrationPanelProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [connectedSheet, setConnectedSheet] = useState<any>(null);
  const [connectedCalendar, setConnectedCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sheets dialog
  const [showSheetsDialog, setShowSheetsDialog] = useState(false);
  const [creatingSheet, setCreatingSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");

  // Calendar dialog
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(false);

  useEffect(() => {
    checkGoogleConnection();
    fetchConnectedIntegrations();
  }, [user, formId]);

  const checkGoogleConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_google_tokens")
        .select("id")
        .eq("user_id", user.id)
        .single();

      setIsGoogleConnected(!!data && !error);
    } catch (error) {
      setIsGoogleConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedIntegrations = async () => {
    if (!user || !formId) return;

    try {
      const { data: form } = await supabase
        .from("forms")
        .select(`
          default_sheet_connection_id,
          default_calendar_id,
          sheet_connections (
            id,
            sheet_id,
            sheet_name,
            sheet_url
          )
        `)
        .eq("id", formId)
        .single();

      if (form) {
        if (form.sheet_connections) {
          setConnectedSheet(
            Array.isArray(form.sheet_connections)
              ? form.sheet_connections[0]
              : form.sheet_connections,
          );
        }
        if (form.default_calendar_id) {
          setConnectedCalendar({ id: form.default_calendar_id });
        }
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    }
  };

  const handleConnectGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = "/api/auth/google";
  };

  const handleCreateSheet = async () => {
    if (!user || !newSheetName) return;

    setCreatingSheet(true);
    try {
      const headers = formFields.map((field) => field.label);

      const response = await fetch("/api/sheets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: newSheetName,
          headers,
          formId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create sheet");
      }

      const data = await response.json();

      setConnectedSheet({
        sheet_id: data.spreadsheetId,
        sheet_name: newSheetName,
        sheet_url: data.spreadsheetUrl,
      });

      setShowSheetsDialog(false);
      setNewSheetName("");
    } catch (error: any) {
      console.error("Error creating sheet:", error);
      alert(error.message || "Failed to create Google Sheet");
    } finally {
      setCreatingSheet(false);
    }
  };

  const handleLoadCalendars = async () => {
    if (!user) return;

    setLoadingCalendars(true);
    try {
      const response = await fetch(`/api/google/calendars?userId=${user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch calendars");
      }

      const data = await response.json();
      setCalendars(data.calendars || []);
    } catch (error: any) {
      console.error("Error loading calendars:", error);
      alert(error.message || "Failed to load calendars");
    } finally {
      setLoadingCalendars(false);
    }
  };

  const handleSelectCalendar = async (calendarId: string) => {
    if (!user || !formId) return;

    try {
      const { error } = await supabase
        .from("forms")
        .update({ default_calendar_id: calendarId })
        .eq("id", formId)
        .eq("user_id", user.id);

      if (error) throw error;

      setConnectedCalendar({ id: calendarId });
      setShowCalendarDialog(false);
    } catch (error: any) {
      console.error("Error connecting calendar:", error);
      alert(error.message || "Failed to connect calendar");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!isGoogleConnected) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Account
          </h3>
          <p className="text-muted-foreground mb-6">
            Connect your Google account to sync form submissions to Google
            Sheets and create calendar events automatically.
          </p>
          <Button
            onClick={handleConnectGoogle}
            className="bg-primary text-primary-foreground"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
            </svg>
            Connect Google
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google Sheets Integration */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Sheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Google Sheets</h3>
              <p className="text-sm text-muted-foreground">
                Sync submissions automatically
              </p>
            </div>
          </div>
          {connectedSheet && (
            <Badge className="bg-green-100 text-green-800">Connected</Badge>
          )}
        </div>

        {connectedSheet ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Sheet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {connectedSheet.sheet_name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(connectedSheet.sheet_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ✓ All form submissions will be automatically added to this sheet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create a new Google Sheet or connect an existing one to
              automatically sync form submissions.
            </p>
            <Button
              onClick={() => setShowSheetsDialog(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Google Sheet
            </Button>
          </div>
        )}
      </Card>

      {/* Google Calendar Integration */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Create events from submissions
              </p>
            </div>
          </div>
          {connectedCalendar && (
            <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
          )}
        </div>

        {connectedCalendar ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Calendar connected</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              ✓ Calendar events will be created from form submissions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect a Google Calendar to automatically create events when
              forms are submitted.
            </p>
            <Button
              onClick={() => {
                setShowCalendarDialog(true);
                handleLoadCalendars();
              }}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Google Calendar
            </Button>
          </div>
        )}
      </Card>

      {/* Create Sheet Dialog */}
      <Dialog open={showSheetsDialog} onOpenChange={setShowSheetsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Google Sheet</DialogTitle>
            <DialogDescription>
              Create a new Google Sheet to sync your form submissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-name">Sheet Name</Label>
              <Input
                id="sheet-name"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Form Responses - Contact Form"
              />
              <p className="text-xs text-muted-foreground">
                A new Google Sheet will be created in your Google Drive
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• New sheet created with form field headers</li>
                <li>• Each submission adds a new row automatically</li>
                <li>• Timestamp included with each submission</li>
                <li>• You can edit the sheet anytime in Google Sheets</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSheetsDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSheet}
              disabled={creatingSheet || !newSheetName}
              className="flex-1"
            >
              {creatingSheet ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sheet
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Selection Dialog */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Google Calendar</DialogTitle>
            <DialogDescription>
              Choose which calendar to use for creating events from form
              submissions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingCalendars ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : calendars.length > 0 ? (
              <div className="space-y-2">
                {calendars.map((calendar) => (
                  <button
                    key={calendar.id}
                    type="button"
                    onClick={() => handleSelectCalendar(calendar.id)}
                    className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            calendar.backgroundColor || "#4285F4",
                        }}
                      />
                      <div>
                        <div className="font-medium text-sm">
                          {calendar.summary}
                        </div>
                        {calendar.description && (
                          <div className="text-xs text-muted-foreground">
                            {calendar.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No calendars found
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
