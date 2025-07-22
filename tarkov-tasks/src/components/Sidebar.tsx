// src/components/Sidebar.tsx
"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuestStore } from "../lib/zustand";
import {
  ClipboardDocumentListIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
  { href: "/tasks/current", label: "Current Tasks", icon: <ChartPieIcon className="h-5 w-5" /> },
  { href: "/tasks/all", label: "All Tasks", icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

const Sidebar: FC = () => {
  const { data: session, status } = useSession();
  const { level, setLevel } = useQuestStore();

  // local loading flag for initial fetch
  const [loading, setLoading] = useState(true);

  // on mount (and when auth status changes), load saved level
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/level")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.level === "number") {
            setLevel(data.level);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [status, setLevel]);

  const handleLevelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(e.target.value, 10) || 1;
    setLevel(newLevel);
    if (status === "authenticated") {
      await fetch("/api/user/level", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      });
    }
  };

  return (
    <nav className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="mb-6 flex items-center justify-center">
        <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
      </div>

      {/* Level picker */}
      <div className="px-4 mb-8">
        <label className="block text-sm font-medium text-gray-400 mb-1">
          PMC Level
        </label>
        {loading ? (
          <div className="h-8 bg-gray-700 rounded animate-pulse" />
        ) : (
          <input
            type="number"
            min={1}
            value={level}
            onChange={handleLevelChange}
            className="w-full bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8FAF4F]"
          />
        )}
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 space-y-2 px-2">
        {links.map(({ href, label, icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto px-4 py-4 border-t border-gray-700">
        <Link
          href="https://tarkov.dev"
          target="_blank"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Tarkov.dev
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;
