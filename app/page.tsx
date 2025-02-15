"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import Calendar from "./components/Calendar";

interface TradingActivity {
  tokenName: string;
  investmentAmount?: number;
  profitLossAmount: number;
  profitLossPercentage?: number;
  notes?: string;
}

interface TodayStats {
  totalProfitLoss: number;
  numberOfTrades: number;
}

export default function Home() {
  const [formData, setFormData] = useState({
    tokenName: "",
    investmentAmount: "",
    profitLossAmount: "",
    notes: "",
  });
  const [activities, setActivities] = useState<TradingActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalProfitLoss: 0,
    numberOfTrades: 0,
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  const fetchTodayActivities = useCallback(async () => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch(`/api/trading/${today}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setTodayStats({
          totalProfitLoss: data.stats.totalProfitLoss || 0,
          numberOfTrades: data.stats.numberOfTrades || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validasi input
      if (!formData.tokenName.trim()) {
        throw new Error("Token name is required");
      }

      const profitLossAmount = parseFloat(formData.profitLossAmount);
      if (isNaN(profitLossAmount)) {
        throw new Error("Invalid profit/loss amount");
      }

      let investmentAmount: number | undefined;
      if (formData.investmentAmount) {
        investmentAmount = parseFloat(formData.investmentAmount);
        if (isNaN(investmentAmount) || investmentAmount <= 0) {
          throw new Error("Invalid investment amount");
        }
      }

      const payload = {
        tokenName: formData.tokenName.trim(),
        investmentAmount,
        profitLossAmount,
        tradingDate: today,
        notes: formData.notes?.trim() || undefined,
      };

      const response = await fetch("/api/trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData({
          tokenName: "",
          investmentAmount: "",
          profitLossAmount: "",
          notes: "",
        });
        fetchTodayActivities();
        alert("Trading activity added successfully!");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to add trading activity");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Error adding trading activity"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">
        Trading Activity for Today ({today})
      </h1>

      {/* Form dan Activities dalam satu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Add New Trading Activity
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Token Name *
              </label>
              <input
                type="text"
                value={formData.tokenName}
                onChange={(e) =>
                  setFormData({ ...formData, tokenName: e.target.value })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Investment Amount (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.investmentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, investmentAmount: e.target.value })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Profit/Loss Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.profitLossAmount}
                onChange={(e) =>
                  setFormData({ ...formData, profitLossAmount: e.target.value })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 ${
                isLoading ? "cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Trading Activity"}
            </button>
          </form>
        </div>

        {/* Today's Activities Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Today&apos;s Activities</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="mr-4">
                  Total Trades: {todayStats.numberOfTrades}
                </span>
                <span
                  className={`font-bold ${
                    todayStats.totalProfitLoss > 0
                      ? "text-green-600"
                      : todayStats.totalProfitLoss < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  Total P/L: {todayStats.totalProfitLoss > 0 ? "+" : ""}$
                  {todayStats.totalProfitLoss.toFixed(2)}
                </span>
              </div>
              <button
                onClick={fetchTodayActivities}
                className="text-blue-500 hover:text-blue-600"
                disabled={isLoadingActivities}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoadingActivities ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-gray-500">
                No trading activities recorded for today
              </p>
            ) : (
              activities.map((activity: TradingActivity, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border ${
                    activity.profitLossAmount > 0
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="font-medium">{activity.tokenName}</div>
                  {activity.investmentAmount && (
                    <div className="text-sm text-gray-600">
                      Investment: ${activity.investmentAmount.toFixed(2)}
                    </div>
                  )}
                  <div
                    className={`font-bold ${
                      activity.profitLossAmount > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {activity.profitLossAmount > 0 ? "+" : ""}$
                    {activity.profitLossAmount.toFixed(2)}
                  </div>
                  {activity.notes && (
                    <div className="text-sm text-gray-600 mt-1">
                      {activity.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Trading Calendar</h2>
        <Calendar />
      </div>

      {/* Footer dengan info timestamp */}
      <div className="text-center text-sm text-gray-500">
        <p>Current UTC Time: {currentTime}</p>
        <p>User: mamatqurtifa</p>
      </div>
    </main>
  );
}