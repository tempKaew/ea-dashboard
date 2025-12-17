"use client";

import { RunAt } from "@/types/trading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RunAtManagement() {
  const router = useRouter();
  const [runAtList, setRunAtList] = useState<RunAt[]>([]);
  const [accountCounts, setAccountCounts] = useState<{ [key: number]: number }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [newTitle, setNewTitle] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // Load run_at data and account counts
  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch run_at list
      const runAtRes = await fetch("/api/run-at");
      const runAtData = await runAtRes.json();
      setRunAtList(runAtData);

      // Fetch account counts for each run_at
      const counts: { [key: number]: number } = {};
      for (const runAt of runAtData) {
        const accountRes = await fetch(
          "/api/run-at/accounts-count?run_at_id=" + runAt.id,
        );
        const countData = await accountRes.json();
        counts[runAt.id] = countData.count || 0;
      }
      setAccountCounts(counts);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Start editing
  const handleEdit = (runAt: RunAt) => {
    setEditingId(runAt.id);
    setEditTitle(runAt.title);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim()) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/run-at/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (response.ok) {
        await loadData();
        setEditingId(null);
        setEditTitle("");
      } else {
        console.error("Failed to update run_at");
      }
    } catch (error) {
      console.error("Error updating run_at:", error);
    } finally {
      setSaving(false);
    }
  };

  // Add new run_at
  const handleAdd = async () => {
    if (!newTitle.trim()) return;

    try {
      setSaving(true);
      const response = await fetch("/api/run-at", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (response.ok) {
        await loadData();
        setNewTitle("");
      } else {
        console.error("Failed to create run_at");
      }
    } catch (error) {
      console.error("Error creating run_at:", error);
    } finally {
      setSaving(false);
    }
  };

  // Delete run_at
  const handleDelete = async () => {
    if (!deleteId || deleteConfirm !== "confirm") return;

    try {
      setSaving(true);
      const response = await fetch(`/api/run-at/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadData();
        setDeleteId(null);
        setDeleteConfirm("");
      } else {
        console.error("Failed to delete run_at");
      }
    } catch (error) {
      console.error("Error deleting run_at:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="border-b border-stone-800 bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">
                Run At Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Add New Run At */}
        <div className="mb-6 overflow-hidden rounded-lg border border-stone-800 bg-stone-900 shadow">
          <div className="border-b border-stone-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Add New Run At</h3>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="Enter run at title"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || saving}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* Run At List */}
        <div className="overflow-hidden rounded-lg border border-stone-800 bg-stone-900 shadow">
          <div className="border-b border-stone-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Run At List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-700">
              <thead className="bg-stone-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">
                    Accounts Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 bg-stone-900">
                {runAtList.map((runAt) => (
                  <tr key={runAt.id} className="hover:bg-stone-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {runAt.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {editingId === runAt.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded border border-stone-600 bg-stone-700 px-2 py-1 text-sm text-white focus:border-blue-400 focus:outline-none"
                        />
                      ) : (
                        <span className="font-medium text-white">
                          {runAt.title}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {accountCounts[runAt.id] || 0} accounts
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {isClient
                        ? new Date(runAt.created_at).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {editingId === runAt.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editTitle.trim() || saving}
                            className="text-green-400 hover:text-green-300 disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(runAt)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(runAt.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg border border-stone-700 bg-stone-900 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">
              Confirm Delete
            </h3>
            <p className="mb-4 text-gray-300">
              Are you sure you want to delete this run at? This action cannot be
              undone.
            </p>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-400">
                Type &quot;confirm&quot; to proceed:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded border border-stone-600 bg-stone-700 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                placeholder="confirm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteId(null);
                  setDeleteConfirm("");
                }}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "confirm" || saving}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
