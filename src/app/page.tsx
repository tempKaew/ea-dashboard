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
  const [sortField, setSortField] = useState<SortField>("account");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedRunAt, setSelectedRunAt] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const { latestUpdate, isConnected } = useRealtimeTrading();

  const titleSite = process.env.NEXT_PUBLIC_APP_NAME ?? "EA Dashboard";
  const [currentTime, setCurrentTime] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {loading && (
        <div className="absolute inset-0 z-50 flex h-dvh items-center justify-center bg-stone-900 bg-opacity-75">
          <div className="wave-container">
            <div className="wave-bar bg-slate-200"></div>
            <div className="wave-bar bg-slate-200"></div>
            <div className="wave-bar bg-slate-200"></div>
            <div className="wave-bar bg-slate-200"></div>
            <div className="wave-bar bg-slate-200"></div>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-stone-800 bg-stone-950">
        <div className="mx-auto max-w-7xl px-2 py-2 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <div className="flex w-full items-center gap-4 sm:w-fit">
              {/* Hamburger Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-md p-2 transition-colors hover:bg-stone-800"
                >
                  <svg
                    className="h-6 w-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md border border-stone-700 bg-stone-800 shadow-lg">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push("/run-at");
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-stone-700 hover:text-white"
                      >
                        🔧 Manage Run At
                      </button>
                      <div className="my-1 border-t border-stone-600"></div>
                      <button
                        onClick={() => {
                          window.location.reload();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-stone-700 hover:text-white"
                      >
                        🔄 Refresh Data
                      </button>
                      <div className="my-1 border-t border-stone-600"></div>
                      <div className="px-4 py-2 text-xs text-gray-400">
                        <div>Total: {accounts.length} accounts</div>
                        <div className="text-red-400">
                          Inactive:{" "}
                          {
                            accounts.filter((account) => {
                              const history =
                                accountsHistory[account.acc_number];
                              if (!history) return true;
                              return !isUpdateFresh(history.updated_at);
                            }).length
                          }{" "}
                          accounts
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h1 className="flex-1 text-2xl font-bold text-white sm:text-3xl">
                {titleSite}
              </h1>
            </div>
            <div className="flex w-full items-center justify-center gap-4 text-xs sm:w-fit sm:text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full sm:h-3 sm:w-3 ${
                    isConnected ? "animate-pulse bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium text-gray-300">
                  {isConnected ? "Live" : "Disconnected"}
                </span>
              </div>
              <div className="text-gray-400">
                Last update: {currentTime ?? "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Overall Stats */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatCard
            title="Total Accounts"
            value={stats?.total_accounts ?? 0}
            icon="users"
          />
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats?.total_balance ?? 0)}
            icon="wallet"
          />
          <StatCard
            title="Total Equity"
            value={formatCurrency(stats?.total_equity ?? 0)}
            color={
              stats &&
              toNumber(stats?.total_equity) >= toNumber(stats?.total_balance)
                ? "green"
                : "red"
            }
            colorBorder={
              stats &&
              toNumber(stats?.total_equity) >= toNumber(stats?.total_balance)
                ? "green"
                : "red"
            }
            icon="chart"
          />
          <StatCard
            title="Current P/L"
            value={formatCurrency(stats?.total_open_profit ?? 0)}
            previousValue={formatCurrency(stats?.before_total_open_profit ?? 0)}
            color={
              stats && toNumber(stats?.total_open_profit) >= 0 ? "green" : "red"
            }
            colorBorder={
              stats && toNumber(stats?.total_open_profit) >= 0 ? "green" : "red"
            }
            icon="trending"
          />
          <StatCard
            title="Today P/L"
            value={formatCurrency(stats?.total_closed_profit ?? 0)}
            previousValue={formatCurrency(
              stats?.before_total_closed_profit ?? 0,
            )}
            color={
              stats && toNumber(stats?.total_closed_profit) >= 0
                ? "green"
                : "red"
            }
            colorBorder={
              stats && toNumber(stats?.total_closed_profit) >= 0
                ? "green"
                : "red"
            }
            icon="target"
          />
        </div>

        {/* Accounts List */}
        <div className="overflow-hidden rounded-lg border border-stone-800 bg-stone-900 shadow">
          <div className="border-b border-stone-700 px-3 py-2 sm:px-6">
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <h3 className="mb-2 text-sm font-bold text-white sm:mb-0 sm:text-lg">
                Trading Accounts {getDateRange(dateFilter).label ?? ""}
                {showInactiveOnly && (
                  <span className="ml-2 text-sm text-red-400">
                    (Inactive Only: {filteredAccounts.length})
                  </span>
                )}
                {!showInactiveOnly && (
                  <span className="ml-2 text-sm text-gray-400">
                    ({filteredAccounts.length} acc)
                  </span>
                )}
              </h3>
              <div className="flex w-full items-center gap-2 sm:w-fit sm:gap-4">
                {/* Run At Filter */}
                <select
                  value={selectedRunAt || ""}
                  onChange={(e) =>
                    setSelectedRunAt(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="rounded border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-white"
                >
                  <option value="">All Run At</option>
                  {runAtList.map((runAt) => (
                    <option key={runAt.id} value={runAt.id}>
                      {runAt.title}
                    </option>
                  ))}
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="rounded border border-stone-600 bg-stone-800 px-2 py-1 text-sm text-white"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                </select>

                <button
                  onClick={() => setShowInactiveOnly(!showInactiveOnly)}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                    showInactiveOnly
                      ? "bg-red-600 text-white"
                      : "bg-stone-700 text-gray-300 hover:bg-stone-600"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      showInactiveOnly ? "bg-white" : "bg-red-500"
                    }`}
                  />
                  Inactive
                </button>
              </div>
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
              >
                Balance
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                active={sortField === "equity"}
                direction={sortDirection}
                onClick={() => handleSort("equity")}
              >
                Equity
              </TableHeaderCell>
              <TableHeaderCell>Current P&L</TableHeaderCell>
              <TableHeaderCell>Open</TableHeaderCell>
              <TableHeaderCell>Buy|Sell</TableHeaderCell>
              <TableHeaderCell>Today P&L</TableHeaderCell>
              <TableHeaderCell>Closed</TableHeaderCell>
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

                return (
                  <TableRow
                    key={account.id}
                    onClick={() =>
                      router.push(`/account/${account.acc_number}`)
                    }
                  >
                    <TableCell variant="primary">
                      <div>#{account.acc_number}</div>
                    </TableCell>
                    <TableCell variant="primary">
                      <div className="font-medium text-white">
                        {account.name || "Unnamed Account"}
                      </div>
                    </TableCell>
                    <TableCell>{account.run_at_title || "-"}</TableCell>
                    <TableCell>{formatCurrency(account.balance)}</TableCell>
                    <TableCell
                      variant={
                        toNumber(account.equity) >= toNumber(account.balance)
                          ? "success"
                          : "danger"
                      }
                    >
                      {formatCurrency(account.equity)}
                    </TableCell>
                    <TableCell
                      variant={
                        history && toNumber(history.current_profit) >= 0
                          ? "success"
                          : "danger"
                      }
                    >
                      {history ? formatCurrency(history.current_profit) : "-"}
                    </TableCell>
                    <TableCell>
                      {history ? history.current_total_trade : "-"}
                    </TableCell>
                    <TableCell>
                      {history ? (
                        <>
                          <span className="text-green-400">
                            {history.current_order_buy_count}
                          </span>
                          <span className="mx-1 text-gray-500">|</span>
                          <span className="text-red-400">
                            {history.current_order_sell_count}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell
                      variant={
                        history && toNumber(history.history_profit) >= 0
                          ? "success"
                          : "danger"
                      }
                    >
                      {history ? formatCurrency(history.history_profit) : "-"}
                    </TableCell>
                    <TableCell>
                      {history ? history.history_total_trade : "-"}
                    </TableCell>
                    <TableCell>
                      {history ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              isFresh ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-gray-300">
                            {formatTime(history.updated_at)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                          <span className="text-gray-500">-</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
