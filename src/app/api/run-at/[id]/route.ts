import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { title } = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (!title || !id) {
      return NextResponse.json(
        { error: "Title and ID are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE run_at SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [title, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Run at not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      run_at: result.rows[0],
      message: "Run at updated successfully",
    });
  } catch (error) {
    console.error("Error updating run_at:", error);
    return NextResponse.json(
      { error: "Failed to update run_at" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await client.query("BEGIN");

    // First, set run_at_id to NULL for all accounts using this run_at
    await client.query(
      `UPDATE accounts SET run_at_id = NULL WHERE run_at_id = $1`,
      [id]
    );

    // Then delete the run_at
    const result = await client.query(
      `DELETE FROM run_at WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Run at not found" }, { status: 404 });
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Run at deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting run_at:", error);
    return NextResponse.json(
      { error: "Failed to delete run_at" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
