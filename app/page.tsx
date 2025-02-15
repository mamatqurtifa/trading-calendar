"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import Calendar from "./components/Calendar";
import Header from "./components/Header";

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
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Form Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <i className="fas fa-plus-circle text-2xl icon-gradient"></i>
            <h2 className="text-xl font-semibold">Add New Trading Activity</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary">
                <i className="fas fa-coins mr-2 text-accent-orange"></i>
                Token Name *
              </label>
              <input
                type="text"
                value={formData.tokenName}
                onChange={(e) =>
                  setFormData({ ...formData, tokenName: e.target.value })
                }
                className="input"
                placeholder="Enter token name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Investment Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary">
                <i className="fas fa-dollar-sign mr-2 text-accent-teal"></i>
                Investment Amount (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.investmentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, investmentAmount: e.target.value })
                }
                className="input"
                placeholder="Enter investment amount"
                disabled={isLoading}
              />
            </div>

            {/* Profit/Loss Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary">
                <i className="fas fa-chart-line mr-2 text-accent-pink"></i>
                Profit/Loss Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.profitLossAmount}
                onChange={(e) =>
                  setFormData({ ...formData, profitLossAmount: e.target.value })
                }
                className="input"
                placeholder="Enter profit/loss amount"
                required
                disabled={isLoading}
              />
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary">
                <i className="fas fa-comment-alt mr-2 text-accent-purple"></i>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input"
                rows={3}
                placeholder="Add your trading notes here"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Add Trading Activity
                </>
              )}
            </button>
          </form>
        </div>

        {/* Today's Activities Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <i className="fas fa-list-ul text-2xl icon-gradient"></i>
              <h2 className="text-xl font-semibold">Today&apos;s Activities</h2>
            </div>

            {/* Today's Stats */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="stats-badge">
                  <i className="fas fa-chart-bar mr-2 text-accent-teal"></i>
                  <span>Trades: {todayStats.numberOfTrades}</span>
                </div>
                <div
                  className={`stats-badge ${
                    todayStats.totalProfitLoss > 0
                      ? "bg-success-light text-success-dark"
                      : "bg-error-light text-error-dark"
                  }`}
                >
                  <i
                    className={`fas fa-${
                      todayStats.totalProfitLoss > 0 ? "arrow-up" : "arrow-down"
                    } mr-2`}
                  ></i>
                  <span>
                    {todayStats.totalProfitLoss > 0 ? "+" : ""}$
                    {todayStats.totalProfitLoss.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={fetchTodayActivities}
                className="btn btn-secondary p-2"
                disabled={isLoadingActivities}
                aria-label="Refresh activities"
              >
                <i
                  className={`fas fa-sync ${
                    isLoadingActivities ? "fa-spin" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>

          {/* Activities List dengan Scroll */}
          <div className="space-y-4 h-[calc(100vh-300px)] min-h-[400px] max-h-[600px] overflow-y-auto pr-2 styled-scrollbar">
            {isLoadingActivities ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-chart-line text-4xl mb-3 text-accent-purple"></i>
                <p className="text-text-muted">
                  No trading activities recorded for today
                </p>
              </div>
            ) : (
              activities.map((activity: TradingActivity, index) => (
                <div
                  key={index}
                  className={`trading-card ${
                    activity.profitLossAmount > 0 ? "profit" : "loss"
                  } transition-transform hover:translate-x-1`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i
                        className={`fas fa-${
                          activity.profitLossAmount > 0
                            ? "arrow-up"
                            : "arrow-down"
                        } ${
                          activity.profitLossAmount > 0
                            ? "text-success-dark"
                            : "text-error-dark"
                        }`}
                      ></i>
                      <span className="font-medium">{activity.tokenName}</span>
                    </div>
                    <span
                      className={`stats-badge ${
                        activity.profitLossAmount > 0
                          ? "bg-success-light text-success-dark"
                          : "bg-error-light text-error-dark"
                      }`}
                    >
                      {activity.profitLossAmount > 0 ? "Profit" : "Loss"}
                    </span>
                  </div>

                  <div
                    className={`text-lg font-bold mt-2 ${
                      activity.profitLossAmount > 0
                        ? "text-success-dark"
                        : "text-error-dark"
                    }`}
                  >
                    {activity.profitLossAmount > 0 ? "+" : ""}$
                    {activity.profitLossAmount.toFixed(2)}
                  </div>

                  {activity.investmentAmount && (
                    <div className="text-sm text-text-muted mt-2">
                      <i className="fas fa-wallet mr-2 text-accent-teal"></i>
                      Investment: ${activity.investmentAmount.toFixed(2)}
                    </div>
                  )}

                  {activity.notes && (
                    <div className="text-sm text-text-muted mt-2">
                      <i className="fas fa-comment-alt mr-2 text-accent-purple"></i>
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
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-6">
          <i className="fas fa-calendar text-2xl icon-gradient"></i>
          <h2 className="text-xl font-semibold">Trading Calendar</h2>
        </div>
        <Calendar />
      </div>

      {/* Footer */}
      <footer className="text-center space-y-2 space-x-2">
        <div className="stats-badge inline-flex items-center gap-2">
          <i className="far fa-clock text-accent-purple"></i>
          <span>{currentTime}</span>
        </div>
        <div className="stats-badge inline-flex items-center gap-2">
          <i className="far fa-user text-accent-teal"></i>
          <span>mamatqurtifa</span>
        </div>
      </footer>
    </main>
  );
}
