"use client";

import { Calendar, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MeetingConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (calendarId: string) => void;
  userId: string;
}

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
}

export function MeetingConfigDialog({
  open,
  onOpenChange,
  onConfirm,
  userId,
}: MeetingConfigDialogProps) {
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      console.log(
        "📅 MeetingConfigDialog opened, fetching calendars for user:",
        userId,
      );
      fetchCalendars();
    }
  }, [open, userId]);

  const fetchCalendars = async () => {
    console.log("📅 Fetching calendars...");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/google/calendars?userId=${userId}`);
      console.log("📅 Calendar fetch response:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch calendars");
      }
      const data = await response.json();
      console.log("📅 Calendars fetched:", data.calendars?.length || 0);
      setCalendars(data.calendars || []);

      // Auto-select primary calendar if available
      const primaryCalendar = data.calendars?.find(
        (cal: GoogleCalendar) => cal.primary,
      );
      if (primaryCalendar) {
        setSelectedCalendar(primaryCalendar.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    console.log("📅 Confirming calendar selection:", selectedCalendar);
    if (selectedCalendar) {
      onConfirm(selectedCalendar);
      onOpenChange(false);
    } else {
      console.log("⚠️ No calendar selected");
    }
  };

  console.log("📅 MeetingConfigDialog render - open:", open, "userId:", userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Configure Meeting Booking
          </DialogTitle>
          <DialogDescription>
            Select which Google Calendar should be used to check availability
            and book meetings for this form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading calendars...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCalendars}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : calendars.length === 0 ? (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                No calendars found
              </p>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-medium mb-2">
                Select Calendar
              </Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {calendars.map((calendar) => (
                  <button
                    key={calendar.id}
                    type="button"
                    onClick={() => setSelectedCalendar(calendar.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedCalendar === calendar.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-input hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                          selectedCalendar === calendar.id
                            ? "border-primary bg-primary"
                            : "border-input"
                        }`}
                      >
                        {selectedCalendar === calendar.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {calendar.summary}
                          </p>
                          {calendar.primary && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        {calendar.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {calendar.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    Available time slots are checked against this calendar
                  </li>
                  <li>
                    Booked meetings are automatically added to this calendar
                  </li>
                  <li>Prevents double-booking by checking for conflicts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedCalendar || loading}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Confirm Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
