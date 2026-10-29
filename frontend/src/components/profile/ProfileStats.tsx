"use client";

import React from "react";
import { UserProfileStats } from "../../data/mockUserProfile";
import { HeartIcon, UsersIcon, EyeIcon, ChevronRightIcon } from "../common/Icons";

interface ProfileStatsProps {
  stats: UserProfileStats;
  onCompletenessClick?: () => void;
}

export function ProfileStats({ stats, onCompletenessClick }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2 w-full">
      {/* 1. Likes Left Today */}
      <div className="rounded-[18px] bg-[#14162B] border border-white/[0.07] p-3 flex items-center gap-2.5 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-pink-500/15 text-[#E93C9A] flex items-center justify-center shrink-0">
          <HeartIcon className="w-4 h-4 fill-current" filled={true} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
            {stats.likesRemaining} / {stats.maxLikes}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
            Likes Left
          </span>
        </div>
      </div>

      {/* 2. Profile Views */}
      <div className="rounded-[18px] bg-[#14162B] border border-white/[0.07] p-3 flex items-center gap-2.5 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-[#B365FC]/15 text-[#B365FC] flex items-center justify-center shrink-0">
          <UsersIcon className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
            {stats.profileViews}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
            Profile Views
          </span>
        </div>
      </div>

      {/* 3. Profile Completeness */}
      <button
        type="button"
        onClick={onCompletenessClick}
        aria-label="View profile completeness details"
        className="rounded-[18px] bg-[#14162B] border border-white/[0.07] p-3 flex items-center justify-between gap-1.5 shadow-sm hover:border-[#B365FC]/40 active:scale-95 transition-all text-left group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
            <EyeIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
              {stats.completeness}%
            </span>
            <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
              Completeness
            </span>
          </div>
        </div>
        <ChevronRightIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
      </button>
    </div>
  );
}
