// File: src/components/ProfileMenu.tsx
"use client";

import { FC, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export const ProfileMenu: FC = () => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        open &&
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // If still checking auth, show nothing
  if (status === "loading") return null;

  // If signed out, render a simple sign-in button
  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Sign in"
      >
        <UserCircleIcon className="h-8 w-8 text-gray-300" />
      </button>
    );
  }

  // Otherwise, render avatar + dropdown
  // Compute positioning
  const rect = buttonRef.current?.getBoundingClientRect();
  const menuWidth = 200;
  const style: React.CSSProperties = { width: menuWidth };
  if (rect) {
    const desiredLeft = rect.left;
    const maxLeft = window.innerWidth - menuWidth - 8;
    style.left = Math.min(desiredLeft, maxLeft);
    style.top = rect.bottom + window.scrollY;
  } else {
    style.top = 48;
    style.right = 16;
  }

  const dropdown = (
    <div
      ref={menuRef}
      className="absolute bg-gray-800 rounded shadow-lg ring-1 ring-black/30 z-[1000]"
      style={style}
    >
      <div className="py-2 px-4 border-b border-gray-700">
        <p className="text-sm font-medium text-white truncate">
          {session.user.name || session.user.email}
        </p>
        {session.user.email && (
          <p className="text-xs text-gray-400 truncate">
            {session.user.email}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => signOut()}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
      >
        Sign out
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="User menu"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || session.user.email || "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-gray-300" />
        )}
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-300 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && createPortal(dropdown, document.body)}
    </>
  );
};
