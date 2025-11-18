import { supabaseServer } from "@/lib/supabase";
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

    const { data, error } = await supabaseServer
      .from("run_at")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Run at not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      run_at: data,
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
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // First, set run_at_id to NULL for all accounts using this run_at
    const { error: updateError } = await supabaseServer
      .from("accounts")
      .update({ run_at_id: null })
      .eq("run_at_id", id);

    if (updateError) {
      throw updateError;
    }

    // Then delete the run_at
    const { data, error: deleteError } = await supabaseServer
      .from("run_at")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (deleteError) {
      throw deleteError;
    }

    if (!data) {
      return NextResponse.json({ error: "Run at not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Run at deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting run_at:", error);
    return NextResponse.json(
      { error: "Failed to delete run_at" },
      { status: 500 }
    );
  }
}
