"use client";

import { Account, History, RunAt } from "@/types/trading";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AccountDetail() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [runAtList, setRunAtList] = useState<RunAt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    run_at_id: null as number | null,
  });
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isUpdateFresh = (updatedAt: string) => {
    const updateTime = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60);
    return diffMinutes <= 5;
  };

  const toNumber = (value: string | number): number => {
    return typeof value === "string" ? parseFloat(value) || 0 : value;
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(toNumber(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const loadHistory = useCallback(
    async (page = currentPage, limit = itemsPerPage) => {
      try {
        setHistoryLoading(true);

        let url = `/api/trading/history?acc_number=${params.id}`;

        if (limit !== -1) {
          const offset = (page - 1) * limit;
          url += `&limit=${limit}&offset=${offset}`;
        }

        const historyRes = await fetch(url);
        const historyData = await historyRes.json();

        if (Array.isArray(historyData)) {
          setHistory(historyData);
          if (limit === -1) {
            setTotalRecords(historyData.length);
          } else {
            setTotalRecords(
              historyData.length === limit
                ? page * limit + 1
                : (page - 1) * limit + historyData.length,
            );
          }
        }
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setHistoryLoading(false);
      }
    },
    [params.id, currentPage, itemsPerPage],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const runAtRes = await fetch("/api/run-at");
      const runAtData = await runAtRes.json();
      setRunAtList(runAtData);

      const accountRes = await fetch(
        `/api/trading/accounts?acc_number=${params.id}`,
      );
      const accountData = await accountRes.json();

      if (accountData.length > 0) {
        const account = accountData[0];
        setAccount(account);
        setEditForm({
          name: account.name || "",
          email: account.email || "",
          run_at_id: account.run_at_id || null,
        });

        await loadHistory();
      }
    } catch (error) {
      console.error("Error loading account data:", error);
    } finally {
      setLoading(false);
    }
  }, [loadHistory, params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (account) {
      loadHistory();
    }
  }, [currentPage, itemsPerPage, loadHistory, account]);

  const handleManualRefresh = async () => {
    await loadData();
    if (account) {
      await loadHistory(currentPage, itemsPerPage);
    }
  };

  const handleSave = async () => {
    if (!account) return;

    try {
      setSaving(true);
      const response = await fetch(
        `/api/trading/accounts?acc_number=${account.acc_number}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        },
      );

      if (response.ok) {
        const result = await response.json();
        setAccount(result.account);
        setIsEditing(false);
      } else {
        console.error("Failed to update account");
      }
    } catch (error) {
      console.error("Error updating account:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (account) {
      setEditForm({
        name: account.name || "",
        email: account.email || "",
        run_at_id: account.run_at_id || null,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!account || deleteConfirm !== "confirm") return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/trading/accounts?acc_number=${account.acc_number}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirm("");
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-canvas">
        <div className="wave-container">
          <div className="wave-bar" />
          <div className="wave-bar" />
          <div className="wave-bar" />
          <div className="wave-bar" />
          <div className="wave-bar" />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-canvas">
        <div className="pastel-card rounded-3xl p-8 text-center">
          <div className="mb-4 text-xl font-bold text-ink">Account not found</div>
          <button
            onClick={() => router.push("/")}
            className="btn-primary px-5 py-2.5 text-sm font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const todayHistory = history.find(
    (h) => h.date === new Date().toISOString().split("T")[0],
  );
  const isFresh = isUpdateFresh(account.updated_at);
  const equityPositive =
    toNumber(account.equity) >= toNumber(account.balance);
  const floatingPl = toNumber(account.equity) - toNumber(account.balance);

  return (
    <div className="relative min-h-screen bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-28 left-1/4 h-[380px] w-[520px] rounded-full bg-pink-200/40 blur-[110px]" />
        <div className="absolute top-1/4 -right-20 h-[420px] w-[480px] rounded-full bg-emerald-100/50 blur-[120px]" />
        <div className="absolute bottom-10 left-10 h-[360px] w-[550px] rounded-full bg-sky-200/40 blur-[120px]" />
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-dashboard px-3.5 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="pastel-card mb-5 flex flex-col gap-4 rounded-3xl px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-2xl border border-stroke px-3 py-2 text-sm font-semibold text-ink-muted transition-all hover:bg-slate-50 hover:text-ink"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Account #{account.acc_number}
            </h1>
            <button
              onClick={handleManualRefresh}
              className="rounded-2xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              Delete
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium shadow-sm ${
                isFresh
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isFresh ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span className="text-[11px] font-bold tracking-wide uppercase">
                {isFresh ? "Updated recently" : "Stale data"}
              </span>
            </div>
            <div className="font-mono text-[11px] text-ink-muted">
              Last update: {isClient ? formatTime(account.updated_at) : "-"}
            </div>
          </div>
        </header>

        <div className="mb-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
          <div className="pastel-card rounded-3xl border-blue-200/80 bg-gradient-to-b from-[#F0F7FF] to-white p-5">
            <h3 className="mb-2 font-mono text-[11px] font-bold tracking-wider text-blue-700 uppercase">
              Balance
            </h3>
            <p className="font-tabular font-mono text-2xl font-extrabold text-blue-900">
              {formatCurrency(account.balance)}
            </p>
          </div>
          <div
            className={`pastel-card rounded-3xl p-5 ${
              equityPositive
                ? "border-emerald-200 bg-gradient-to-b from-[#ECFDF5] to-white"
                : "border-amber-200 bg-gradient-to-b from-[#FEFCE8] to-white"
            }`}
          >
            <h3
              className={`mb-2 font-mono text-[11px] font-bold tracking-wider uppercase ${
                equityPositive ? "text-emerald-800" : "text-amber-700"
              }`}
            >
              Equity
            </h3>
            <p
              className={`font-tabular font-mono text-2xl font-extrabold ${
                equityPositive ? "text-emerald-600" : "text-amber-700"
              }`}
            >
              {formatCurrency(account.equity)}
            </p>
          </div>
          <div
            className={`pastel-card rounded-3xl p-5 ${
              floatingPl >= 0
                ? "border-emerald-200 bg-gradient-to-b from-[#F3FBF7] to-white"
                : "border-pink-200 bg-gradient-to-b from-[#FFF1F2] to-white"
            }`}
          >
            <h3
              className={`mb-2 font-mono text-[11px] font-bold tracking-wider uppercase ${
                floatingPl >= 0 ? "text-emerald-800" : "text-rose-700"
              }`}
            >
              Floating P/L
            </h3>
            <p
              className={`font-tabular font-mono text-2xl font-extrabold ${
                floatingPl >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(floatingPl)}
            </p>
          </div>
          <div className="pastel-card rounded-3xl border-purple-200 bg-gradient-to-b from-purple-50 to-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[11px] font-bold tracking-wider text-purple-700 uppercase">
                Account Info
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-ink-muted uppercase">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-stroke bg-canvas px-2.5 py-1.5 text-sm text-ink focus:border-primary-container focus:ring-2 focus:ring-[rgba(137,194,217,0.2)] focus:outline-none"
                    placeholder="Account name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-ink-muted uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-stroke bg-canvas px-2.5 py-1.5 text-sm text-ink focus:border-primary-container focus:ring-2 focus:ring-[rgba(137,194,217,0.2)] focus:outline-none"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-ink-muted uppercase">
                    Run At
                  </label>
                  <select
                    value={editForm.run_at_id || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        run_at_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-xl border border-stroke bg-canvas px-2.5 py-1.5 text-sm text-ink focus:border-primary-container focus:ring-2 focus:ring-[rgba(137,194,217,0.2)] focus:outline-none"
                  >
                    <option value="">Select Run At</option>
                    {runAtList.map((runAt) => (
                      <option key={runAt.id} value={runAt.id}>
                        {runAt.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-base font-bold text-ink">
                  {account.name || "Unnamed Account"}
                </p>
                <p className="text-sm text-ink-muted">
                  {account.email || "No email set"}
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {account.run_at_title || "No run at set"}
                </p>
              </div>
            )}
          </div>
        </div>

        {todayHistory && (
          <div className="mb-5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <div className="pastel-card rounded-3xl p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Current Open Positions
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Total Trades</span>
                  <span className="font-tabular font-semibold text-ink">
                    {todayHistory.current_total_trade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Profit/Loss</span>
                  <span
                    className={`font-tabular font-semibold ${
                      toNumber(todayHistory.current_profit) >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(todayHistory.current_profit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Total Lot</span>
                  <span className="font-tabular font-semibold text-ink">
                    {toNumber(todayHistory.current_lot).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-stroke pt-3">
                  <div>
                    <div className="text-sm text-ink-muted">Buy Orders</div>
                    <div className="font-tabular text-xl font-bold text-emerald-600">
                      {todayHistory.current_order_buy_count}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-ink-muted">Sell Orders</div>
                    <div className="font-tabular text-xl font-bold text-rose-500">
                      {todayHistory.current_order_sell_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pastel-card rounded-3xl p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Today&apos;s Closed Trades
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Total Trades</span>
                  <span className="font-tabular font-semibold text-ink">
                    {todayHistory.history_total_trade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Profit/Loss</span>
                  <span
                    className={`font-tabular font-semibold ${
                      toNumber(todayHistory.history_profit) >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(todayHistory.history_profit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">Total Lot</span>
                  <span className="font-tabular font-semibold text-ink">
                    {toNumber(todayHistory.history_lot).toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-stroke pt-3">
                  <div>
                    <div className="text-xs text-ink-muted">Win</div>
                    <div className="font-tabular text-lg font-bold text-emerald-600">
                      {todayHistory.history_win}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted">Loss</div>
                    <div className="font-tabular text-lg font-bold text-rose-500">
                      {todayHistory.history_loss}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted">Win Rate</div>
                    <div className="font-tabular text-lg font-bold text-blue-600">
                      {toNumber(todayHistory.history_total_trade) > 0
                        ? (
                            (toNumber(todayHistory.history_win) /
                              toNumber(todayHistory.history_total_trade)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pastel-card overflow-hidden rounded-3xl">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-blue-50/40 px-5 py-4 sm:flex-row sm:items-center">
            <h3 className="text-base font-bold text-ink">Trading History</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink-muted">
                  Show:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newLimit = parseInt(e.target.value);
                    setItemsPerPage(newLimit);
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer appearance-none rounded-2xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>All</option>
                </select>
                <span className="text-xs text-ink-muted">records</span>
              </div>
              {itemsPerPage !== -1 && (
                <div className="font-mono text-xs text-ink-muted">
                  Page {currentPage} • {history.length} records
                  {historyLoading && <span className="ml-2">Loading...</span>}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Balance</th>
                  <th className="px-4 py-3.5 text-right">Equity</th>
                  <th className="px-4 py-3.5 text-right">Open P/L</th>
                  <th className="px-4 py-3.5 text-right">Closed P/L</th>
                  <th className="px-4 py-3.5 text-center">Win/Loss</th>
                  <th className="px-4 py-3.5">Total Trades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                {historyLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-ink-muted"
                    >
                      Loading history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-ink-muted"
                    >
                      No trading history found
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-[rgba(255,229,180,0.25)]"
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-sans font-bold text-ink">
                        {formatDate(record.date)}
                      </td>
                      <td className="font-tabular whitespace-nowrap px-4 py-4 text-right font-bold text-ink">
                        {formatCurrency(record.balance)}
                      </td>
                      <td
                        className={`font-tabular whitespace-nowrap px-4 py-4 text-right font-bold ${
                          toNumber(record.equity) >= toNumber(record.balance)
                            ? "text-emerald-600"
                            : "text-amber-700"
                        }`}
                      >
                        {formatCurrency(record.equity)}
                      </td>
                      <td
                        className={`font-tabular whitespace-nowrap px-4 py-4 text-right font-bold ${
                          toNumber(record.current_profit) >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(record.current_profit)}
                      </td>
                      <td
                        className={`font-tabular whitespace-nowrap px-4 py-4 text-right font-bold ${
                          toNumber(record.history_profit) >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(record.history_profit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span className="font-tabular font-bold text-emerald-600">
                          {record.history_win}
                        </span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-tabular font-bold text-rose-500">
                          {record.history_loss}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                        <div className="text-[11px]">
                          Open: {record.current_total_trade}
                        </div>
                        <div className="text-[11px]">
                          Closed: {record.history_total_trade}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {itemsPerPage !== -1 && (
            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:flex-row sm:items-center">
              <div className="font-mono text-xs text-slate-500">
                Showing{" "}
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalRecords)}{" "}
                to {Math.min(currentPage * itemsPerPage, totalRecords)} of{" "}
                {totalRecords} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || historyLoading}
                  className="rounded-full border border-stroke bg-white px-3 py-1 text-xs font-bold text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(totalRecords / itemsPerPage),
                      ),
                    },
                    (_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      const maxPage = Math.ceil(totalRecords / itemsPerPage);
                      if (pageNum > maxPage) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={historyLoading}
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            pageNum === currentPage
                              ? "bg-primary-container text-white shadow-pastel-sky"
                              : "border border-stroke bg-white text-ink-muted hover:bg-slate-50"
                          } disabled:opacity-50`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={history.length < itemsPerPage || historyLoading}
                  className="rounded-full border border-stroke bg-white px-3 py-1 text-xs font-bold text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(250,247,242,0.7)] backdrop-blur-[12px]">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-stroke bg-white p-6 shadow-pastel-md">
            <h3 className="mb-2 text-lg font-bold text-ink">Delete Account</h3>
            <p className="mb-4 text-sm text-ink-muted">
              Are you sure you want to delete account #{account?.acc_number}?
              This will permanently delete the account and all its trading
              history. This action cannot be undone.
            </p>
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold text-ink-muted uppercase">
                Type &quot;confirm&quot; to proceed
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-2xl border border-stroke bg-canvas px-4 py-2.5 text-sm text-ink focus:border-primary-container focus:ring-2 focus:ring-[rgba(137,194,217,0.2)] focus:outline-none"
                placeholder="confirm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "confirm" || deleting}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
