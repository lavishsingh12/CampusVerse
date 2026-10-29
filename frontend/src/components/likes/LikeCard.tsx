"use client";

import React from "react";
import { LikeItem } from "../../lib/likes";
import { resolveApiMediaUrl } from "../../lib/api";

interface LikeCardProps {
  item: LikeItem;
  isBlurred?: boolean;
}

export function LikeCard({ item, isBlurred = false }: LikeCardProps) {
  const profile = item.profile;
  const photos = (profile.photos || []).sort((a, b) => a.position - b.position);
  const firstPhoto = photos.length > 0 ? resolveApiMediaUrl(photos[0].url) : "";

  const initial =
    profile.display_name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .slice(0, 2) + ".";

  return (
    <div className="relative rounded-[22px] overflow-hidden aspect-[3/4] bg-[#121424] border border-white/[0.08] shadow-lg select-none group">
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
        {firstPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={firstPhoto}
            alt={isBlurred ? "Blurred profile" : `${initial}, ${profile.age}`}
            className={`w-full h-full object-cover object-center transition-transform duration-500 ${isBlurred
                ? "blur-xl scale-125 saturate-150 contrast-125 brightness-90"
                : "group-hover:scale-105"
              }`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500">
            👤
          </div>
        )}

        {/* Heavy frost layer for unrecognizable blur if Likes tab */}
        {isBlurred && (
          <div className="absolute inset-0 bg-[#0B0C15]/25 backdrop-blur-md" />
        )}
      </div>

      {/* Bottom Gradient Overlay for Typography Legibility */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0C15] via-[#0B0C15]/85 to-transparent pt-16 pb-3 px-3 flex flex-col justify-end pointer-events-none z-10">
        {/* Name & Age */}
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight drop-shadow">
          {initial}, {profile.age}
        </h3>

        {/* Degree • Year • Branch */}
        <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5 drop-shadow-sm">
          {profile.degree} • {profile.year} • {profile.branch}
        </p>
      </div>
    </div>
  );
}
