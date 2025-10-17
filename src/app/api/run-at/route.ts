import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, title, created_at, updated_at
      FROM run_at
      ORDER BY title ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching run_at:", error);
    return NextResponse.json(
      { error: "Failed to fetch run_at" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO run_at (title) VALUES ($1) RETURNING *`,
      [title]
    );

    return NextResponse.json({
      success: true,
      run_at: result.rows[0],
      message: "Run at created successfully",
    });
  } catch (error) {
    console.error("Error creating run_at:", error);
    return NextResponse.json(
      { error: "Failed to create run_at" },
      { status: 500 }
    );
  }
}
