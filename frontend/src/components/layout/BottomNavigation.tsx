"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DiscoverNavIcon,
  ExploreNavIcon,
  LikesNavIcon,
  ChatsNavIcon,
  ProfileNavIcon,
} from "../common/Icons";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: "discover",
      label: "Discover",
      href: "/",
      icon: (active) => <DiscoverNavIcon className={`w-5 h-5 ${active ? "text-[#B365FC]" : "text-slate-400"}`} active={active} />,
    },
    {
      id: "explore",
      label: "Explore",
      href: "/explore",
      icon: (active) => <ExploreNavIcon className={`w-5 h-5 ${active ? "text-[#B365FC]" : "text-slate-400"}`} />,
    },
    {
      id: "likes",
      label: "Likes",
      href: "/likes",
      icon: (active) => <LikesNavIcon className={`w-5 h-5 ${active ? "text-[#B365FC]" : "text-slate-400"}`} active={active} />,
    },
    {
      id: "chats",
      label: "Chat",
      href: "/chats",
      icon: (active) => <ChatsNavIcon className={`w-5 h-5 ${active ? "text-[#B365FC]" : "text-slate-400"}`} active={active} />,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: (active) => <ProfileNavIcon className={`w-5 h-5 ${active ? "text-[#B365FC]" : "text-slate-400"}`} />,
    },
  ];

  return (
    <nav className="w-full bg-[#0B0C15]/95 backdrop-blur-md border-t border-white/[0.06] px-3 pt-2 pb-1.5 z-40 select-none shrink-0">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/discover"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-[#B365FC] font-semibold"
                  : "text-slate-400 hover:text-slate-200 font-normal"
              }`}
            >
              <div className="relative">
                {item.icon(isActive)}
                {/* Subtle active glow dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#B365FC] rounded-full shadow-[0_0_8px_#B365FC]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? "text-[#B365FC]" : "text-slate-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
