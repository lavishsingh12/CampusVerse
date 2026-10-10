"use client";

import React from "react";
import { UserProfile } from "../../data/mockUserProfile";
import { BlueVerifiedBadge, EditPencilIcon, StudentCapIcon } from "../common/Icons";

interface ProfileHeroCardProps {
  profile: UserProfile;
  onEditAvatar?: () => void;
  onEditProfile?: () => void;
}

export function ProfileHeroCard({
  profile,
  onEditAvatar,
  onEditProfile,
}: ProfileHeroCardProps) {
  const mainPhoto = profile.photos[0];
  const initial = profile.name.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden bg-gradient-to-br from-[#181B34] via-[#14162B] to-[#101222] border border-white/[0.09] shadow-xl p-4 sm:p-5">
      {/* Background Architectural campus silhouette accent */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2/5 opacity-10 pointer-events-none bg-no-repeat bg-right-top bg-contain"
        style={{
          backgroundImage: `radial-gradient(circle at right top, rgba(179, 101, 252, 0.35), transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3.5">
        <div className="flex items-start gap-4">
          {/* Circular Avatar with Edit Pencil Badge */}
          <div className="relative shrink-0">
            <div className="w-[84px] h-[84px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#9B42F6] via-[#B365FC] to-[#E93C9A] shadow-md shadow-purple-500/20">
              {mainPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainPhoto}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1b1735] flex items-center justify-center text-2xl font-bold text-[#E2C7FE]">
                  {initial}
                </div>
              )}
            </div>

            {/* Edit Avatar Pencil Button */}
            <button
              type="button"
              onClick={onEditAvatar}
              aria-label="Change profile photo"
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] text-white flex items-center justify-center border-2 border-[#121424] shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              <EditPencilIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {profile.name}, {profile.age}
              </h2>
              {profile.isVerified && <BlueVerifiedBadge className="w-4 h-4 shrink-0" />}
            </div>

            <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
              {profile.degree} • {profile.year} • {profile.branch}
            </p>

            <p className="text-xs text-slate-400 font-normal truncate mt-0.5">
              {profile.university}
            </p>

            {/* Student Verified Pill */}
            {profile.isStudentVerified && (
              <div className="mt-2 inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold shadow-sm">
                <StudentCapIcon className="w-3 h-3 text-emerald-400" />
                <span>Student Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Short Bio Quote */}
        {profile.bio && (
          <div
            onClick={onEditProfile}
            className="cursor-pointer group rounded-xl p-2.5 -mx-1 hover:bg-white/[0.03] transition-colors"
          >
            <p className="text-xs text-slate-300 font-normal italic leading-relaxed line-clamp-2">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
