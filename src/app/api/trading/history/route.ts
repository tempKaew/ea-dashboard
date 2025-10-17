import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const limit = searchParams.get("limit") || "30";
    const offset = searchParams.get("offset") || "0";

    let query = `
      SELECT 
        h.*,
        a.acc_number,
        a.email,
        a.balance,
        a.equity
      FROM history h
      JOIN accounts a ON h.account_id = a.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (accNumber) {
      query += ` AND a.acc_number = $${paramIndex}`;
      params.push(accNumber);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND h.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND h.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY h.date DESC, h.updated_at DESC`;

    if (limit !== "-1") {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
      paramIndex++;

      if (offset !== "0") {
        query += ` OFFSET $${paramIndex}`;
        params.push(parseInt(offset));
      }
    }

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
