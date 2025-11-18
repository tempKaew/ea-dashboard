import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Default to today if no dates provided
    const today = new Date().toISOString().split("T")[0];
    const filterStartDate = startDate || today;
    const filterEndDate = endDate || today;

    // Fetch accounts with run_at
    const { data: accounts, error: accountsError } = await supabaseServer
      .from("accounts")
      .select(
        `
        id,
        acc_number,
        name,
        email,
        balance,
        equity,
        run_at_id,
        updated_at,
        run_at:run_at_id (
          title
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (accountsError) {
      throw accountsError;
    }

    // Fetch history count for each account
    const accountIds = accounts?.map((a) => a.id) || [];
    const { data: historyCounts, error: historyCountError } =
      await supabaseServer
        .from("history")
        .select("account_id")
        .in("account_id", accountIds);

    if (historyCountError) {
      throw historyCountError;
    }

    // Count history per account
    const historyCountMap: { [key: number]: number } = {};
    historyCounts?.forEach((h) => {
      historyCountMap[h.account_id] = (historyCountMap[h.account_id] || 0) + 1;
    });

    // Fetch latest history for each account within date range
    const { data: histories, error: historiesError } = await supabaseServer
      .from("history")
      .select("*")
      .in("account_id", accountIds)
      .gte("date", filterStartDate)
      .lte("date", filterEndDate)
      .order("date", { ascending: false })
      .order("updated_at", { ascending: false });

    if (historiesError) {
      throw historiesError;
    }

    // Group histories by account_id and get the latest one
    const latestHistoryMap: { [key: number]: typeof histories[0] } = {};
    histories?.forEach((h) => {
      if (
        !latestHistoryMap[h.account_id] ||
        new Date(h.updated_at) >
          new Date(latestHistoryMap[h.account_id].updated_at)
      ) {
        latestHistoryMap[h.account_id] = h;
      }
    });

    // Transform the result to match the expected format
    const accountsWithHistory = accounts?.map((account) => {
      const history = latestHistoryMap[account.id];
      const runAt = Array.isArray(account.run_at)
        ? account.run_at[0]
        : account.run_at;

      return {
        // Account data
        id: account.id,
        acc_number: account.acc_number,
        name: account.name,
        email: account.email,
        balance: account.balance,
        equity: account.equity,
        run_at_id: account.run_at_id,
        run_at_title: runAt?.title || null,
        updated_at: account.updated_at,
        history_count: historyCountMap[account.id] || 0,

        // History data (if exists)
        history: history
          ? {
              id: history.id,
              account_id: history.account_id,
              acc_number: account.acc_number,
              email: account.email,
              date: history.date,
              balance: account.balance,
              equity: account.equity,
              current_total_trade: history.current_total_trade,
              current_profit: history.current_profit,
              current_lot: history.current_lot,
              current_order_buy_count: history.current_order_buy_count,
              current_order_sell_count: history.current_order_sell_count,
              history_total_trade: history.history_total_trade,
              history_profit: history.history_profit,
              history_lot: history.history_lot,
              history_order_buy_count: history.history_order_buy_count,
              history_order_sell_count: history.history_order_sell_count,
              history_win: history.history_win,
              history_loss: history.history_loss,
              updated_at: history.updated_at,
            }
          : null,
      };
    });

    return NextResponse.json(accountsWithHistory || []);
  } catch (error) {
    console.error("Error fetching accounts with history:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts with history" },
      { status: 500 }
    );
  }
}
