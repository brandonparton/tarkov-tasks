// File: src/app/ClientLayout.tsx
"use client";

import { ReactNode, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  return (
    <div className="flex flex-1 h-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#0D0F15] border-r border-gray-800 text-gray-200 flex-none

          /* Mobile: fixed drawer */
          fixed inset-y-0 left-0 z-40 overflow-hidden transition-all duration-300
          ${sidebarOpen ? "w-60" : "w-0"}

          /* Desktop: static in-flow sidebar */
          md:static md:w-60 md:block
        `}
      >
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto bg-[#121318]">
          {children}
        </main>
      </div>
    </div>
  );
}
