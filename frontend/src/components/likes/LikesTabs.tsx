"use client";

import React from "react";

export type LikesTabType = "likes" | "you-liked";

interface LikesTabsProps {
  activeTab: LikesTabType;
  onChangeTab: (tab: LikesTabType) => void;
}

export function LikesTabs({ activeTab, onChangeTab }: LikesTabsProps) {
  return (
    <div className="w-full border-b border-white/[0.08] px-4 pt-1 select-none shrink-0">
      <div className="flex items-center justify-center">
        {/* Likes Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("likes")}
          className="flex-1 max-w-[160px] pb-2.5 pt-1 flex flex-col items-center justify-center relative group"
        >
          <span
            className={`text-sm tracking-tight transition-colors ${
              activeTab === "likes"
                ? "text-white font-bold"
                : "text-slate-400 font-medium group-hover:text-slate-200"
            }`}
          >
            Likes
          </span>
          {activeTab === "likes" && (
            <span className="absolute bottom-0 inset-x-2 h-[2.5px] bg-gradient-to-r from-[#9B42F6] via-[#B365FC] to-[#E93C9A] rounded-full shadow-[0_0_8px_rgba(179,101,252,0.6)]" />
          )}
        </button>

        {/* Subtle Divider */}
        <div className="h-4 w-[1px] bg-white/15 shrink-0" />

        {/* You Liked Tab */}
        <button
          type="button"
          onClick={() => onChangeTab("you-liked")}
          className="flex-1 max-w-[160px] pb-2.5 pt-1 flex flex-col items-center justify-center relative group"
        >
          <span
            className={`text-sm tracking-tight transition-colors ${
              activeTab === "you-liked"
                ? "text-white font-bold"
                : "text-slate-400 font-medium group-hover:text-slate-200"
            }`}
          >
            You Liked
          </span>
          {activeTab === "you-liked" && (
            <span className="absolute bottom-0 inset-x-2 h-[2.5px] bg-gradient-to-r from-[#9B42F6] via-[#B365FC] to-[#E93C9A] rounded-full shadow-[0_0_8px_rgba(179,101,252,0.6)]" />
          )}
        </button>
      </div>
    </div>
  );
}
