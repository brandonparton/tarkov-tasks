// File: src/app/tasks/chains/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Quest } from "@/types/quest";
import { getQuestChains } from "@/lib/questChains";

export default function ChainsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [chains, setChains] = useState<string[][]>([]);

  useEffect(() => {
    fetch("/api/quests")
      .then((r) => r.json())
      .then((data: Quest[]) => {
        setQuests(data);
        setChains(getQuestChains(data));
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Quest Chains</h1>
      {chains.map((chain, i) => (
        <div key={i} className="mb-3">
          {chain.map((id, idx) => {
            const q = quests.find((q) => q.id === id);
            return (
              <span key={id}>
                <strong>{q?.name}</strong>
                {idx < chain.length - 1 && " → "}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
