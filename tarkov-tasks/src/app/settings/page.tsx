// File: src/app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQuestStore } from "@/lib/zustand";

export default function SettingsPage() {
  const { level, setLevel } = useQuestStore();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [localLevel, setLocalLevel] = useState(level);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/level")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.level === "number") {
            setLevel(data.level);
            setLocalLevel(data.level);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [status, setLevel]);

  const saveLevel = async () => {
    setLevel(localLevel);
    if (status === "authenticated") {
      await fetch("/api/user/level", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: localLevel }),
      });
      await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Updated PMC level to ${localLevel}` }),
      });
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset your account? This will wipe your level, progress, and activity feed.")) return;

    setResetting(true);
    const res = await fetch("/api/user/reset", { method: "POST" });

    if (res.ok) {
      await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Reset account" }),
      });
      location.reload(); // refresh everything
    } else {
      alert("Failed to reset account.");
    }
    setResetting(false);
  };

  if (loading) return <p className="p-6 text-gray-400">Loading settings…</p>;

  return (
    <main className="p-6 max-w-xl space-y-8">
      <h1 className="text-2xl font-bold text-[#C0D96F]">Settings</h1>

      {/* Account Info */}
      <section className="bg-[#101214] p-4 rounded border border-[#2A2E35] space-y-2">
        <h2 className="text-lg font-semibold text-[#8FAF4F]">Account</h2>
        {session ? (
          <>
            <div className="text-sm text-gray-300">
              Signed in as <span className="font-medium">{session.user.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-400 hover:underline"
            >
              Sign out
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-400">Not signed in.</div>
        )}
      </section>

      {/* Level Editor */}
      <section className="bg-[#101214] p-4 rounded border border-[#2A2E35] space-y-2">
        <h2 className="text-lg font-semibold text-[#8FAF4F]">PMC Level</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={100}
            value={localLevel}
            onChange={(e) => setLocalLevel(parseInt(e.target.value, 10) || 1)}
            className="w-20 px-2 py-1 bg-[#1A1C23] text-white border border-[#3A3D42] rounded"
          />
          <button
            onClick={saveLevel}
            className="px-3 py-1 bg-[#8FAF4F] text-black rounded hover:bg-[#C0D96F]"
          >
            Save
          </button>
        </div>
      </section>

      {/* Reset */}
      <section className="bg-[#101214] p-4 rounded border border-[#2A2E35] space-y-3">
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        <p className="text-sm text-gray-400">
          This will wipe your progress, level, and activity log. It cannot be undone.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition"
        >
          {resetting ? "Resetting..." : "Reset My Account"}
        </button>
      </section>
    </main>
  );
}
