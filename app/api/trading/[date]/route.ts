import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ date: string }> }
) {
  try {
    const params = await context.params;
    const date = new Date(params.date);

    const activities = await prisma.tradingActivity.findMany({
      where: {
        tradingDate: {
          equals: date,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    interface DailyStats {
      totalProfitLoss: number | null;
      numberOfTrades: number;
    }

    const dailyStats = await prisma.$queryRaw<DailyStats[]>`
      SELECT 
        CAST(SUM(profitLossAmount) AS DECIMAL(20,2)) as totalProfitLoss,
        COUNT(*) as numberOfTrades
      FROM TradingActivity
      WHERE DATE(tradingDate) = DATE(${date})
    `;

    // Sanitize data before sending response
    const sanitizedActivities = activities.map((activity) => ({
      ...activity,
      investmentAmount: activity.investmentAmount
        ? Number(activity.investmentAmount)
        : null,
      profitLossAmount: Number(activity.profitLossAmount),
    }));

    const sanitizedStats = {
      totalProfitLoss: dailyStats[0]
        ? Number(dailyStats[0].totalProfitLoss)
        : 0,
      numberOfTrades: dailyStats[0] ? Number(dailyStats[0].numberOfTrades) : 0,
    };

    return NextResponse.json({
      activities: sanitizedActivities,
      stats: sanitizedStats,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
