import pool from "@/lib/db";
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

    const query = `
      SELECT 
        a.id,
        a.acc_number,
        a.name,
        a.email,
        a.balance,
        a.equity,
        a.run_at_id,
        r.title as run_at_title,
        a.updated_at as account_updated_at,
        
        -- History data (latest record within date range)
        h.id as history_id,
        h.date as history_date,
        h.current_total_trade,
        h.current_profit,
        h.current_lot,
        h.current_order_buy_count,
        h.current_order_sell_count,
        h.history_total_trade,
        h.history_profit,
        h.history_lot,
        h.history_order_buy_count,
        h.history_order_sell_count,
        h.history_win,
        h.history_loss,
        h.updated_at as history_updated_at,
        
        -- History count
        (SELECT COUNT(*) FROM history h2 WHERE h2.account_id = a.id) as history_count
        
      FROM accounts a
      LEFT JOIN run_at r ON a.run_at_id = r.id
      LEFT JOIN LATERAL (
        SELECT * FROM history h3 
        WHERE h3.account_id = a.id 
        AND h3.date BETWEEN $1 AND $2
        ORDER BY h3.date DESC, h3.updated_at DESC
        LIMIT 1
      ) h ON true
      ORDER BY a.updated_at DESC
    `;

    const result = await pool.query(query, [filterStartDate, filterEndDate]);

    // Transform the result to match the expected format
    const accountsWithHistory = result.rows.map((row) => ({
      // Account data
      id: row.id,
      acc_number: row.acc_number,
      name: row.name,
      email: row.email,
      balance: row.balance,
      equity: row.equity,
      run_at_id: row.run_at_id,
      run_at_title: row.run_at_title,
      updated_at: row.account_updated_at,
      history_count: parseInt(row.history_count),

      // History data (if exists)
      history: row.history_id
        ? {
            id: row.history_id,
            account_id: row.id,
            acc_number: row.acc_number,
            email: row.email,
            date: row.history_date,
            balance: row.balance,
            equity: row.equity,
            current_total_trade: row.current_total_trade,
            current_profit: row.current_profit,
            current_lot: row.current_lot,
            current_order_buy_count: row.current_order_buy_count,
            current_order_sell_count: row.current_order_sell_count,
            history_total_trade: row.history_total_trade,
            history_profit: row.history_profit,
            history_lot: row.history_lot,
            history_order_buy_count: row.history_order_buy_count,
            history_order_sell_count: row.history_order_sell_count,
            history_win: row.history_win,
            history_loss: row.history_loss,
            updated_at: row.history_updated_at,
          }
        : null,
    }));

    return NextResponse.json(accountsWithHistory);
  } catch (error) {
    console.error("Error fetching accounts with history:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts with history" },
      { status: 500 }
    );
  }
}
