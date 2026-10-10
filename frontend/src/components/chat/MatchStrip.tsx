"use client";

import React from "react";
import { MatchProfile } from "../../types/chat";
import { HeartIcon } from "../common/Icons";

interface MatchStripProps {
  matches: MatchProfile[];
  onSelectMatch: (match: MatchProfile) => void;
}

export function MatchStrip({ matches, onSelectMatch }: MatchStripProps) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-2.5 pt-1 pb-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5">
        <h3 className="text-sm font-bold text-white tracking-tight">New Matches</h3>
        <span className="text-xs font-semibold text-[#B365FC]">
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>

      {/* Horizontal Strip */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar px-5 py-1">
        {/* Regular Match Avatars */}
        {matches.map((match) => {
          const initial = match.name.charAt(0).toUpperCase() || "?";
          return (
            <button
              key={match.id}
              type="button"
              onClick={() => onSelectMatch(match)}
              className="flex flex-col items-center gap-1.5 shrink-0 select-none group text-left cursor-pointer"
            >
              <div className="relative w-16 h-16 rounded-full p-0.5 ring-2 ring-[#B365FC]/40 group-hover:ring-[#B365FC] group-active:scale-95 transition-all">
                {match.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={match.avatar}
                    alt={match.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1e1738] border border-[#B365FC]/30 flex items-center justify-center text-lg font-bold text-[#E2C7FE]">
                    {initial}
                  </div>
                )}
                {/* Green Online status badge */}
                {match.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0B0C15] shadow-sm" />
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-200 truncate max-w-[64px] text-center">
                {match.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

