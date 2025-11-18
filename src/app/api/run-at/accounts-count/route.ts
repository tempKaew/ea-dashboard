import { supabaseServer } from "@/lib/supabase";
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

    const { count, error } = await supabaseServer
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("run_at_id", runAtId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      count: count || 0,
    });
  } catch (error) {
    console.error("Error fetching accounts count:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts count" },
      { status: 500 }
    );
  }
}
