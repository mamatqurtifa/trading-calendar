import { z } from "zod";

export const tradingActivitySchema = z.object({
  tokenName: z.string().min(1),
  investmentAmount: z.number().optional(),
  profitLossAmount: z.number(),
  tradingDate: z.string(), // YYYY-MM-DD format
  notes: z.string().optional(),
});

export type TradingActivity = z.infer<typeof tradingActivitySchema>;
