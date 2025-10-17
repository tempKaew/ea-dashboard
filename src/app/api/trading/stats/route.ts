import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    // Step 1: Get accounts stats (all accounts or specific account)
    let accountsQuery = `
      SELECT 
        COUNT(a.id) as total_accounts,
        COALESCE(SUM(a.balance), 0) as total_balance,
        COALESCE(SUM(a.equity), 0) as total_equity
      FROM accounts a
    `;

    const accountsParams: (string | number)[] = [];

    if (accNumber) {
      accountsQuery += ` WHERE a.acc_number = $1`;
      accountsParams.push(accNumber);
    }

    const accountsResult = await pool.query(accountsQuery, accountsParams);
    const accountsStats = accountsResult.rows[0];

    // Step 2: Get today's history stats (only today's data)
    let historyQuery = `
      SELECT 
        COALESCE(SUM(h.current_total_trade), 0) as total_open_trades,
        COALESCE(SUM(h.current_profit), 0) as total_open_profit,
        COALESCE(SUM(h.history_total_trade), 0) as total_closed_trades,
        COALESCE(SUM(h.history_profit), 0) as total_closed_profit,
        COALESCE(SUM(h.history_win), 0) as total_wins,
        COALESCE(SUM(h.history_loss), 0) as total_losses
      FROM history h
      JOIN accounts a ON h.account_id = a.id
      WHERE h.date = CURRENT_DATE
    `;

    const historyParams: (string | number)[] = [];

    if (accNumber) {
      historyQuery += ` AND a.acc_number = $1`;
      historyParams.push(accNumber);
    }

    const historyResult = await pool.query(historyQuery, historyParams);
    const historyStats = historyResult.rows[0] || {
      total_open_trades: 0,
      total_open_profit: 0,
      total_closed_trades: 0,
      total_closed_profit: 0,
      total_wins: 0,
      total_losses: 0,
    };

    // Step 3: Get previous business day stats
    // If today is Monday (1), get Friday's data (3 days ago)
    // Otherwise get yesterday's data (1 day ago)
    let previousDayQuery = `
      SELECT 
        COALESCE(SUM(h.current_total_trade), 0) as before_total_open_trades,
        COALESCE(SUM(h.current_profit), 0) as before_total_open_profit,
        COALESCE(SUM(h.history_total_trade), 0) as before_total_closed_trades,
        COALESCE(SUM(h.history_profit), 0) as before_total_closed_profit,
        COALESCE(SUM(h.history_win), 0) as before_total_wins,
        COALESCE(SUM(h.history_loss), 0) as before_total_losses
      FROM history h
      JOIN accounts a ON h.account_id = a.id
      WHERE h.date = CASE 
        WHEN EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN CURRENT_DATE - INTERVAL '3 days'  -- Monday: get Friday
        WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN CURRENT_DATE - INTERVAL '2 days'  -- Sunday: get Friday  
        ELSE CURRENT_DATE - INTERVAL '1 day'  -- Other days: get yesterday
      END
    `;

    const previousDayParams: (string | number)[] = [];

    if (accNumber) {
      previousDayQuery += ` AND a.acc_number = $1`;
      previousDayParams.push(accNumber);
    }

    const previousDayResult = await pool.query(
      previousDayQuery,
      previousDayParams
    );
    const previousDayStats = previousDayResult.rows[0] || {
      before_total_open_trades: 0,
      before_total_open_profit: 0,
      before_total_closed_trades: 0,
      before_total_closed_profit: 0,
      before_total_wins: 0,
      before_total_losses: 0,
    };

    // Step 4: Calculate win rate
    const totalClosedTrades = parseInt(historyStats.total_closed_trades) || 0;
    const totalWins = parseInt(historyStats.total_wins) || 0;
    const winRate =
      totalClosedTrades > 0 ? (totalWins / totalClosedTrades) * 100 : 0;

    // Step 5: Combine results
    const combinedStats = {
      // From accounts table
      total_accounts: parseInt(accountsStats.total_accounts) || 0,
      total_balance: parseFloat(accountsStats.total_balance) || 0,
      total_equity: parseFloat(accountsStats.total_equity) || 0,

      // From today's history
      total_open_trades: parseInt(historyStats.total_open_trades) || 0,
      total_open_profit: parseFloat(historyStats.total_open_profit) || 0,
      total_closed_trades: totalClosedTrades,
      total_closed_profit: parseFloat(historyStats.total_closed_profit) || 0,
      total_wins: totalWins,
      total_losses: parseInt(historyStats.total_losses) || 0,
      win_rate: Math.round(winRate * 100) / 100, // Round to 2 decimal places

      // From previous business day
      before_total_open_trades:
        parseInt(previousDayStats.before_total_open_trades) || 0,
      before_total_open_profit:
        parseFloat(previousDayStats.before_total_open_profit) || 0,
      before_total_closed_trades:
        parseInt(previousDayStats.before_total_closed_trades) || 0,
      before_total_closed_profit:
        parseFloat(previousDayStats.before_total_closed_profit) || 0,
      before_total_wins: parseInt(previousDayStats.before_total_wins) || 0,
      before_total_losses: parseInt(previousDayStats.before_total_losses) || 0,
    };

    return NextResponse.json(combinedStats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
