// File: src/components/Sidebar.tsx
"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuestStore } from "../lib/zustand";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PresentationChartBarIcon,
  CubeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const primaryNav = [
  { href: "/dashboard", label: "Home", icon: <HomeIcon className="h-6 w-6" /> },
  { href: "/tasks/current", label: "Tasks", icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
  { href: "/tasks/flow", label: "Task Flowchart", icon: <CubeIcon className="h-6 w-6" /> },
  { href: "/settings", label: "Settings", icon: <Cog6ToothIcon className="h-6 w-6" /> },
];

const externalLinks = [
  { href: "https://tarkov.dev", label: "Tarkov.dev", icon: <ChevronRightIcon className="h-5 w-5" /> },
  { href: "https://ratscanner.com", label: "Rat Scanner", icon: <ChevronRightIcon className="h-5 w-5" /> },
  { href: "https://tarkov.guru", label: "Tarkov Guru", icon: <ChevronRightIcon className="h-5 w-5" /> },
  { href: "https://tarkovchanges.com", label: "Tarkov Changes", icon: <ChevronRightIcon className="h-5 w-5" /> },
];

const Sidebar: FC = () => {
  const path = usePathname();
  const { data: session, status } = useSession();
  const { level, setLevel } = useQuestStore();
  const [profileOpen, setProfileOpen] = useState(false);

  // load persisted level on auth
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/level")
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.level === "number") {
            setLevel(d.level);
          }
        });
    }
  }, [status, setLevel]);

  // helper to persist to server
  const persistLevel = async (newLevel: number) => {
    if (status !== "authenticated") return;
    try {
      await fetch("/api/user/level", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      });
    } catch (e) {
      console.error("Failed to persist level:", e);
    }
  };

  const inc = () => {
    const next = Math.min(100, level + 1);
    setLevel(next);
    persistLevel(next);
  };
  const dec = () => {
    const next = Math.max(1, level - 1);
    setLevel(next);
    persistLevel(next);
  };
  const toggleProfile = () => setProfileOpen((o) => !o);

  return (
    <div className="h-full flex flex-col bg-[#0D0F15] text-gray-200">
      {/* Branding */}
      <div className="py-4 flex flex-col items-center px-4">
        <img src="/logo.png" alt="TarkovTasks Logo" className="h-16 w-16 mb-2 rounded-full" />
        <span className="text-xl font-bold text-[#C0D96F]">TarkovTasks</span>
      </div>

      {/* Profile */}
      <div className="px-4 mb-4">
        <button
          onClick={toggleProfile}
          className="w-full flex items-center justify-between bg-black/40 px-3 py-2 rounded-md hover:bg-black/60 transition"
        >
          <div className="flex items-center gap-2">
            {session?.user.image ? (
              <img src={session.user.image} alt={session.user.name!} className="h-8 w-8 rounded-full" />
            ) : (
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            )}
            <span className="truncate">{session?.user.name ?? "Guest"}</span>
          </div>
          <ChevronDownIcon className={`h-5 w-5 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
        </button>
        {profileOpen && session && (
          <button onClick={() => signOut()} className="mt-2 w-full text-left px-3 py-2 bg-black/30 rounded-md hover:bg-black/50 transition">
            Sign out
          </button>
        )}
      </div>

      {/* Level Control */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
          <span>Level</span>
        </div>
        <div className="flex items-center bg-black/40 rounded-md overflow-hidden">
          <button onClick={dec} className="px-3 py-2 hover:bg-black/60 transition">
            <ChevronDownIcon className="h-5 w-5" />
          </button>
          <span className="flex-1 text-center text-lg font-medium">{level}</span>
          <button onClick={inc} className="px-3 py-2 hover:bg-black/60 transition">
            <ChevronUpIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-2 overflow-auto">
        <ul className="space-y-1">
          {primaryNav.map(({ href, label, icon }) => {
            const active = path === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition ${
                    active ? "bg-[#8FAF4F]/20 text-[#C0D96F]" : "hover:bg-black/60"
                  }`}
                >
                  {icon}
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* External Links */}
      <hr className="border-gray-800 my-4" />
      <div className="px-2 pb-4 overflow-auto">
        <ul className="space-y-2">
          {externalLinks.map(({ href, label, icon }) => (
            <li key={href}>
              <Link href={href} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-black/60 transition">
                {icon}
                <span className="text-sm text-gray-200">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
