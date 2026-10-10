"use client";

import React from "react";
import { ExploreCategory } from "../../data/mockExplore";
import { ChevronRightIcon } from "../common/Icons";

interface ExploreCategoryCardProps {
  category: ExploreCategory;
  onClick: () => void;
}

export function ExploreCategoryCard({ category, onClick }: ExploreCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Browse ${category.title}`}
      className="relative w-full rounded-[22px] overflow-hidden aspect-[1.38/1] group text-left active:scale-[0.98] transition-all duration-200 shadow-md border border-white/10"
    >
      {/* Background imagery with subtle natural visual composition */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.bgImage}
        alt={category.title}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />

      {/* Primary directional gradient from bottom-left to top-right matching reference atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${category.gradientFrom}D9 0%, ${category.gradientTo}70 55%, rgba(15, 23, 42, 0.35) 100%)`,
        }}
      />

      {/* Dark gradient for crisp text legibility at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Text content — bottom aligned matching reference exactly */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug drop-shadow-sm">
          {category.title}
        </h3>
        <p className="text-[11px] text-white/80 font-normal leading-tight mt-0.5 line-clamp-2 drop-shadow-sm">
          {category.tagline}
        </p>
        <span className="text-[10px] text-white/70 font-medium mt-2">
          {category.memberCount} members
        </span>
      </div>

      {/* Circular Arrow button in top right exactly as shown in reference */}
      <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:bg-white/40 transition-colors shadow-sm">
        <ChevronRightIcon className="w-3.5 h-3.5 text-white stroke-[2.5]" />
      </div>
    </button>
  );
}
