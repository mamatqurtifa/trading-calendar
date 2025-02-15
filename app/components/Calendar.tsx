"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

interface CalendarDay {
  date: Date;
  status?: "PROFIT" | "LOSS" | "INACTIVE";
  totalProfitLoss?: number;
  numberOfTrades?: number;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`/api/calendar/${year}/${month}`);
      if (!response.ok) {
        throw new Error("Failed to fetch calendar data");
      }

      const data = await response.json();

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const mappedDays = days.map((day) => {
        const dayStatus = data.find(
          (status: CalendarDay) =>
            format(new Date(status.date), "yyyy-MM-dd") ===
            format(day, "yyyy-MM-dd")
        );

        return {
          date: day,
          ...dayStatus,
        };
      });

      setCalendarDays(mappedDays);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getDayClasses = (day: CalendarDay) => {
    const baseClasses = "p-3 border relative min-h-[80px]";
    const today = isSameDay(day.date, new Date());

    if (!isSameMonth(day.date, currentDate)) {
      return `${baseClasses} bg-gray-50 text-gray-400`;
    }

    if (today) {
      return `${baseClasses} bg-blue-50 border-blue-200`;
    }

    if (!day.status) return baseClasses;

    const statusClasses = {
      PROFIT: "bg-green-50 border-green-200",
      LOSS: "bg-red-50 border-red-200",
      INACTIVE: "bg-gray-50 border-gray-200",
    };

    return `${baseClasses} ${statusClasses[day.status]}`;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Error: {error}
        <button onClick={fetchCalendarData} className="ml-4 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={previousMonth}
          className="px-4 py-2 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={isLoading}
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={isLoading}
        >
          Next →
        </button>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium py-2 text-gray-600"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => (
            <div key={index} className={getDayClasses(day)}>
              <div className="flex justify-between">
                <span
                  className={`text-sm ${
                    isSameDay(day.date, new Date()) ? "font-bold" : ""
                  }`}
                >
                  {format(day.date, "d")}
                </span>
                {day.numberOfTrades !== undefined && day.numberOfTrades > 0 && (
                  <span className="text-xs bg-gray-200 rounded-full px-2">
                    {day.numberOfTrades}
                  </span>
                )}
              </div>
              {day.totalProfitLoss !== undefined && (
                <div
                  className={`text-sm mt-1 ${
                    day.totalProfitLoss > 0
                      ? "text-green-600"
                      : day.totalProfitLoss < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {day.totalProfitLoss > 0 ? "+" : ""}$
                  {day.totalProfitLoss.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
