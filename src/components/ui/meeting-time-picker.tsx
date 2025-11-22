"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
}

// Generate time slots for a given date
const generateTimeSlots = (
  date: Date,
  duration: number = 30,
  bufferTime: number = 0,
  startHour: number = 9,
  endHour: number = 17,
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
    // Skip weekends (optional - you can make this configurable)
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
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
}: MeetingTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [use24Hour, setUse24Hour] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Parse current value
  const currentDateTime = value ? new Date(value) : null;

  // Generate available time slots for selected date
  const timeSlots = useMemo(() => {
    return generateTimeSlots(selectedDate, duration, bufferTime);
  }, [selectedDate, duration, bufferTime]);

  // Calendar data
  const calendarDays = useMemo(() => {
    return getDaysInMonth(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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

    // Must be weekday (you can make this configurable)
    if (date.getDay() === 0 || date.getDay() === 6) return false;

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

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="flex h-96">
              {/* Calendar Section */}
              <div className="w-1/2 border-r border-gray-200 p-4">
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
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-xs font-medium text-gray-500 text-center py-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
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
                          "h-10 w-full min-w-[2.5rem] text-sm rounded-md transition-colors flex items-center justify-center",
                          !currentMonth && "text-gray-300",
                          currentMonth &&
                            available &&
                            "text-gray-700 hover:bg-gray-100",
                          !available &&
                            currentMonth &&
                            "text-gray-300 cursor-not-allowed",
                          selected &&
                            "bg-gray-900 text-white hover:bg-gray-800",
                          today && !selected && "bg-blue-100 text-blue-900",
                          hasValue &&
                            !selected &&
                            "bg-green-100 text-green-900",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="w-1/2 p-4 flex flex-col">
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
                <div className="flex-1 overflow-y-auto">
                  {timeSlots.length > 0 ? (
                    <div className="space-y-2">
                      {timeSlots.map((slot) => {
                        const isSelected = value === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeSelect(slot)}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No available times</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
