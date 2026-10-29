"use client";

import React from "react";
import { Profile } from "../../types/profile";
import { BlueVerifiedBadge } from "../common/Icons";
import { VerificationBadge } from "./VerificationBadge";
import { MatchBadge } from "./MatchBadge";
import { Icebreaker } from "./Icebreaker";

interface ProfileInfoProps {
  profile: Profile;
}

/**
 * On-photo overlay:
 * Unobstructed, clean, minimal overlay showing ONLY:
 * - First initial + age
 * - Degree / year / branch
 * - Student Verified badge
 * - Match percentage badge
 */
export function ProfilePhotoOverlay({ profile }: ProfileInfoProps) {
  return (
    <div className="w-full flex flex-col gap-2 z-20 pointer-events-auto">
      {/* Name, Age, Verification */}
      <div className="flex items-center gap-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
          {profile.name} <span className="font-bold">{profile.age}</span>
        </h2>
        {profile.isVerified && <BlueVerifiedBadge className="w-5 h-5 drop-shadow-md" />}
      </div>

      {/* Degree, Year, Branch */}
      <p className="text-sm font-medium text-slate-200 drop-shadow">
        {profile.degree} • {profile.year} • {profile.branch}
      </p>

      {/* Verification & Match Percentage Badges */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <VerificationBadge />
        {profile.matchPercentage !== undefined && (
          <MatchBadge percentage={profile.matchPercentage} />
        )}
      </div>
    </div>
  );
}

/**
 * Below-photo scrollable content:
 * Contains:
 * - Interests
 * - Hobbies
 * - Icebreaker(s)
 */
export function ProfileDetailsBelowPhoto({ profile }: ProfileInfoProps) {
  return (
    <div className="w-full flex flex-col gap-4 z-20 pointer-events-auto">
      {/* Interests & Hobbies Section */}
      {profile.tags && profile.tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Interests &amp; Hobbies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.tags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181B30] border border-white/10 text-white text-xs font-medium backdrop-blur-md shadow-sm"
              >
                <span className="text-sm leading-none">{tag.emoji}</span>
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Icebreaker Section */}
      {profile.icebreakers && profile.icebreakers.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Campus Icebreaker
          </span>
          {profile.icebreakers.map((icebreaker, idx) => (
            <Icebreaker
              key={idx}
              prompt={icebreaker.prompt}
              text={icebreaker.text}
            />
          ))}
        </div>
      )}
    </div>
  );
}
