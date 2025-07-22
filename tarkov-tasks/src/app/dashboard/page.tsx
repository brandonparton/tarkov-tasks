// File: src/app/dashboard/page.tsx
"use client";

import React from "react";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const stats = [
    { label: "Tasks Done", value: 90, unit: "/480", gradient: "from-[#6B8E23]/70 to-[#2D2D2D]/90" },
    { label: "Currently Active", value: 8, gradient: "from-[#2D2D2D]/90 to-[#1F2937]/95" },
    { label: "Tasks Left for Kappa", value: 20, gradient: "from-[#556B2F]/70 to-[#6B8E23]/70" },
  ];

  const actions = [
    { label: "New Task", icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
    { label: "View Flow", icon: <ChartPieIcon className="h-6 w-6" /> },
    { label: "Settings", icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  const feed = [
    { time: "Just now", text: "Auto-imported wipe update from dev API." },
    { time: "2h ago", text: "Completed Quest: “Deep Recon”." },
    { time: "Yesterday", text: "Added 5 shared items to your list." },
  ];

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background image + dark blur overlay */}
      <div
        className="absolute inset-0 bg-center bg-cover filter blur-sm"
        style={{ backgroundImage: 'url("/background.jpg")' }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Dashboard content */}
      <main className="relative z-10 flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto bg-black/50 backdrop-blur-lg rounded-2xl p-6 space-y-6">
          {/* Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`relative rounded-xl bg-gradient-to-br ${s.gradient} p-6 shadow-2xl`}
              >
                <ChartPieIcon className="absolute top-4 right-4 h-8 w-8 text-white opacity-15" />
                <div className="text-sm font-medium opacity-90">{s.label}</div>
                <div className="mt-2 text-3xl font-bold">
                  {s.value}
                  {s.unit && (
                    <span className="text-lg font-normal opacity-80">{s.unit}</span>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Quick Actions */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {actions.map((a) => (
              <button
                key={a.label}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#8FAF4F] bg-black/40 px-4 py-3 font-medium text-[#8FAF4F] hover:bg-black/60 transition"
              >
                {a.icon}
                <span>{a.label}</span>
              </button>
            ))}
          </section>

          {/* Activity Feed */}
          <section className="rounded-xl bg-black/40 p-6 shadow-lg">
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
        </div>
      </main>
    </div>
  );
}
