"use client";

import { useState } from "react";

export interface Quest {
  id: string;
  name: string;
  level: number;
  trader: string;
  requirements: { id: string }[];
}

interface QuestCardProps {
  quest: Quest;
  completed: boolean;
  onComplete: (questId: string) => void;
}

export default function QuestCard({ quest, completed, onComplete }: QuestCardProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (completed) return;
    setLoading(true);
    await onComplete(quest.id);
    setLoading(false);
  };

  return (
    <div className={`p-4 border rounded ${completed ? "bg-green-900 opacity-75" : "bg-gray-800"}`}>
      <h3 className="text-lg font-semibold">{quest.name}</h3>
      <p>Trader: {quest.trader}</p>
      <p>Level: {quest.level}</p>
      <button
        disabled={completed || loading}
        onClick={handleClick}
        className={`mt-3 px-3 py-1 rounded ${
          completed ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {completed ? "Completed" : loading ? "..." : "Mark Complete"}
      </button>
    </div>
  );
}
