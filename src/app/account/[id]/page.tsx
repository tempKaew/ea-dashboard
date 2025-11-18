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

  // Load history with pagination
  const loadHistory = useCallback(
    async (page = currentPage, limit = itemsPerPage) => {
      try {
        setHistoryLoading(true);

        let url = `/api/trading/history?acc_number=${params.id}`;

        if (limit !== -1) {
          // -1 means "all"
          const offset = (page - 1) * limit;
          url += `&limit=${limit}&offset=${offset}`;
        }

        const historyRes = await fetch(url);
        const historyData = await historyRes.json();

        if (Array.isArray(historyData)) {
          setHistory(historyData);
          // For "all" option, set total to actual length
          if (limit === -1) {
            setTotalRecords(historyData.length);
          } else {
            // For paginated results, we need to get total count
            // For now, estimate based on returned data
            setTotalRecords(
              historyData.length === limit
                ? page * limit + 1
                : (page - 1) * limit + historyData.length
            );
          }
        }
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setHistoryLoading(false);
      }
    },
    [params.id, currentPage, itemsPerPage]
  );

  // Load account data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch run_at list
      const runAtRes = await fetch("/api/run-at");
      const runAtData = await runAtRes.json();
      setRunAtList(runAtData);

      // Fetch specific account
      const accountRes = await fetch(
        `/api/trading/accounts?acc_number=${params.id}`
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

        // Load initial history
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

  // Load history when page or items per page changes
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

  // Save account changes
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
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAccount(result.account);
        setIsEditing(false);
        console.log("Account updated successfully");
      } else {
        console.error("Failed to update account");
      }
    } catch (error) {
      console.error("Error updating account:", error);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
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

  // Delete account
  const handleDelete = async () => {
    if (!account || deleteConfirm !== "confirm") return;

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/trading/accounts?acc_number=${account.acc_number}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Redirect to dashboard after successful deletion
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
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-white mb-4">Account not found</div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const todayHistory = history.find(
    (h) => h.date === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="bg-stone-950 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-white">
                Account #{account.acc_number}
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualRefresh}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isUpdateFresh(account.updated_at)
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-300">
                  {isUpdateFresh(account.updated_at)
                    ? "Updated recently"
                    : "Stale data"}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Last update: {formatTime(account.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="border border-stone-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-400 mb-2">Balance</h3>
            <p className="text-2xl font-bold text-blue-400">
              {formatCurrency(account.balance)}
            </p>
          </div>
          <div className="border border-stone-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-400 mb-2">Equity</h3>
            <p
              className={`text-2xl font-bold ${
                toNumber(account.equity) >= toNumber(account.balance)
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(account.equity)}
            </p>
          </div>
          <div className="border border-stone-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-400 mb-2">Floating P/L</h3>
            <p
              className={`text-2xl font-bold ${
                toNumber(account.equity) - toNumber(account.balance) >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(
                toNumber(account.equity) - toNumber(account.balance)
              )}
            </p>
          </div>
          <div className="border border-stone-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-400">Account Info</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                    placeholder="Account name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
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
                    className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">Select Run At</option>
                    {runAtList.map((runAt) => (
                      <option key={runAt.id} value={runAt.id}>
                        {runAt.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg text-white">
                  {account.name || "Unnamed Account"}
                </p>
                <p className="text-sm text-gray-300">
                  {account.email || "No email set"}
                </p>
                <p className="text-sm text-blue-300">
                  {account.run_at_title || "No run at set"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Trading */}
        {todayHistory && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Current Open Positions */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <span>📊</span> Current Open Positions
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Trades</span>
                  <span className="font-semibold text-white">
                    {todayHistory.current_total_trade}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Profit/Loss</span>
                  <span
                    className={`font-semibold ${
                      toNumber(todayHistory.current_profit) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(todayHistory.current_profit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Lot</span>
                  <span className="font-semibold text-white">
                    {toNumber(todayHistory.current_lot).toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Buy Orders</div>
                    <div className="text-xl font-bold text-green-400">
                      {todayHistory.current_order_buy_count}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Sell Orders</div>
                    <div className="text-xl font-bold text-red-400">
                      {todayHistory.current_order_sell_count}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Closed Trades */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <span>📜</span> Today&apos;s Closed Trades
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Trades</span>
                  <span className="font-semibold text-white">
                    {todayHistory.history_total_trade}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Profit/Loss</span>
                  <span
                    className={`font-semibold ${
                      toNumber(todayHistory.history_profit) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatCurrency(todayHistory.history_profit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Lot</span>
                  <span className="font-semibold text-white">
                    {toNumber(todayHistory.history_lot).toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-700 grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-gray-400">Win</div>
                    <div className="text-lg font-bold text-green-400">
                      {todayHistory.history_win}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Loss</div>
                    <div className="text-lg font-bold text-red-400">
                      {todayHistory.history_loss}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="text-lg font-bold text-blue-400">
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

        {/* History Table */}
        <div className="bg-stone-900 rounded-lg shadow overflow-hidden border border-stone-800">
          <div className="px-6 py-4 border-b border-stone-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Trading History</h3>

            {/* Items per page selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newLimit = parseInt(e.target.value);
                    setItemsPerPage(newLimit);
                    setCurrentPage(1);
                  }}
                  className="bg-stone-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-400 focus:outline-none"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>All</option>
                </select>
                <span className="text-sm text-gray-400">records</span>
              </div>

              {/* Page info */}
              {itemsPerPage !== -1 && (
                <div className="text-sm text-gray-400">
                  Page {currentPage} • {history.length} records
                  {historyLoading && <span className="ml-2">Loading...</span>}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-700">
              <thead className="bg-stone-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Equity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Open P/L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Closed P/L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Win/Loss
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Total Trades
                  </th>
                </tr>
              </thead>
              <tbody className="bg-stone-900 divide-y divide-stone-800">
                {historyLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                        Loading history...
                      </div>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No trading history found
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-stone-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(record.balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span
                          className={
                            toNumber(record.equity) >= toNumber(record.balance)
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {formatCurrency(record.equity)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span
                          className={
                            toNumber(record.current_profit) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {formatCurrency(record.current_profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span
                          className={
                            toNumber(record.history_profit) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {formatCurrency(record.history_profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-green-400 font-semibold">
                          {record.history_win}
                        </span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-red-400 font-semibold">
                          {record.history_loss}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="text-xs">
                          Open: {record.current_total_trade}
                        </div>
                        <div className="text-xs">
                          Closed: {record.history_total_trade}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {itemsPerPage !== -1 && (
            <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing{" "}
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalRecords)}{" "}
                to {Math.min(currentPage * itemsPerPage, totalRecords)} of{" "}
                {totalRecords} records
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || historyLoading}
                  className="px-3 py-1 bg-stone-700 text-white text-sm rounded hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {/* Page numbers */}
                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(totalRecords / itemsPerPage)
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
                          className={`px-3 py-1 text-sm rounded ${
                            pageNum === currentPage
                              ? "bg-stone-600 text-white"
                              : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                          } disabled:opacity-50`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={history.length < itemsPerPage || historyLoading}
                  className="px-3 py-1 bg-stone-700 text-white text-sm rounded hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4 border border-stone-700">
            <h3 className="text-lg font-bold text-white mb-4">
              Delete Account
            </h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete account #{account?.acc_number}?
              This will permanently delete the account and all its trading
              history. This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Type &quot;confirm&quot; to proceed:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-3 py-2 bg-stone-700 text-white rounded border border-stone-600 focus:border-blue-400 focus:outline-none"
                placeholder="confirm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "confirm" || deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
