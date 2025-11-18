import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    // Step 1: Get accounts stats (all accounts or specific account)
    let accountsQuery = supabaseServer
      .from("accounts")
      .select("id, balance, equity, acc_number");

    if (accNumber) {
      accountsQuery = accountsQuery.eq("acc_number", accNumber);
    }

    const { data: accounts, error: accountsError } = await accountsQuery;

    if (accountsError) {
      throw accountsError;
    }

    const accountsStats = {
      total_accounts: accounts?.length || 0,
      total_balance:
        accounts?.reduce((sum, a) => sum + parseFloat(String(a.balance || 0)), 0) || 0,
      total_equity:
        accounts?.reduce((sum, a) => sum + parseFloat(String(a.equity || 0)), 0) || 0,
    };

    // Step 2: Get today's history stats (only today's data)
    const today = new Date().toISOString().split("T")[0];
    
    // First get account IDs if filtering by acc_number
    let accountIds: number[] | undefined;
    if (accNumber) {
      const { data: filteredAccounts } = await supabaseServer
        .from("accounts")
        .select("id")
        .eq("acc_number", accNumber);
      accountIds = filteredAccounts?.map((a) => a.id);
      if (!accountIds || accountIds.length === 0) {
        accountIds = []; // No accounts found, return empty stats
      }
    }

    let historyQuery = supabaseServer
      .from("history")
      .select(
        `
        current_total_trade,
        current_profit,
        history_total_trade,
        history_profit,
        history_win,
        history_loss,
        account_id,
        accounts!inner (
          acc_number
        )
      `
      )
      .eq("date", today);

    if (accountIds !== undefined) {
      historyQuery = historyQuery.in("account_id", accountIds);
    }

    const { data: histories, error: historiesError } = await historyQuery;

    if (historiesError) {
      throw historiesError;
    }

    const historyStats = {
      total_open_trades:
        histories?.reduce(
          (sum, h) => sum + parseInt(String(h.current_total_trade || 0)),
          0
        ) || 0,
      total_open_profit:
        histories?.reduce(
          (sum, h) => sum + parseFloat(String(h.current_profit || 0)),
          0
        ) || 0,
      total_closed_trades:
        histories?.reduce(
          (sum, h) => sum + parseInt(String(h.history_total_trade || 0)),
          0
        ) || 0,
      total_closed_profit:
        histories?.reduce(
          (sum, h) => sum + parseFloat(String(h.history_profit || 0)),
          0
        ) || 0,
      total_wins:
        histories?.reduce(
          (sum, h) => sum + parseInt(String(h.history_win || 0)),
          0
        ) || 0,
      total_losses:
        histories?.reduce(
          (sum, h) => sum + parseInt(String(h.history_loss || 0)),
          0
        ) || 0,
    };

    // Step 3: Get previous business day stats
    // If today is Monday (1), get Friday's data (3 days ago)
    // Otherwise get yesterday's data (1 day ago)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    let previousDate: Date;

    if (dayOfWeek === 1) {
      // Monday: get Friday (3 days ago)
      previousDate = new Date(now);
      previousDate.setDate(previousDate.getDate() - 3);
    } else if (dayOfWeek === 0) {
      // Sunday: get Friday (2 days ago)
      previousDate = new Date(now);
      previousDate.setDate(previousDate.getDate() - 2);
    } else {
      // Other days: get yesterday
      previousDate = new Date(now);
      previousDate.setDate(previousDate.getDate() - 1);
    }

    const previousDateStr = previousDate.toISOString().split("T")[0];

    let previousDayQuery = supabaseServer
      .from("history")
      .select(
        `
        current_total_trade,
        current_profit,
        history_total_trade,
        history_profit,
        history_win,
        history_loss,
        account_id,
        accounts!inner (
          acc_number
        )
      `
      )
      .eq("date", previousDateStr);

    if (accountIds !== undefined) {
      previousDayQuery = previousDayQuery.in("account_id", accountIds);
    }

    const { data: previousHistories, error: previousHistoriesError } =
      await previousDayQuery;

    if (previousHistoriesError) {
      throw previousHistoriesError;
    }

    const previousDayStats = {
      before_total_open_trades:
        previousHistories?.reduce(
          (sum, h) => sum + parseInt(String(h.current_total_trade || 0)),
          0
        ) || 0,
      before_total_open_profit:
        previousHistories?.reduce(
          (sum, h) => sum + parseFloat(String(h.current_profit || 0)),
          0
        ) || 0,
      before_total_closed_trades:
        previousHistories?.reduce(
          (sum, h) => sum + parseInt(String(h.history_total_trade || 0)),
          0
        ) || 0,
      before_total_closed_profit:
        previousHistories?.reduce(
          (sum, h) => sum + parseFloat(String(h.history_profit || 0)),
          0
        ) || 0,
      before_total_wins:
        previousHistories?.reduce(
          (sum, h) => sum + parseInt(String(h.history_win || 0)),
          0
        ) || 0,
      before_total_losses:
        previousHistories?.reduce(
          (sum, h) => sum + parseInt(String(h.history_loss || 0)),
          0
        ) || 0,
    };

    // Step 4: Calculate win rate
    const totalClosedTrades = historyStats.total_closed_trades;
    const totalWins = historyStats.total_wins;
    const winRate =
      totalClosedTrades > 0 ? (totalWins / totalClosedTrades) * 100 : 0;

    // Step 5: Combine results
    const combinedStats = {
      // From accounts table
      total_accounts: accountsStats.total_accounts,
      total_balance: accountsStats.total_balance,
      total_equity: accountsStats.total_equity,

      // From today's history
      total_open_trades: historyStats.total_open_trades,
      total_open_profit: historyStats.total_open_profit,
      total_closed_trades: historyStats.total_closed_trades,
      total_closed_profit: historyStats.total_closed_profit,
      total_wins: historyStats.total_wins,
      total_losses: historyStats.total_losses,
      win_rate: Math.round(winRate * 100) / 100, // Round to 2 decimal places

      // From previous business day
      before_total_open_trades: previousDayStats.before_total_open_trades,
      before_total_open_profit: previousDayStats.before_total_open_profit,
      before_total_closed_trades: previousDayStats.before_total_closed_trades,
      before_total_closed_profit: previousDayStats.before_total_closed_profit,
      before_total_wins: previousDayStats.before_total_wins,
      before_total_losses: previousDayStats.before_total_losses,
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
