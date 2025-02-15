import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tradingActivitySchema } from "@/lib/types";
import { isSameDay } from "date-fns";

export async function POST(req: Request) {
  try {
    const json = await req.json();

    // Validasi bahwa tanggal yang dikirim adalah hari ini
    const today = new Date();
    const tradingDate = new Date(json.tradingDate);

    if (!isSameDay(today, tradingDate)) {
      return NextResponse.json(
        { error: "Can only add trading activities for today" },
        { status: 400 }
      );
    }

    const body = tradingActivitySchema.parse(json);

    const tradingActivity = await prisma.tradingActivity.create({
      data: {
        tokenName: body.tokenName,
        investmentAmount: body.investmentAmount,
        profitLossAmount: body.profitLossAmount,
        tradingDate: tradingDate,
        notes: body.notes,
      },
    });

    // Update calendar status
    interface DailyStats {
      totalProfitLoss: string;
      numberOfTrades: bigint;
    }

    const dailyStats = await prisma.$queryRaw<DailyStats[]>`
      SELECT 
        CAST(SUM(profitLossAmount) AS DECIMAL(20,2)) as totalProfitLoss,
        COUNT(*) as numberOfTrades
      FROM TradingActivity
      WHERE DATE(tradingDate) = DATE(${tradingDate})
    `;

    const stats = dailyStats[0];
    const totalProfitLoss = Number(stats.totalProfitLoss) || 0;
    const numberOfTrades = Number(stats.numberOfTrades);

    await prisma.calendarStatus.upsert({
      where: {
        date: tradingDate,
      },
      create: {
        date: tradingDate,
        tradingStatus:
          totalProfitLoss > 0
            ? "PROFIT"
            : totalProfitLoss < 0
            ? "LOSS"
            : "INACTIVE",
        totalProfitLoss,
        numberOfTrades,
      },
      update: {
        tradingStatus:
          totalProfitLoss > 0
            ? "PROFIT"
            : totalProfitLoss < 0
            ? "LOSS"
            : "INACTIVE",
        totalProfitLoss,
        numberOfTrades,
      },
    });

    const sanitizedActivity = {
      ...tradingActivity,
      investmentAmount: tradingActivity.investmentAmount
        ? Number(tradingActivity.investmentAmount)
        : null,
      profitLossAmount: Number(tradingActivity.profitLossAmount),
    };

    return NextResponse.json(sanitizedActivity);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to add trading activity" },
      { status: 500 }
    );
  }
}
