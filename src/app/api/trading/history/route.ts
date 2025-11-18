import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const limit = searchParams.get("limit") || "30";
    const offset = searchParams.get("offset") || "0";

    let historyQuery = supabaseServer
      .from("history")
      .select(
        `
        *,
        accounts!inner (
          acc_number,
          email,
          balance,
          equity
        )
      `
      )
      .order("date", { ascending: false })
      .order("updated_at", { ascending: false });

    if (accNumber) {
      historyQuery = historyQuery.eq("accounts.acc_number", accNumber);
    }

    if (startDate) {
      historyQuery = historyQuery.gte("date", startDate);
    }

    if (endDate) {
      historyQuery = historyQuery.lte("date", endDate);
    }

    if (limit !== "-1") {
      historyQuery = historyQuery.range(
        parseInt(offset),
        parseInt(offset) + parseInt(limit) - 1
      );
    }

    const { data: histories, error } = await historyQuery;

    if (error) {
      throw error;
    }

    // Transform to match expected format
    const result = histories?.map((h) => {
      const account = Array.isArray(h.accounts) ? h.accounts[0] : h.accounts;
      return {
        ...h,
        acc_number: account?.acc_number,
        email: account?.email,
        balance: account?.balance,
        equity: account?.equity,
      };
    });

    return NextResponse.json(result || []);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
