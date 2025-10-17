import pool from "@/lib/db";
import { publishTradeEvent } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

interface TradeData {
  acc_number: number;
  date: string;
  balance: number;
  equity: number;
  current: {
    total_trade: number;
    profit: number;
    lot: number;
    order_buy_count: number;
    order_sell_count: number;
  };
  history: {
    total_trade: number;
    profit: number;
    lot: number;
    order_buy_count: number;
    order_sell_count: number;
    win: number;
    loss: number;
  };
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const data: TradeData = await request.json();

    console.log("data", data);

    // Validate required fields
    if (!data.acc_number || !data.date) {
      return NextResponse.json(
        { error: "Missing required fields: acc_number, date" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 1. Upsert Account (Insert or Update)
    const accountResult = await client.query(
      `INSERT INTO accounts (acc_number, balance, equity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (acc_number) 
       DO UPDATE SET 
         balance = EXCLUDED.balance,
         equity = EXCLUDED.equity,
         updated_at = NOW()
       RETURNING id`,
      [data.acc_number, data.balance, data.equity]
    );

    const accountId = accountResult.rows[0].id;

    // 2. Upsert History (Insert or Update for today)
    await client.query(
      `INSERT INTO history (
        account_id, 
        date,
        current_total_trade,
        current_profit,
        current_lot,
        current_order_buy_count,
        current_order_sell_count,
        history_total_trade,
        history_profit,
        history_lot,
        history_order_buy_count,
        history_order_sell_count,
        history_win,
        history_loss,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (account_id, date)
      DO UPDATE SET
        current_total_trade = EXCLUDED.current_total_trade,
        current_profit = EXCLUDED.current_profit,
        current_lot = EXCLUDED.current_lot,
        current_order_buy_count = EXCLUDED.current_order_buy_count,
        current_order_sell_count = EXCLUDED.current_order_sell_count,
        history_total_trade = EXCLUDED.history_total_trade,
        history_profit = EXCLUDED.history_profit,
        history_lot = EXCLUDED.history_lot,
        history_order_buy_count = EXCLUDED.history_order_buy_count,
        history_order_sell_count = EXCLUDED.history_order_sell_count,
        history_win = EXCLUDED.history_win,
        history_loss = EXCLUDED.history_loss,
        updated_at = NOW()
      RETURNING *`,
      [
        accountId,
        data.date,
        data.current.total_trade,
        data.current.profit,
        data.current.lot,
        data.current.order_buy_count,
        data.current.order_sell_count,
        data.history.total_trade,
        data.history.profit,
        data.history.lot,
        data.history.order_buy_count,
        data.history.order_sell_count,
        data.history.win,
        data.history.loss,
      ]
    );

    await client.query("COMMIT");

    // 3. Publish event to Redis for real-time update
    const eventData = {
      account_id: accountId,
      acc_number: data.acc_number,
      balance: data.balance,
      equity: data.equity,
      current: data.current,
      history: data.history,
      date: data.date,
      timestamp: new Date().toISOString(),
    };

    await publishTradeEvent(eventData);

    return NextResponse.json({
      success: true,
      account_id: accountId,
      message: "Trade data saved successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving trade data:", error);

    return NextResponse.json(
      {
        error: "Failed to save trade data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
