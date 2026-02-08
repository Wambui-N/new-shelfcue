"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MeetingTimePickerProps {
  value?: string;
  onChange: (datetime: string) => void;
  duration?: number; // in minutes
  bufferTime?: number; // in minutes
  availableSlots?: string[]; // ISO datetime strings
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formId?: string; // Form ID to fetch owner's calendar
  calendarId?: string; // Calendar to check availability
  userId?: string; // User ID for fetching calendar data
  startHour?: number; // Start hour (0-23), default 9
  endHour?: number; // End hour (0-23), default 17
  timeZone?: string; // Timezone for slot generation (e.g., "America/New_York")
  availableDays?: number[]; // 0=Sun .. 6=Sat; when absent/empty, treat as weekdays [1,2,3,4,5]
}

// Generate time slots for a given date
const generateTimeSlots = (
  date: Date,
  duration: number = 30,
  bufferTime: number = 0,
  startHour: number = 9,
  endHour: number = 17,
  allowedDays?: number[], // 0=Sun .. 6=Sat; when absent, weekdays only (skip 0, 6)
): string[] => {
  const slots: string[] = [];
  const currentDate = new Date();
  const selectedDate = new Date(date);

  // Set to start of day
  selectedDate.setHours(startHour, 0, 0, 0);

  // If it's today, start from next available slot
  if (selectedDate.toDateString() === currentDate.toDateString()) {
    const now = new Date();
    const nextSlot = new Date(now);
    nextSlot.setMinutes(
      Math.ceil(now.getMinutes() / duration) * duration,
      0,
      0,
    );
    if (nextSlot.getHours() >= startHour && nextSlot.getHours() < endHour) {
      selectedDate.setTime(nextSlot.getTime());
    } else {
      selectedDate.setHours(startHour + 1, 0, 0, 0);
    }
  }

  // Generate slots until end hour
  while (selectedDate.getHours() < endHour) {
    const day = selectedDate.getDay();
    const skip =
      allowedDays != null && allowedDays.length > 0
        ? !allowedDays.includes(day)
        : day === 0 || day === 6;
    if (skip) {
      selectedDate.setHours(selectedDate.getHours() + 1, 0, 0, 0);
      continue;
    }

    slots.push(selectedDate.toISOString());
    selectedDate.setMinutes(selectedDate.getMinutes() + duration + bufferTime);
  }

  return slots;
};

const formatTime = (isoString: string, use24Hour: boolean = false): string => {
  const date = new Date(isoString);
  if (use24Hour) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  }
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const _lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add days from previous month to fill the first week
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  return days;
};

