"use client";

import React from "react";
import { PlusIcon, ChevronRightIcon } from "../common/Icons";

interface MyPhotosSectionProps {
  photos: string[];
  onOpenManager: () => void;
}

export function MyPhotosSection({ photos, onOpenManager }: MyPhotosSectionProps) {
  const canAddMore = photos.length < 6;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight">My Photos</h3>
        <button
          type="button"
          onClick={onOpenManager}
          className="text-xs font-semibold text-[#B365FC] hover:text-[#d394ff] flex items-center gap-0.5 active:scale-95 transition-all"
        >
          <span>Edit Photos</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Photos Horizontal Scroll / Flex Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        {photos.map((url, idx) => {
          const isMain = idx === 0;
          return (
            <div
              key={`${url}-${idx}`}
              onClick={onOpenManager}
              className={`relative shrink-0 w-[78px] h-[104px] sm:w-[84px] sm:h-[112px] rounded-[18px] overflow-hidden bg-slate-900 border cursor-pointer group shadow-sm transition-all hover:scale-105 active:scale-95 ${
                isMain
                  ? "border-[#B365FC]/70 ring-1 ring-[#B365FC]/30 shadow-purple-900/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Main Badge on first photo */}
              {isMain && (
                <div className="absolute bottom-2 left-2">
                  <span className="px-1.5 py-0.5 rounded-full bg-[#B365FC] text-white text-[9px] font-bold shadow-md uppercase tracking-wider">
                    Main
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Photo Card (if under limit) */}
        {canAddMore && (
          <button
            type="button"
            onClick={onOpenManager}
            aria-label="Add new photo"
            className="shrink-0 w-[78px] h-[104px] sm:w-[84px] sm:h-[112px] rounded-[18px] border border-dashed border-white/20 hover:border-[#B365FC]/60 bg-[#14162B]/60 hover:bg-[#181B34] flex flex-col items-center justify-center gap-1.5 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <PlusIcon className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[10px] font-medium text-slate-300 group-hover:text-white">
              Add Photo
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
