import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runAtId = searchParams.get("run_at_id");

    if (!runAtId) {
      return NextResponse.json(
        { error: "run_at_id is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM accounts WHERE run_at_id = $1`,
      [runAtId]
    );

    return NextResponse.json({
      count: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error("Error fetching accounts count:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts count" },
      { status: 500 }
    );
  }
}
