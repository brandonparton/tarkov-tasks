// File: src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useQuestStore, Quest } from "@/lib/zustand";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { allQuests, setAllQuests } = useQuestStore();
  const { status } = useSession();

  const [progressIds, setProgressIds] = useState<Set<string>>(new Set());
  const [feed, setFeed] = useState<{ time: string; text: string }[]>([]);

  // 1) Load all quests once into Zustand
  useEffect(() => {
    async function loadQuests() {
      const res = await fetch("/api/quests");
      const qs: Quest[] = await res.json();
      setAllQuests(qs);
    }
    loadQuests();
  }, [setAllQuests]);

  // 2) Load user progress & activity feed
  useEffect(() => {
    async function loadProgress() {
      if (status === "authenticated") {
        const res = await fetch("/api/progress");
        const ids: string[] = await res.json();
        setProgressIds(new Set(ids));
      }
    }
    async function loadFeed() {
      const res = await fetch("/api/feed");
      const data: { time: string; text: string }[] = await res.json();
      setFeed(data);
    }
    loadProgress();
    loadFeed();
  }, [status]);

  // Stats calculations
  const done = allQuests.filter((q) => progressIds.has(q.id)).length;

  const current = allQuests.filter(
    (q) =>
      !progressIds.has(q.id) &&
      (q.traderRequirements?.length ?? 0) === 0 &&
      q.level <= useQuestStore.getState().level &&
      q.requirements.every((r) => progressIds.has(r.id))
  );

  const active = current.length;

  const total = allQuests.length;

  const kappaTasks = allQuests.filter((q) => q.kappaRequired);
  const doneKappa = kappaTasks.filter((q) => progressIds.has(q.id)).length;
  const totalKappa = kappaTasks.length;
  const percentKappa = totalKappa > 0 ? Math.round((doneKappa / totalKappa) * 100) : 0;

  const stats = [
    {
      label: "Tasks Done",
      value: done,
      unit: `/${total}`,
      gradient: "from-[#6B8E23]/70 to-[#2D2D2D]/90",
    },
    {
      label: "Currently Active",
      value: active,
      unit: "",
      gradient: "from-[#2D2D2D]/90 to-[#1F2937]/95",
    },
    {
      label: "Tasks for Kappa",
      value: doneKappa,
      unit: `/${totalKappa}`,
      gradient: "from-[#556B2F]/70 to-[#6B8E23]/70",
    },
  ];

  return (
    <div className="relative h-full overflow-hidden">
      {/* background + dark overlay */}
      <div
        className="absolute inset-0 bg-center bg-cover filter blur-sm"
        style={{ backgroundImage: 'url("/background.jpg")' }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* content (beneath the layout’s Header) */}
      <main className="relative z-10 flex flex-col h-full text-gray-100 p-6 space-y-6">
        {/* Stats cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`relative rounded-xl bg-gradient-to-br ${s.gradient} p-6 shadow-2xl`}
            >
              <ChartPieIcon className="absolute top-4 right-4 h-8 w-8 opacity-15 text-white" />
              <div className="text-sm font-medium opacity-90">{s.label}</div>
              <div className="mt-2 text-3xl font-bold">
                {s.value}
                {s.unit && (
                  <span className="text-lg font-normal opacity-80">
                    {s.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>


        {/* Activity Feed */}
        <section className="rounded-xl bg-black/40 p-6 shadow-lg flex-1 overflow-auto">
          <h2 className="mb-4 text-xl font-semibold text-[#C0D96F]">
            Activity Feed
          </h2>
          <ul className="space-y-3 text-gray-200">
            {feed.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <ClockIcon className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm opacity-75">{item.time}</div>
                  <div>{item.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
