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
    const baseClasses =
      "p-4 relative min-h-[100px] rounded-xl transition-all duration-200";
    const today = isSameDay(day.date, new Date());

    if (!isSameMonth(day.date, currentDate)) {
      return `${baseClasses} bg-primary-50/30 text-text-muted`;
    }

    if (today) {
      return `${baseClasses} bg-primary-100 border-2 border-primary-500 shadow-md`;
    }

    if (!day.totalProfitLoss) {
      return `${baseClasses} bg-card-bg border border-card-border hover:bg-card-hover`;
    }

    // Status berdasarkan profit/loss
    if (day.totalProfitLoss > 0) {
      return `${baseClasses} bg-success-light/20 border border-success-dark/20 hover:bg-success-light/30`;
    } else if (day.totalProfitLoss < 0) {
      return `${baseClasses} bg-error-light/20 border border-error-dark/20 hover:bg-error-light/30`;
    }

    return `${baseClasses} bg-card-bg border border-card-border hover:bg-card-hover`;
  };

  if (error) {
    return (
      <div className="p-6 bg-error-light border border-error-dark/20 rounded-xl text-error-dark">
        <div className="flex items-center gap-3 mb-2">
          <i className="fas fa-exclamation-circle text-xl"></i>
          <span className="font-medium">Error: {error}</span>
        </div>
        <button onClick={fetchCalendarData} className="btn btn-primary mt-2">
          <i className="fas fa-sync-alt mr-2"></i>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={previousMonth}
          className="btn btn-secondary flex items-center gap-2"
          disabled={isLoading}
        >
          <i className="fas fa-chevron-left"></i>
          <span className="hidden sm:inline">Previous</span>
        </button>

        <h2 className="text-2xl font-bold text-center">
          {format(currentDate, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="btn btn-secondary flex items-center gap-2"
          disabled={isLoading}
        >
          <span className="hidden sm:inline">Next</span>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {/* Calendar Days Header */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium py-2 text-text-secondary"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div key={index} className={getDayClasses(day)}>
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-medium ${
                    isSameDay(day.date, new Date())
                      ? "text-primary-600"
                      : "text-text-secondary"
                  }`}
                >
                  {format(day.date, "d")}
                </span>
                {day.numberOfTrades !== undefined && day.numberOfTrades > 0 && (
                  <span className="stats-badge text-xs">
                    <i className="fas fa-chart-line mr-1 text-accent-teal"></i>
                    {day.numberOfTrades}
                  </span>
                )}
              </div>

              {day.totalProfitLoss !== undefined ? (
                <div className="absolute bottom-3 left-3 right-3">
                  {day.totalProfitLoss === 0 ? (
                    // No Activity atau P/L = 0
                    <div className="text-sm font-medium text-text-muted">
                      <i className="fas fa-minus mr-1"></i>
                      $0.00
                    </div>
                  ) : (
                    // Profit atau Loss
                    <div
                      className={`text-sm font-medium flex items-center ${
                        day.totalProfitLoss > 0
                          ? "text-success-dark"
                          : "text-error-dark"
                      }`}
                    >
                      <div className="flex items-center w-full">
                        <i
                          className={`fas fa-arrow-${
                            day.totalProfitLoss > 0 ? "up" : "down"
                          } mr-2`}
                        ></i>
                        <span>
                          {day.totalProfitLoss > 0 ? "+" : ""}$
                          {Math.abs(day.totalProfitLoss).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Tidak ada data
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-sm font-medium text-text-muted opacity-50">
                    <i className="fas fa-minus mr-1"></i>
                    No activity
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
