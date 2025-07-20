"use client";

import { useEffect, useState } from "react";
import QuestCard, { Quest } from "@/components/QuestCard";
import { useQuestStore } from "@/lib/zustand";
import { useSession } from "next-auth/react";

export default function CurrentQuestsPage() {
  const { level: userLevel, traderFilter } = useQuestStore();
  const { status } = useSession();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [qRes, pRes] = await Promise.all([
        fetch("/api/quests"),
        status === "authenticated"
          ? fetch("/api/progress")
          : Promise.resolve(new Response("[]")),
      ]);

      const allQuests: Quest[] = await qRes.json();
      const doneIds: string[] = await pRes.json();

      setQuests(allQuests);
      setCompleted(new Set(doneIds));
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
    return <p className="p-8">Loading current quests…</p>;
  }

  // Filter by level and prerequisites
  let available = quests.filter(
    (q) =>
      q.level <= userLevel &&
      q.requirements.every((req) => completed.has(req.id))
  );

  // Also apply trader filter if any
  if (traderFilter) {
    available = available.filter((q) => q.trader === traderFilter);
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Current Quests</h1>
      {available.length === 0 ? (
        <p>No quests available at level {userLevel} yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {available.map((quest) => (
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
