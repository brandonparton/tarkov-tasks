"use client";

import { useEffect, useState } from "react";
import QuestCard, { Quest } from "@/components/QuestCard";
import { useQuestStore } from "@/lib/zustand";
import { useSession } from "next-auth/react";

export default function AllQuestsPage() {
  const { traderFilter } = useQuestStore();
  const { status } = useSession();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch quests and progress
  useEffect(() => {
    async function load() {
      setLoading(true);
      const qRes = await fetch("/api/quests");
      const qData: Quest[] = await qRes.json();

      let pIds: string[] = [];
      if (status === "authenticated") {
        const pRes = await fetch("/api/progress");
        pIds = await pRes.json();
      }

      setQuests(qData);
      setCompleted(new Set(pIds));
      setLoading(false);
    }
    load();
  }, [status]);

  const handleComplete = async (questId: string) => {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId }),
    });
    if (res.ok) {
      setCompleted((prev) => new Set(prev).add(questId));
    }
  };

  if (loading) {
    return <p className="p-8">Loading quests…</p>;
  }

  const visible = traderFilter
    ? quests.filter((q) => q.trader === traderFilter)
    : quests;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Quests</h1>
      {visible.length === 0 ? (
        <p>No quests found{traderFilter ? ` for ${traderFilter}` : ""}.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              completed={completed.has(quest.id)}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </main>
  );
}
