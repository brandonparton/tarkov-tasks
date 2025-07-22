"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

export interface Objective {
  description: string;
  count?: number;
  itemCount?: number;
  itemName?: string;
  iconUrl?: string;
}

import type { Quest } from "@/types/quest";

type ObjectiveWithUI = Quest["objectives"][number] & {
  count?: number;        // ✅ Add this
  itemCount?: number;
  itemName?: string;
  iconUrl?: string;
};

interface QuestWithUI extends Omit<Quest, "objectives"> {
  objectives: ObjectiveWithUI[];
}

interface QuestCardProps {
  quest: QuestWithUI;
  completed: boolean;
  onComplete: (quest: QuestWithUI) => void;
}

export default function QuestCard({
  quest,
  completed,
  onComplete,
}: QuestCardProps) {
  return (
    <div className="flex w-full bg-[#1A1C23] border border-[#2A2E35] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      {/* Left column */}
      <div className="w-64 bg-[#16191E] p-4 flex flex-col gap-2 border-r border-[#2A2E35]">
        <h2 className="text-lg font-bold text-[#C0D96F] leading-snug">
          {quest.name}
        </h2>
        <div className="text-sm text-gray-400 space-y-1">
          <div className="flex items-center gap-1">▶️ Level {quest.level}</div>
          <div className="flex items-center gap-1">🔒 {quest.requirements.length} prereqs</div>
          <div className="flex items-center gap-1">⚙️ Trader: {quest.trader}</div>
        </div>
        <a
          href={`https://escapefromtarkov.fandom.com/wiki/${encodeURIComponent(
            quest.name.replace(/ /g, "_")
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-sm text-[#C0D96F] hover:underline"
        >
          Wiki page
        </a>
      </div>

      {/* Middle column */}
      <div className="flex-1 p-4 space-y-2 text-sm">
        {quest.objectives.map((obj, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-gray-100">
              {obj.description}
              {obj.count != null && (
                <span className="ml-2 text-sm text-[#A3B36E]">({obj.count}×)</span>
              )}
            </span>
            {obj.iconUrl && obj.itemCount != null && (
              <div className="flex items-center gap-1 bg-[#0F1114] px-2 py-1 rounded border border-[#3A3D42]">
                <img
                  src={obj.iconUrl}
                  alt={obj.itemName}
                  className="h-5 w-5 rounded-sm border border-gray-600"
                />
                <span className="text-xs font-medium text-gray-200">
                  {obj.itemCount} {obj.itemName}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right column */}
      <div className="p-4 flex flex-col justify-center gap-2 bg-[#101214] border-l border-[#2A2E35]">
        <button
          onClick={() => onComplete(quest)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
            ${
              completed
                ? "bg-[#C0D96F] text-black hover:bg-[#B5CC63]"
                : "bg-[#1F2937] text-white hover:bg-[#2D3748]"
            }`}
        >
          <CheckIcon className="h-5 w-5" />
          {completed ? "Undo" : "Complete"}
        </button>
      </div>
    </div>
  );
}
