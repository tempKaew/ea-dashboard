"use client";

import { RunAt } from "@/types/trading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RunAtManagement() {
  const router = useRouter();
  const [runAtList, setRunAtList] = useState<RunAt[]>([]);
  const [accountCounts, setAccountCounts] = useState<{ [key: number]: number }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
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
          "/api/run-at/accounts-count?run_at_id=" + runAt.id
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
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

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
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">
                Run At Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Run At */}
        <div className="bg-stone-900 rounded-lg shadow overflow-hidden border border-stone-800 mb-6">
          <div className="px-6 py-4 border-b border-stone-700">
            <h3 className="text-lg font-bold text-white">Add New Run At</h3>
          </div>
          <div className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-700 text-white rounded border border-stone-600 focus:border-blue-400 focus:outline-none"
                  placeholder="Enter run at title"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* Run At List */}
        <div className="bg-stone-900 rounded-lg shadow overflow-hidden border border-stone-800">
          <div className="px-6 py-4 border-b border-stone-700">
            <h3 className="text-lg font-bold text-white">Run At List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-700">
              <thead className="bg-stone-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Accounts Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-stone-900 divide-y divide-stone-800">
                {runAtList.map((runAt) => (
                  <tr key={runAt.id} className="hover:bg-stone-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {runAt.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingId === runAt.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 bg-stone-700 text-white text-sm rounded border border-stone-600 focus:border-blue-400 focus:outline-none"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {runAt.title}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {accountCounts[runAt.id] || 0} accounts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(runAt.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4 border border-stone-700">
            <h3 className="text-lg font-bold text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this run at? This action cannot be
              undone.
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
                  setDeleteId(null);
                  setDeleteConfirm("");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "confirm" || saving}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
