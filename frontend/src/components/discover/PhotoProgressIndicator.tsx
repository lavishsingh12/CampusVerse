"use client";

import React from "react";

interface PhotoProgressIndicatorProps {
  total: number;
  currentIndex: number;
}

export function PhotoProgressIndicator({ total, currentIndex }: PhotoProgressIndicatorProps) {
  if (total <= 1) return null;

  return (
    <div className="absolute top-3 left-0 right-0 z-30 px-3 flex gap-1.5 pointer-events-none">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className="h-1 flex-1 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm transition-all duration-300"
        >
          <div
            className={`h-full w-full rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                : index < currentIndex
                ? "bg-white/70"
                : "bg-transparent"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
