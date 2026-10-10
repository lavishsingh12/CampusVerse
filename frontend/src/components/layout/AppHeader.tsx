"use client";

import React from "react";
import { CampusVerseLogo, FilterSlidersIcon, ProfileAvatarIcon } from "../common/Icons";

interface AppHeaderProps {
  onFilterClick?: () => void;
  onProfileClick?: () => void;
}

export function AppHeader({ onFilterClick, onProfileClick }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-2.5 z-40 select-none shrink-0">
      <CampusVerseLogo />

      <div className="flex items-center space-x-3 text-slate-300">
        <button
          type="button"
          aria-label="Discovery Preferences & Filters"
          onClick={onFilterClick}
          className="p-1.5 rounded-full hover:text-white active:scale-95 transition-all text-slate-300 hover:bg-white/5"
        >
          <FilterSlidersIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="User Account"
          onClick={onProfileClick}
          className="p-1.5 rounded-full hover:text-white active:scale-95 transition-all text-slate-300 hover:bg-white/5"
        >
          <ProfileAvatarIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
