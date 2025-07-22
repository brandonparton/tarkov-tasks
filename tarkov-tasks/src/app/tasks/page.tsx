// File: src/app/tasks/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuestStore } from "@/lib/zustand";
import QuestCard, { Quest } from "@/components/QuestCard";
import {
  ClipboardIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function TasksPage() {
  const { traderFilter, setTraderFilter, level: userLevel } = useQuestStore();
  const { status } = useSession();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [mainTab, setMainTab] = useState<"all" | "maps" | "traders">("all");
  const [statusTabs, setStatusTabs] = useState({
    available: true,
    locked: true,
    completed: true,
  });
  const [subTab, setSubTab] = useState<"all" | "yourself">("yourself");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const qRes = await fetch("/api/quests");
      const allQ: Quest[] = await qRes.json();

      let doneIds: string[] = [];
      if (status === "authenticated") {
        const pRes = await fetch("/api/progress");
        doneIds = await pRes.json();
      }

      setQuests(allQ);
      setCompletedSet(new Set(doneIds));
      setLoading(false);
    }
    load();
  }, [status]);

  const handleComplete = async (id: string) => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId: id }),
    });
    if (res.ok) setCompletedSet((prev) => new Set(prev).add(id));
  };

  if (loading) {
    return <p className="p-8 text-gray-400">Loading quests…</p>;
  }

  // filter by trader
  let byTrader = quests;
  if (traderFilter) byTrader = byTrader.filter((q) => q.trader === traderFilter);

  // derive current vs all
  const current = byTrader.filter((q) => {
    if (completedSet.has(q.id)) return false;
    if (q.level > userLevel) return false;
    return q.requirements.every((r) => completedSet.has(r.id));
  });
  const allList = byTrader;
  const baseList = subTab === "yourself" ? current : allList;

  // now filter by available / locked / completed
  const finalList = baseList.filter((q) => {
    const done = completedSet.has(q.id);
    const unmet = q.requirements.some((r) => !completedSet.has(r.id));
    if (done) return statusTabs.completed;
    if (!done && !unmet) return statusTabs.available;
    if (!done && unmet) return statusTabs.locked;
    return false;
  });

  const traders = Array.from(new Set(quests.map((q) => q.trader)));

  // helper to render each tab button with high contrast
  const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }> = ({ active, onClick, icon, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-4 py-2 rounded-md font-medium transition ${
        active
          ? "bg-olive-600 text-white"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
      }`}
    >
      {icon}
      {children}
    </button>
  );

  return (
    <main className="p-6 space-y-6">
      {/* 1) Main Tabs */}
      <div className="flex gap-2">
        <TabButton
          active={mainTab === "all"}
          onClick={() => {
            setMainTab("all");
            setTraderFilter(null);
          }}
        >
          ALL
        </TabButton>
        <TabButton
          active={mainTab === "maps"}
          onClick={() => {
            setMainTab("maps");
            setTraderFilter(null);
          }}
        >
          MAPS
        </TabButton>
        <TabButton
          active={mainTab === "traders"}
          onClick={() => setMainTab("traders")}
        >
          TRADERS
        </TabButton>
      </div>

      {/* trader carousel */}
      {mainTab === "traders" && (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          <ArrowLeftIcon className="h-6 w-6 text-gray-400" />
          {traders.map((tr) => (
            <TabButton
              key={tr}
              active={traderFilter === tr}
              onClick={() => setTraderFilter(traderFilter === tr ? null : tr)}
            >
              {tr}
            </TabButton>
          ))}
          <ArrowRightIcon className="h-6 w-6 text-gray-400" />
        </div>
      )}

      {/* 2) Status Tabs */}
      <div className="flex gap-2">
        <TabButton
          active={statusTabs.available}
          onClick={() =>
            setStatusTabs((s) => ({ ...s, available: !s.available }))
          }
          icon={<ClipboardIcon className="h-5 w-5" />}
        >
          AVAILABLE
        </TabButton>
        <TabButton
          active={statusTabs.locked}
          onClick={() =>
            setStatusTabs((s) => ({ ...s, locked: !s.locked }))
          }
          icon={<LockClosedIcon className="h-5 w-5" />}
        >
          LOCKED
        </TabButton>
        <TabButton
          active={statusTabs.completed}
          onClick={() =>
            setStatusTabs((s) => ({ ...s, completed: !s.completed }))
          }
          icon={<CheckIcon className="h-5 w-5" />}
        >
          COMPLETED
        </TabButton>
      </div>

      {/* 3) Sub-tabs */}
      <div className="flex gap-2">
        <TabButton
          active={subTab === "all"}
          onClick={() => setSubTab("all")}
        >
          ALL
        </TabButton>
        <TabButton
          active={subTab === "yourself"}
          onClick={() => setSubTab("yourself")}
        >
          YOURSELF
        </TabButton>
      </div>

      {/* Quest list */}
      {finalList.length === 0 ? (
        <p className="text-gray-500">
          No quests found
          {traderFilter ? ` for ${traderFilter}` : ""}
          {subTab === "yourself" ? ` unlocked at level ${userLevel}` : ""}.
        </p>
      ) : (
        <div className="space-y-4">
          {finalList.map((q) => (
            <QuestCard
              key={q.id}
              quest={q}
              completed={completedSet.has(q.id)}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </main>
  );
}
