// File: src/components/Header.tsx
"use client";

import { FC } from "react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { ProfileMenu } from "./ProfileMenu";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: FC<HeaderProps> = ({ onMenuClick }) => (
  <header
    className="relative z-50 flex items-center justify-between w-full
               bg-black/60 px-6 py-3 backdrop-blur-md border-b border-gray-700"
  >
    <div className="flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Toggle menu"
      >
        <Bars3Icon className="h-6 w-6 text-[#8FAF4F] hover:text-[#C0D96F]" />
      </button>
    </div>
    <div className="flex items-centery gap-4">
      <ProfileMenu />
    </div>
  </header>
);

export default Header;