export function MeetingTimePicker({
  value,
  onChange,
  duration = 30,
  bufferTime = 0,
  availableSlots = [],
  placeholder = "Select date and time",
  disabled = false,
  className,
  formId,
  calendarId,
  userId,
  startHour = 9,
  endHour = 17,
  timeZone,
  availableDays,
}: MeetingTimePickerProps) {
  const effectiveDays =
    availableDays != null && availableDays.length > 0
      ? availableDays
      : [1, 2, 3, 4, 5];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hasSelectedDate, setHasSelectedDate] = useState<boolean>(!!value);
  const [use24Hour, setUse24Hour] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [realAvailableSlots, setRealAvailableSlots] = useState<string[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close overlay on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Parse current value
  const currentDateTime = value ? new Date(value) : null;

  // Fetch real availability from calendar when we have the required props
  useEffect(() => {
    if (userId && calendarId && selectedDate) {
      const fetchAvailability = async () => {
        setLoadingAvailability(true);
        setAvailabilityError(null);

        try {
          // Check availability for 60 days ahead from selected date
          const startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 60);
          endDate.setHours(23, 59, 59, 999);

          const params = new URLSearchParams({
            userId,
            calendarId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            duration: duration.toString(),
            bufferTime: bufferTime.toString(),
            startHour: startHour.toString(),
            endHour: endHour.toString(),
          });
          
          // Add timezone if provided
          if (timeZone) {
            params.append("timeZone", timeZone);
          }
          if (effectiveDays.length > 0) {
            params.append("availableDays", effectiveDays.join(","));
          }

          const response = await fetch(
            `/api/google/calendar/availability?${params}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch availability");
          }

          const data = await response.json();
          setRealAvailableSlots(data.availableSlots || []);
        } catch (error) {
          console.error("Error fetching calendar availability:", error);
          setAvailabilityError(
            "Could not fetch calendar availability. Showing all slots.",
          );
          // Fall back to generated slots
          setRealAvailableSlots([]);
        } finally {
          setLoadingAvailability(false);
        }
      };

      fetchAvailability();
    }
  }, [userId, calendarId, selectedDate, duration, bufferTime, startHour, endHour, timeZone, effectiveDays]);

  // Generate available time slots for selected date
  const timeSlots = useMemo(() => {
    // If we have real availability data, use it
    if (realAvailableSlots.length > 0) {
      // Filter to only show slots for the selected date
      return realAvailableSlots.filter((slot) => {
        const slotDate = new Date(slot);
        return slotDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Otherwise, generate theoretical slots
    return generateTimeSlots(
      selectedDate,
      duration,
      bufferTime,
      startHour,
      endHour,
      effectiveDays,
    );
  }, [selectedDate, duration, bufferTime, startHour, endHour, realAvailableSlots, effectiveDays]);

  // Calendar data
  const calendarDays = useMemo(() => {
    return getDaysInMonth(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setHasSelectedDate(true);
  };

  const handleTimeSelect = (timeSlot: string) => {
    onChange(timeSlot);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Must be today or future
    if (date < today) return false;

    const day = date.getDay();
    if (!effectiveDays.includes(day)) return false;

    return true;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === selectedDate.getMonth();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentValueDate = (date: Date): boolean => {
    if (!currentDateTime) return false;
    return date.toDateString() === currentDateTime.toDateString();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between text-left font-normal",
          !value && "text-muted-foreground",
        )}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {value ? (
            <span>
              {formatDate(value)} at {formatTime(value, use24Hour)}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.div>
      </Button>

      {/* Calendar overlay (portal to body so it overlays everything) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
              >
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setIsOpen(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-t-xl sm:rounded-lg shadow-lg flex flex-col sm:flex-row"
                >
                  <div className="flex flex-col sm:flex-row h-auto sm:h-96 flex-1 min-h-0">
              {/* Calendar Section */}
              <div className="w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-gray-200 p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {getMonthName(selectedDate)}
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 px-1">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-[9px] sm:text-[10px] font-medium text-gray-500 text-center py-1 sm:py-1.5"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 px-1">
                  {calendarDays.map((date, index) => {
                    const available = isDateAvailable(date);
                    const currentMonth = isCurrentMonth(date);
                    const today = isToday(date);
                    const selected = isSelectedDate(date);
                    const hasValue = isCurrentValueDate(date);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => available && handleDateSelect(date)}
                        disabled={!available}
                        className={cn(
                          "h-8 sm:h-9 w-full min-w-[2rem] text-[11px] sm:text-xs rounded-md transition-colors flex items-center justify-center",
                          !currentMonth && "text-gray-300",
                          currentMonth &&
                            available &&
                            "text-gray-900 hover:bg-gray-100",
                          !available &&
                            currentMonth &&
                            "text-gray-300 cursor-not-allowed",
                          selected && "bg-black text-white hover:bg-gray-900",
                          today && !selected && "bg-gray-100 text-black",
                          hasValue && !selected && "bg-gray-200 text-black",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="w-full sm:w-1/2 p-4 flex flex-col min-h-0">
                {/* Time Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {formatDate(selectedDate.toISOString())}
                  </h3>
                  <div className="flex bg-gray-100 rounded-md p-1">
                    <button
                      type="button"
                      onClick={() => setUse24Hour(false)}
                      className={cn(
                        "px-2 py-1 text-xs rounded transition-colors",
                        !use24Hour
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900",
                      )}
                    >
                      12h
                    </button>
                    <button
                      type="button"
                      onClick={() => setUse24Hour(true)}
                      className={cn(
                        "px-2 py-1 text-xs rounded transition-colors",
                        use24Hour
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900",
                      )}
                    >
                      24h
                    </button>
                  </div>
                </div>

                {/* Time Slots */}
                {hasSelectedDate ? (
                  <div className="flex-1 overflow-y-auto mt-1 min-h-0">
                    {loadingAvailability ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">
                            Checking availability...
                          </p>
                        </div>
                      </div>
                    ) : availabilityError ? (
                      <div className="mb-2">
                        <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-2">
                          {availabilityError}
                        </div>
                      </div>
                    ) : null}

                    {!loadingAvailability && timeSlots.length > 0 ? (
                      <div className="space-y-2">
                        {timeSlots.map((slot) => {
                          const isSelected = value === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSelect(slot)}
                              className={cn(
                                "w-full text-left px-2.5 sm:px-3 py-2 text-xs sm:text-sm rounded-md transition-colors",
                                isSelected
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-100",
                              )}
                            >
                              {formatTime(slot, use24Hour)}
                            </button>
                          );
                        })}
                      </div>
                    ) : !loadingAvailability ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No available times</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center mt-2">
                    <p className="text-xs text-gray-500">
                      Select a date to see available times.
                    </p>
                  </div>
                )}
              </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
