import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("run_at")
      .select("id, title, created_at, updated_at")
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
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

    const { data, error } = await supabaseServer
      .from("run_at")
      .insert({ title })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      run_at: data,
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
