import { supabaseServer } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    let accountsQuery = supabaseServer
      .from("accounts")
      .select(
        `
        id,
        acc_number,
        name,
        email,
        balance,
        equity,
        run_at_id,
        updated_at,
        run_at:run_at_id (
          title
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (accNumber) {
      accountsQuery = accountsQuery.eq("acc_number", accNumber);
    }

    const { data: accounts, error: accountsError } = await accountsQuery;

    if (accountsError) {
      throw accountsError;
    }

    // Get history count for each account
    const accountIds = accounts?.map((a) => a.id) || [];
    const { data: histories, error: historiesError } = await supabaseServer
      .from("history")
      .select("account_id")
      .in("account_id", accountIds);

    if (historiesError) {
      throw historiesError;
    }

    // Count history per account
    const historyCountMap: { [key: number]: number } = {};
    histories?.forEach((h) => {
      historyCountMap[h.account_id] = (historyCountMap[h.account_id] || 0) + 1;
    });

    // Transform to match expected format
    const result = accounts?.map((account) => {
      const runAt = Array.isArray(account.run_at)
        ? account.run_at[0]
        : account.run_at;

      return {
        id: account.id,
        acc_number: account.acc_number,
        name: account.name,
        email: account.email,
        balance: account.balance,
        equity: account.equity,
        run_at_id: account.run_at_id,
        run_at_title: runAt?.title || null,
        updated_at: account.updated_at,
        history_count: historyCountMap[account.id] || 0,
      };
    });

    return NextResponse.json(result || []);
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

    const { data, error } = await supabaseServer
      .from("accounts")
      .update({
        name,
        email,
        run_at_id,
        updated_at: new Date().toISOString(),
      })
      .eq("acc_number", accNumber)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account: data,
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
  try {
    const { searchParams } = new URL(request.url);
    const accNumber = searchParams.get("acc_number");

    if (!accNumber) {
      return NextResponse.json(
        { error: "Account number is required" },
        { status: 400 }
      );
    }

    // First get the account ID
    const { data: account, error: accountError } = await supabaseServer
      .from("accounts")
      .select("id")
      .eq("acc_number", accNumber)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountId = account.id;

    // Delete all history records for this account (CASCADE should handle this, but doing explicitly)
    const { error: historyError } = await supabaseServer
      .from("history")
      .delete()
      .eq("account_id", accountId);

    if (historyError) {
      throw historyError;
    }

    // Delete the account
    const { error: deleteError } = await supabaseServer
      .from("accounts")
      .delete()
      .eq("acc_number", accNumber);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Account and all related history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
