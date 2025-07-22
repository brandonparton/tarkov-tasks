"use client";

import React, { useEffect, useState } from "react";
import type { Quest } from "@/types/quest";
import QuestCard from "@/components/QuestCard";
import { useQuestStore } from "@/lib/zustand";
import { useSession } from "next-auth/react";
import {
  GlobeAltIcon,
  MapIcon,
  UserGroupIcon,
  ClipboardIcon,
  LockClosedIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

type PrimaryView = "all" | "maps" | "traders";
type StatusView = "available" | "locked" | "completed";

const TabButton = ({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition rounded-md
      ${active
        ? "text-[#C0D96F] border-b-2 border-[#C0D96F]"
        : "text-gray-300 hover:text-white"}
    `}
  >
    {icon}
    {children}
  </button>
);

export default function CurrentQuestsPage() {
  const { level: userLevel } = useQuestStore();
  const { status } = useSession();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [primaryView, setPrimaryView] = useState<PrimaryView>("all");
  const [statusView, setStatusView] = useState<StatusView>("available");
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [qRes, pRes] = await Promise.all([
        fetch("/api/quests"),
        status === "authenticated"
          ? fetch("/api/progress")
          : Promise.resolve(new Response("[]")),
      ]);

      let qs: Quest[] = await qRes.json();
      const doneIds: string[] = await pRes.json();

      // Drop every quest with any traderRequirements (i.e. reputation tasks)
      qs = qs.filter((q) => q.traderRequirements.length === 0);

      setQuests(qs);
      setCompleted(new Set(doneIds));
      setLoading(false);
    }
    load();
  }, [status]);

  const handleComplete = async (quest: Quest) => {
    const already = completed.has(quest.id);

    const res = await fetch("/api/progress", {
      method: already ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId: quest.id }),
    });

    if (!res.ok) return;

    setCompleted((prev) => {
      const next = new Set(prev);
      already ? next.delete(quest.id) : next.add(quest.id);
      return next;
    });

    // 🔄 Send to activity feed
    await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: already
          ? `Undid Quest: “${quest.name}”`
          : `Completed Quest: “${quest.name}”`,
      }),
    });
  };

  if (loading) {
    return <p className="p-6 text-gray-400">Loading quests…</p>;
  }

  const available = quests.filter(
    (q) =>
      q.level <= userLevel &&
      q.requirements.every((r) => completed.has(r.id)) &&
      !completed.has(q.id)
  );
  const locked = quests.filter((q) => !completed.has(q.id) && !available.includes(q));
  const done = quests.filter((q) => completed.has(q.id));

  let displayed: Quest[] = [];
  switch (statusView) {
    case "available":
      displayed = available;
      break;
    case "locked":
      displayed = locked;
      break;
    case "completed":
      displayed = done;
      break;
  }

  if (primaryView === "traders" && selectedTrader) {
    displayed = displayed.filter((q) => q.trader === selectedTrader);
  }

  const traders = Array.from(new Set(quests.map((q) => q.trader)));

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Tasks</h1>

      {/* Primary Tabs */}
      <div className="flex gap-4 bg-[#16191E] px-4 py-2 rounded-md">
        <TabButton
          active={primaryView === "all"}
          onClick={() => {
            setPrimaryView("all");
            setSelectedTrader(null);
          }}
          icon={<MapIcon className="h-4 w-4" />}
        >
          All
        </TabButton>
        <TabButton
          active={primaryView === "maps"}
          onClick={() => {
            setPrimaryView("maps");
            setSelectedTrader(null);
          }}
          icon={<GlobeAltIcon className="h-4 w-4" />}
        >
          Maps
        </TabButton>
        <TabButton
          active={primaryView === "traders"}
          onClick={() => setPrimaryView("traders")}
          icon={<UserGroupIcon className="h-4 w-4" />}
        >
          Traders
        </TabButton>
      </div>

      {/* Trader Scroller */}
      {primaryView === "traders" && (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {traders.map((t) => (
            <button
              key={t}
              onClick={() =>
                setSelectedTrader((sel) => (sel === t ? null : t))
              }
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition
                ${selectedTrader === t
                  ? "bg-[#2A2E35] text-[#C0D96F]"
                  : "bg-[#1A1C23] text-gray-300 hover:text-white"}
              `}
            >
              <img
                src={`/traders/${t.toLowerCase().replace(/\s+/g, "-")}.png`}
                alt={t}
                className="h-6 w-6 rounded-full border border-gray-600"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-4 bg-[#16191E] px-4 py-2 rounded-md">
        <TabButton
          active={statusView === "available"}
          onClick={() => setStatusView("available")}
          icon={<ClipboardIcon className="h-4 w-4" />}
        >
          Available
        </TabButton>
        <TabButton
          active={statusView === "locked"}
          onClick={() => setStatusView("locked")}
          icon={<LockClosedIcon className="h-4 w-4" />}
        >
          Locked
        </TabButton>
        <TabButton
          active={statusView === "completed"}
          onClick={() => setStatusView("completed")}
          icon={<CheckIcon className="h-4 w-4" />}
        >
          Completed
        </TabButton>
      </div>

      {/* Quest List */}
      {displayed.length === 0 ? (
        <p className="text-gray-400">No quests to show.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-700 space-y-4">
          {displayed.map((q) => (
            <div key={q.id} className="py-2">
              <QuestCard
                quest={q}
                completed={completed.has(q.id)}
                onComplete={handleComplete}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
