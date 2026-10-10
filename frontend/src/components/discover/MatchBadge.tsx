"use client";

import React from "react";
import { HeartIcon } from "../common/Icons";

interface MatchBadgeProps {
  percentage: number;
  className?: string;
}

export function MatchBadge({ percentage, className = "" }: MatchBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-950/40 text-pink-400 text-xs font-semibold tracking-tight shadow-sm select-none ${className}`}
    >
      <HeartIcon className="w-3.5 h-3.5 fill-pink-500 text-pink-500" filled={true} />
      <span>{percentage}% Match</span>
    </div>
  );
}
