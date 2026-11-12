"use client";

import StatCard from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/Table";
import { useRealtimeTrading } from "@/hooks/useRealtimeTrading";
import { Account, History, RunAt, TradeStats } from "@/types/trading";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type SortField = "account" | "name" | "balance" | "equity" | "last_update";
type SortDirection = "asc" | "desc";
type DateFilter = "today" | "yesterday" | "last7days" | "last30days";

interface AccountWithHistory extends Account {
  history: History | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [accountsHistory, setAccountsHistory] = useState<{
    [key: string]: History;
  }>({});
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [runAtList, setRunAtList] = useState<RunAt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedRunAt, setSelectedRunAt] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const { latestUpdate, isConnected } = useRealtimeTrading();

  const titleSite = process.env.NEXT_PUBLIC_APP_NAME ?? "EA Dashboard";
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to safely convert database strings to numbers
  const toNumber = (value: string | number): number => {
    return typeof value === "string" ? parseFloat(value) || 0 : value;
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(toNumber(value));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getDateRange = (filter: DateFilter) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    switch (filter) {
      case "today":
        return {
          start: today.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
          label: `Today ${today.toLocaleDateString("th-TH")}`,
        };
      case "yesterday":
        return {
          start: yesterday.toISOString().split("T")[0],
          end: yesterday.toISOString().split("T")[0],
          label: `Yesterday ${yesterday.toLocaleDateString("th-TH")}`,
        };
      case "last7days":
        const week = new Date(today);
        week.setDate(week.getDate() - 6);
        return {
          start: week.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
          label: `${week.toLocaleDateString(
            "th-TH",
          )} - ${today.toLocaleDateString("th-TH")}`,
        };
      case "last30days":
        const month = new Date(today);
        month.setDate(month.getDate() - 29);
        return {
          start: month.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
          label: `${month.toLocaleDateString(
            "th-TH",
          )} - ${today.toLocaleDateString("th-TH")}`,
        };
    }
  };

  const isUpdateFresh = (updatedAt: string) => {
    const updateTime = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60);
    return diffMinutes <= 5;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortAccounts = useCallback(
    (accountsToSort: Account[]) => {
      return [...accountsToSort].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case "account":
            aValue = a.acc_number;
            bValue = b.acc_number;
            break;
          case "name":
            aValue = (a.name || "").toLowerCase();
            bValue = (b.name || "").toLowerCase();
            break;
          case "balance":
            aValue = toNumber(a.balance);
            bValue = toNumber(b.balance);
            break;
          case "equity":
            aValue = toNumber(a.equity);
            bValue = toNumber(b.equity);
            break;
          case "last_update":
            const historyA = accountsHistory[a.acc_number];
            const historyB = accountsHistory[b.acc_number];
            aValue = historyA ? new Date(historyA.updated_at).getTime() : 0;
            bValue = historyB ? new Date(historyB.updated_at).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortField, sortDirection, accountsHistory],
  );

  const filterAccounts = useCallback(
    (accountsToFilter: Account[]) => {
      let filtered = accountsToFilter;

      if (selectedRunAt !== null) {
        filtered = filtered.filter(
          (account) => account.run_at_id === selectedRunAt,
        );
      }

      // Filter by inactive status if toggle is on
      if (showInactiveOnly) {
        filtered = filtered.filter((account) => {
          const history = accountsHistory[account.acc_number];
          if (!history) return true; // No history = inactive
          return !isUpdateFresh(history.updated_at);
        });
      }

      return sortAccounts(filtered);
    },
    [selectedRunAt, showInactiveOnly, sortAccounts, accountsHistory],
  );

  useEffect(() => {
    setFilteredAccounts(filterAccounts(accounts));
  }, [accounts, filterAccounts]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMenu && !target.closest(".relative")) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Load run_at list (only once)
  const loadRunAtList = async () => {
    try {
      const runAtRes = await fetch("/api/run-at");
      const runAtData = await runAtRes.json();
      setRunAtList(runAtData);
      console.log("✅ Loaded run_at list");
    } catch (error) {
      console.error("Error loading run_at list:", error);
    }
  };

  // Load accounts and history data
  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch accounts with history in one request
      const dateRange = getDateRange(dateFilter);
      const accountsRes = await fetch(
        `/api/trading/accounts-with-history?start_date=${dateRange.start}&end_date=${dateRange.end}`,
      );
      const accountsWithHistoryData = await accountsRes.json();

      // Separate accounts and history
      const accountsData = accountsWithHistoryData.map(
        (item: AccountWithHistory) => ({
          id: item.id,
          acc_number: item.acc_number,
          name: item.name,
          email: item.email,
          balance: item.balance,
          equity: item.equity,
          run_at_id: item.run_at_id,
          run_at_title: item.run_at_title,
          updated_at: item.updated_at,
          history_count: item.history_count,
        }),
      );

      const historyMap: { [key: string]: History } = {};
      accountsWithHistoryData.forEach((item: AccountWithHistory) => {
        if (item.history) {
          historyMap[item.acc_number] = item.history;
        }
      });

      setAccounts(accountsData);
      setAccountsHistory(historyMap);

      // Fetch stats
      const statsRes = await fetch("/api/trading/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      setCurrentTime(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );

      console.log(
        `✅ Loaded ${accountsData.length} accounts with history in 2 requests`,
      );
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRunAtList(); // Load run_at list once
    loadData(); // Load accounts and history
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Reload data when date filter changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]); // Only depend on dateFilter

  // Refresh when real-time update received
  useEffect(() => {
    if (latestUpdate && !isInitialLoad) {
      const { table, eventType } = latestUpdate;
      console.log(
        `🔄 Real-time update received: ${eventType} on ${table} table, refreshing data...`,
        latestUpdate,
      );

      // Reload data immediately when updated is updated/inserted
      if (
        table === "updated" &&
        (eventType === "INSERT" || eventType === "UPDATE")
      ) {
        console.log("📊 Updated changed, reloading dashboard data...");
        loadData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestUpdate]);

  const inactiveCount = accounts.filter((account) => {
    const history = accountsHistory[account.acc_number];
    if (!history) return true;
    return !isUpdateFresh(history.updated_at);
  }).length;

  const equityPositive =
    stats &&
    toNumber(stats.total_equity) >= toNumber(stats.total_balance);
  const openProfitPositive =
    stats && toNumber(stats.total_open_profit) >= 0;
  const closedProfitPositive =
    stats && toNumber(stats.total_closed_profit) >= 0;

  return (
    <div className="relative min-h-screen bg-canvas text-ink antialiased">
      {/* Ambient pastel backdrop */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-28 left-1/4 h-[380px] w-[520px] rounded-full bg-pink-200/40 blur-[110px]" />
        <div className="absolute top-1/4 -right-20 h-[420px] w-[480px] rounded-full bg-emerald-100/50 blur-[120px]" />
        <div className="absolute bottom-10 left-10 h-[360px] w-[550px] rounded-full bg-sky-200/40 blur-[120px]" />
        <div className="absolute right-1/4 bottom-0 h-[320px] w-[420px] rounded-full bg-amber-100/50 blur-[100px]" />
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 flex h-dvh items-center justify-center bg-[rgba(250,247,242,0.7)] backdrop-blur-[12px]">
          <div className="wave-container">
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-dashboard flex-col px-3.5 py-4 sm:px-6 sm:py-5 lg:px-8">
        {/* Header */}
        <header className="pastel-card relative z-40 mb-5 flex w-full flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative z-50">
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Toggle Navigation"
                className="rounded-2xl border border-stroke p-2 text-ink-muted transition-all hover:bg-slate-100/80 hover:text-ink active:scale-95"
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute left-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-2xl border border-stroke bg-white shadow-pastel-md">
                  <div className="py-1.5">
                    <button
                      onClick={() => {
                        router.push("/run-at");
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-pastel-purple"
                    >
                      Manage Run At
                    </button>
                    <div className="my-1 border-t border-stroke" />
                    <button
                      onClick={() => {
                        window.location.reload();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-pastel-blue"
                    >
                      Refresh Data
                    </button>
                    <div className="my-1 border-t border-stroke" />
                    <div className="px-4 py-2.5 text-xs text-ink-muted">
                      <div>Total: {accounts.length} accounts</div>
                      <div className="mt-0.5 font-semibold text-rose-600">
                        Inactive: {inactiveCount} accounts
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="group flex cursor-default items-center gap-3">
              <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-tr from-pink-300 via-purple-300 to-teal-200 p-[1.5px] shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                  <svg
                    className="h-4 w-4 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[17px] font-bold tracking-tight text-ink">
                  {titleSite}
                </span>
                <span className="ml-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-purple-600 uppercase">
                  QUANT
                </span>
              </div>
            </div>

            <div className="hidden items-center gap-3 border-l border-stroke pl-4 text-xs md:flex">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium shadow-sm ${
                  isConnected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isConnected && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isConnected ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </span>
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  {isConnected ? "Online Live" : "Disconnected"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-stroke bg-slate-100/70 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
                <span>Last sync:</span>
                <span className="font-tabular font-semibold text-ink">
                  {currentTime ?? "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => loadData()}
              aria-label="Refresh"
              className="rounded-2xl border border-teal-200 bg-teal-50 p-2 text-teal-700 shadow-sm transition-all hover:bg-teal-100 active:scale-95"
              type="button"
              title="Sync live updates"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <section
          aria-label="Key Performance Indicators"
          className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatCard
            title="Total Accounts"
            value={stats?.total_accounts ?? 0}
            icon="users"
            tone="sky"
            footer={
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="font-semibold text-blue-700">
                  {accounts.length - inactiveCount} active
                </span>
                <span>· {inactiveCount} inactive</span>
              </div>
            }
          />
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats?.total_balance ?? 0)}
            icon="wallet"
            tone="mint"
            footer={
              <div className="flex items-center justify-between">
                <span>Allocated</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">
                  100%
                </span>
              </div>
            }
          />
          <StatCard
            title="Total Equity"
            value={formatCurrency(stats?.total_equity ?? 0)}
            icon="chart"
            tone={equityPositive ? "matcha" : "butter"}
            footer={
              <div className="flex items-center justify-between">
                <span>vs Balance</span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-bold ${
                    equityPositive
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "border-amber-200 bg-amber-100 text-amber-800"
                  }`}
                >
                  {equityPositive ? "Healthy" : "Drawdown"}
                </span>
              </div>
            }
          />
          <StatCard
            title="Current P/L"
            value={formatCurrency(stats?.total_open_profit ?? 0)}
            previousValue={formatCurrency(stats?.before_total_open_profit ?? 0)}
            icon="trending"
            tone={openProfitPositive ? "matcha" : "rose"}
            footer={
              <div
                className={`flex items-center gap-1.5 ${
                  openProfitPositive ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    openProfitPositive ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                <span className="font-medium">
                  {openProfitPositive
                    ? "Unrealized float gain"
                    : "Unrealized float drawdown"}
                </span>
              </div>
            }
          />
          <StatCard
            title="Today P/L"
            value={formatCurrency(stats?.total_closed_profit ?? 0)}
            previousValue={formatCurrency(
              stats?.before_total_closed_profit ?? 0,
            )}
            icon="target"
            tone={closedProfitPositive ? "matcha" : "rose"}
            footer={
              <div className="flex items-center justify-between text-emerald-700">
                <span>Realized today</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-100/80 px-2 py-0.5 font-bold text-emerald-800">
                  Closed P/L
                </span>
              </div>
            }
          />
        </section>

        {/* Accounts table */}
        <main className="pastel-card mb-5 w-full overflow-hidden rounded-3xl">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-blue-50/40 p-4 sm:p-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <div className="h-6 w-2.5 rounded-full bg-gradient-to-b from-pink-400 via-purple-400 to-teal-400" />
              <h2 className="flex flex-wrap items-center gap-2.5 text-base font-bold tracking-tight text-ink sm:text-lg">
                <span>
                  Trading Accounts {getDateRange(dateFilter).label ?? ""}
                </span>
                <span
                  className={`rounded-full border bg-white px-3 py-0.5 font-mono text-xs font-bold shadow-sm ${
                    showInactiveOnly
                      ? "border-rose-200 text-rose-700"
                      : "border-purple-200 text-purple-700"
                  }`}
                >
                  {showInactiveOnly
                    ? `Inactive: ${filteredAccounts.length}`
                    : `${filteredAccounts.length} acc`}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="relative">
                <select
                  value={selectedRunAt || ""}
                  onChange={(e) =>
                    setSelectedRunAt(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  aria-label="Run filter"
                  className="cursor-pointer appearance-none rounded-2xl border border-blue-200 bg-white px-3.5 py-2 pr-8 text-xs font-semibold text-blue-700 shadow-sm transition-all hover:bg-slate-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                >
                  <option value="">All Run At</option>
                  {runAtList.map((runAt) => (
                    <option key={runAt.id} value={runAt.id}>
                      {runAt.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-blue-500">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value as DateFilter)
                  }
                  aria-label="Date preset"
                  className="cursor-pointer appearance-none rounded-2xl border border-emerald-200 bg-white px-3.5 py-2 pr-8 text-xs font-semibold text-emerald-700 shadow-sm transition-all hover:bg-slate-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-emerald-500">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setShowInactiveOnly(!showInactiveOnly)}
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 ${
                  showInactiveOnly
                    ? "border-rose-300 bg-rose-100 text-rose-700"
                    : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
                type="button"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    showInactiveOnly
                      ? "animate-pulse bg-rose-500"
                      : "bg-rose-400"
                  }`}
                />
                Inactive
              </button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableHeaderCell
                sortable
                active={sortField === "account"}
                direction={sortDirection}
                onClick={() => handleSort("account")}
              >
                Account
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                active={sortField === "name"}
                direction={sortDirection}
                onClick={() => handleSort("name")}
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell>Run At</TableHeaderCell>
              <TableHeaderCell
                sortable
                active={sortField === "balance"}
                direction={sortDirection}
                onClick={() => handleSort("balance")}
                align="right"
              >
                Balance
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                active={sortField === "equity"}
                direction={sortDirection}
                onClick={() => handleSort("equity")}
                align="right"
              >
                Equity
              </TableHeaderCell>
              <TableHeaderCell align="right">Current P&L</TableHeaderCell>
              <TableHeaderCell align="center">Open</TableHeaderCell>
              <TableHeaderCell align="center" className="min-w-[140px]">
                Buy | Sell
              </TableHeaderCell>
              <TableHeaderCell align="right">Today P&L</TableHeaderCell>
              <TableHeaderCell align="center">Closed</TableHeaderCell>
              <TableHeaderCell
                sortable
                active={sortField === "last_update"}
                direction={sortDirection}
                onClick={() => handleSort("last_update")}
              >
                Last Update
              </TableHeaderCell>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const history = accountsHistory[account.acc_number];
                const isFresh = history
                  ? isUpdateFresh(history.updated_at)
                  : false;
                const buyCount = history
                  ? toNumber(history.current_order_buy_count)
                  : 0;
                const sellCount = history
                  ? toNumber(history.current_order_sell_count)
                  : 0;
                const orderTotal = buyCount + sellCount;
                const buyPct =
                  orderTotal > 0 ? (buyCount / orderTotal) * 100 : 50;
                const sellPct =
                  orderTotal > 0 ? (sellCount / orderTotal) * 100 : 50;

                return (
                  <TableRow
                    key={account.id}
                    onClick={() =>
                      router.push(`/account/${account.acc_number}`)
                    }
                  >
                    <TableCell variant="primary">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                        #{account.acc_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-ink">
                          {account.name || "Unnamed Account"}
                        </span>
                        {!isFresh && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 font-sans text-[10px] font-bold text-rose-600 shadow-sm">
                            Inactive
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-400">
                      {account.run_at_title || "-"}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="font-tabular font-bold text-ink"
                    >
                      {formatCurrency(account.balance)}
                    </TableCell>
                    <TableCell
                      align="right"
                      variant={
                        toNumber(account.equity) >= toNumber(account.balance)
                          ? "success"
                          : "warning"
                      }
                    >
                      {formatCurrency(account.equity)}
                    </TableCell>
                    <TableCell
                      align="right"
                      variant={
                        history && toNumber(history.current_profit) >= 0
                          ? "success"
                          : "danger"
                      }
                    >
                      {history ? formatCurrency(history.current_profit) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {history ? (
                        <span className="font-tabular inline-flex h-6 min-w-[30px] items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-2.5 font-bold text-blue-700 shadow-sm">
                          {history.current_total_trade}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {history ? (
                        <div className="mx-auto flex w-full max-w-[130px] flex-col items-center gap-1.5">
                          <div className="flex w-full items-center justify-between px-1 text-xs font-bold">
                            <span className="font-tabular text-emerald-600">
                              {history.current_order_buy_count}
                            </span>
                            <span className="text-[10px] text-slate-300">
                              |
                            </span>
                            <span className="font-tabular text-rose-500">
                              {history.current_order_sell_count}
                            </span>
                          </div>
                          <div className="flex h-2 w-full overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 shadow-inner">
                            <div
                              className="h-full rounded-l-full bg-emerald-400"
                              style={{ width: `${buyPct}%` }}
                            />
                            <div
                              className="h-full rounded-r-full bg-rose-400"
                              style={{ width: `${sellPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      variant={
                        history && toNumber(history.history_profit) >= 0
                          ? "success"
                          : "danger"
                      }
                    >
                      {history ? formatCurrency(history.history_profit) : "-"}
                    </TableCell>
                    <TableCell
                      align="center"
                      className="font-tabular text-slate-500"
                    >
                      {history ? history.history_total_trade : "-"}
                    </TableCell>
                    <TableCell>
                      {history ? (
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isFresh ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          <span
                            className={`font-tabular font-medium ${
                              isFresh ? "text-emerald-700" : "text-rose-600"
                            }`}
                          >
                            {isClient ? formatTime(history.updated_at) : "-"}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <span>-</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 font-mono text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Showing {filteredAccounts.length} of {accounts.length} nodes
              </span>
              <span className="text-slate-300">|</span>
              <span
                className={`flex items-center gap-1.5 font-semibold ${
                  isConnected ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected
                      ? "animate-pulse bg-emerald-400"
                      : "bg-rose-400"
                  }`}
                />
                {isConnected ? "WebSocket Streaming" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Auto-refresh:</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-semibold text-ink shadow-sm">
                Realtime
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
