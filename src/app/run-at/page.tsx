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

  const loadData = async () => {
    try {
      setLoading(true);

      const runAtRes = await fetch("/api/run-at");
      const runAtData = await runAtRes.json();
      setRunAtList(runAtData);

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

  const handleEdit = (runAt: RunAt) => {
    setEditingId(runAt.id);
    setEditTitle(runAt.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

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

  return (
    <div className="relative min-h-screen bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-28 left-1/4 h-[380px] w-[520px] rounded-full bg-pink-200/40 blur-[110px]" />
        <div className="absolute top-1/4 -right-20 h-[420px] w-[480px] rounded-full bg-emerald-100/50 blur-[120px]" />
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-dashboard px-3.5 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="pastel-card mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-2xl border border-stroke px-3 py-2 text-sm font-semibold text-ink-muted transition-all hover:bg-slate-50 hover:text-ink"
            >
              ← Dashboard
            </button>
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Run At Management
            </h1>
          </div>
        </header>

        <div className="pastel-card mb-5 overflow-hidden rounded-3xl">
          <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-blue-50/40 px-5 py-4">
            <h3 className="text-base font-bold text-ink">Add New Run At</h3>
          </div>
          <div className="p-5">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-2xl border border-stroke bg-canvas px-4 py-2.5 text-sm text-ink transition-all focus:border-primary-container focus:ring-2 focus:ring-[rgba(137,194,217,0.2)] focus:outline-none"
                  placeholder="Enter run at title"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || saving}
                className="btn-primary px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        <div className="pastel-card overflow-hidden rounded-3xl">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/40 via-emerald-50/30 to-amber-50/40 px-5 py-4">
            <h3 className="text-base font-bold text-ink">Run At List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Accounts</th>
                  <th className="px-4 py-3.5">Created At</th>
                  <th className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                {runAtList.map((runAt) => (
                  <tr
                    key={runAt.id}
                    className="transition-colors hover:bg-[rgba(255,229,180,0.25)]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-bold text-indigo-600">
                      {runAt.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {editingId === runAt.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-xl border border-stroke bg-canvas px-3 py-1.5 text-sm text-ink focus:border-primary-container focus:ring-2 focus:ring-[rgba(137,194,217,0.2)] focus:outline-none"
                        />
                      ) : (
                        <span className="font-sans font-bold text-ink">
                          {runAt.title}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                        {accountCounts[runAt.id] || 0} accounts
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                      {isClient
                        ? new Date(runAt.created_at).toLocaleDateString("th-TH")
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-sans">
                      {editingId === runAt.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editTitle.trim() || saving}
                            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(runAt)}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(runAt.id)}
                            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
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

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(250,247,242,0.7)] backdrop-blur-[12px]">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-stroke bg-white p-6 shadow-pastel-md">
            <h3 className="mb-2 text-lg font-bold text-ink">Confirm Delete</h3>
            <p className="mb-4 text-sm text-ink-muted">
              Are you sure you want to delete this run at? This action cannot be
              undone.
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
                  setDeleteId(null);
                  setDeleteConfirm("");
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "confirm" || saving}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
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
