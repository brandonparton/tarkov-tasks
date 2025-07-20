"use client";

import { useEffect, useState } from "react";
import { useQuestStore } from "../../lib/zustand";
import { useSession, signIn, signOut } from "next-auth/react";

export default function TestPage() {
  const { level, setLevel, traderFilter, setTraderFilter } = useQuestStore();
  const { data: session, status } = useSession();

  // ── Level loading & persistence ──
  const [loadingLevel, setLoadingLevel] = useState(true);
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/level")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.level === "number") {
            setLevel(data.level);
          }
        })
        .finally(() => setLoadingLevel(false));
    } else {
      setLoadingLevel(false);
    }
  }, [status, setLevel]);

  const handleLevelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(e.target.value, 10) || 1;
    setLevel(newLevel);
    if (status === "authenticated") {
      await fetch("/api/user/level", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      });
    }
  };

  // ── Quest Progress state & logic ──
  const [progress, setProgress] = useState<string[]>([]);
  const [newQuestId, setNewQuestId] = useState("");
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/progress")
        .then((res) => res.json())
        .then((ids: string[]) => setProgress(ids));
    }
  }, [status]);

  const handleMarkComplete = async () => {
    if (!newQuestId) return;
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId: newQuestId }),
    });
    if (res.ok) {
      setProgress((prev) => [newQuestId, ...prev]);
      setNewQuestId("");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add");
    }
  };

  if (loadingLevel) {
    return <p className="p-8">Loading your PMC level…</p>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">🚧 Quick Test Page</h1>

      {/* Tailwind test */}
      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded">
        Tailwind Button
      </button>

      {/* Zustand + Level persistence */}
      <div className="space-y-2">
        <p>
          <strong>Level:</strong> {level}
        </p>
        <input
          type="number"
          value={level}
          min={1}
          onChange={handleLevelChange}
          className="w-20 p-1 border rounded"
        />
      </div>

      {/* Trader filter (local only) */}
      <div className="space-y-2">
        <p>
          <strong>Trader Filter:</strong> {traderFilter ?? "—"}
        </p>
        <select
          value={traderFilter ?? ""}
          onChange={(e) =>
            setTraderFilter(e.target.value === "" ? null : e.target.value)
          }
          className="p-1 border rounded"
        >
          <option value="">All</option>
          <option value="Prapor">Prapor</option>
          <option value="Therapist">Therapist</option>
          <option value="Fence">Fence</option>
        </select>
      </div>

      {/* NextAuth test */}
      <div className="space-y-2">
        <p>
          <strong>Auth status:</strong> {status}
        </p>
        {session ? (
          <>
            <p>Signed in as {session.user.email}</p>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Quest Progress test */}
      {status === "authenticated" && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Quest Progress</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Quest ID"
              value={newQuestId}
              onChange={(e) => setNewQuestId(e.target.value)}
              className="p-1 border rounded flex-1"
            />
            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
            >
              Mark Complete
            </button>
          </div>
          <ul className="list-disc pl-5">
            {progress.length > 0 ? (
              progress.map((id) => <li key={id}>{id}</li>)
            ) : (
              <li>No quests completed yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
