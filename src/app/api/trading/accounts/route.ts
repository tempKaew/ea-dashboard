import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    let query = `
      SELECT 
        a.id,
        a.acc_number,
        a.name,
        a.email,
        a.balance,
        a.equity,
        a.run_at_id,
        r.title as run_at_title,
        a.updated_at,
        COUNT(h.id) as history_count
      FROM accounts a
      LEFT JOIN run_at r ON a.run_at_id = r.id
      LEFT JOIN history h ON a.id = h.account_id
    `;

    const params: (string | number)[] = [];

    if (accNumber) {
      query += ` WHERE a.acc_number = $1`;
      params.push(accNumber);
    }

    query += ` GROUP BY a.id, a.acc_number, a.name, a.email, a.balance, a.equity, a.run_at_id, r.title, a.updated_at ORDER BY a.updated_at DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    if (!accNumber) {
      return NextResponse.json(
        { error: "Account number is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, run_at_id } = body;

    const result = await pool.query(
      `UPDATE accounts 
       SET name = $1, email = $2, run_at_id = $3, updated_at = NOW()
       WHERE acc_number = $4
       RETURNING *`,
      [name, email, run_at_id, accNumber]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account: result.rows[0],
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    if (!accNumber) {
      return NextResponse.json(
        { error: "Account number is required" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // First get the account ID
    const accountResult = await client.query(
      `SELECT id FROM accounts WHERE acc_number = $1`,
      [accNumber]
    );

    if (accountResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountId = accountResult.rows[0].id;

    // Delete all history records for this account
    await client.query(`DELETE FROM history WHERE account_id = $1`, [
      accountId,
    ]);

    // Delete the account
    await client.query(`DELETE FROM accounts WHERE acc_number = $1`, [
      accNumber,
    ]);

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Account and all related history deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
