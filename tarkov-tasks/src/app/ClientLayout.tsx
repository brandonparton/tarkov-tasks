// src/app/ClientLayout.tsx
"use client";

import { ReactNode, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <>
      {/* transparent click‐through overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 p-4
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      {/* Main area pushed over */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${sidebarOpen ? "ml-64" : "ml-0"}
        `}
      >
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </>
  );
}
