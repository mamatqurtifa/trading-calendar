import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const params = await context.params;
    const year = parseInt(params.year);
    const month = parseInt(params.month);

    // Validasi input
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month" },
        { status: 400 }
      );
    }

    // Create date range for the month
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // Last day of the month

    const calendarStatus = await prisma.calendarStatus.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Sanitize data before sending response
    const sanitizedStatus = calendarStatus.map((status) => ({
      ...status,
      totalProfitLoss: Number(status.totalProfitLoss),
    }));

    return NextResponse.json(sanitizedStatus);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
