"use client";

import React, { useState, useCallback, useRef } from "react";
import { Profile } from "../../types/profile";
import { ProfileCard } from "../discover/ProfileCard";
import { ProfileActions } from "../discover/ProfileActions";
import { BackIcon, HeartIcon } from "../common/Icons";
import { ExploreCategory } from "../../data/mockExplore";

interface ExploreProfileBrowserProps {
  category: ExploreCategory;
  profiles: Profile[];
  onBack: () => void;
}

export function ExploreProfileBrowser({
  category,
  profiles: initialProfiles,
  onBack,
}: ExploreProfileBrowserProps) {
  const [profiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<number[]>([]);
  const [, setLikedIds] = useState<string[]>([]);
  const [, setPassedIds] = useState<string[]>([]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const actionDirRef = useRef<"left" | "right" | null>(null);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const currentPhotoIndex = currentProfile ? photoIndices[currentProfile.id] || 0 : 0;

  const handleNextPhoto = useCallback(() => {
    if (!currentProfile) return;
    const max = currentProfile.photos.length - 1;
    setPhotoIndices((prev) => ({
      ...prev,
      [currentProfile.id]: currentPhotoIndex < max ? currentPhotoIndex + 1 : 0,
    }));
  }, [currentProfile, currentPhotoIndex]);

  const handlePrevPhoto = useCallback(() => {
    if (!currentProfile) return;
    const max = currentProfile.photos.length - 1;
    setPhotoIndices((prev) => ({
      ...prev,
      [currentProfile.id]: currentPhotoIndex > 0 ? currentPhotoIndex - 1 : max,
    }));
  }, [currentProfile, currentPhotoIndex]);

  const handleAction = useCallback((dir: "left" | "right") => {
    actionDirRef.current = dir;
    setIsAnimating(true);
  }, []);

  const handleExitComplete = useCallback(() => {
    const dir = actionDirRef.current ?? "right";
    const current = profiles[currentIndex];

    if (current) {
      if (dir === "right") {
        setLikedIds((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
      } else {
        setPassedIds((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
      }
      setHistory((prev) => [...prev, currentIndex]);
    }

    setExitDirection(null);
    actionDirRef.current = null;
    setIsAnimating(false);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, profiles]);

  const handlePassClick = useCallback(() => {
    if (isAnimating || exitDirection !== null || currentIndex >= profiles.length) return;
    setIsAnimating(true);
    actionDirRef.current = "left";
    setExitDirection("left");
  }, [isAnimating, exitDirection, currentIndex, profiles.length]);

  const handleLikeClick = useCallback(() => {
    if (isAnimating || exitDirection !== null || currentIndex >= profiles.length) return;
    setIsAnimating(true);
    actionDirRef.current = "right";
    setExitDirection("right");
  }, [isAnimating, exitDirection, currentIndex, profiles.length]);

  const handleRewindClick = useCallback(() => {
    if (isAnimating || exitDirection !== null || history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    const restoredProfile = profiles[lastIndex];
    if (restoredProfile) {
      setLikedIds((prev) => prev.filter((id) => id !== restoredProfile.id));
      setPassedIds((prev) => prev.filter((id) => id !== restoredProfile.id));
    }
    setCurrentIndex(lastIndex);
  }, [isAnimating, exitDirection, history, profiles]);

  const handleReset = () => {
    setCurrentIndex(0);
    setHistory([]);
    setLikedIds([]);
    setPassedIds([]);
    setPhotoIndices({});
    setExitDirection(null);
    setIsAnimating(false);
    actionDirRef.current = null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category Header with Back Button */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Explore"
          className="w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-bold text-white tracking-tight truncate">
            {category.title}
          </h2>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {category.memberCount} members · Browse profiles
          </p>
        </div>
      </div>

      {/* Profile Card Deck — same layout as DiscoverScreen */}
      <div className="flex-1 flex flex-col justify-between px-3.5 pb-2 pt-0 overflow-hidden relative">
        <div className="relative flex-1 w-full min-h-[440px] max-h-[640px] my-auto">
          {currentProfile ? (
            <>
              {/* Background: next card */}
              {nextProfile && (
                <div className="absolute inset-0 pointer-events-none">
                  <ProfileCard
                    key={`bg-${nextProfile.id}`}
                    profile={nextProfile}
                    currentPhotoIndex={photoIndices[nextProfile.id] || 0}
                    onNextPhoto={() => {}}
                    onPrevPhoto={() => {}}
                    isTopCard={false}
                  />
                </div>
              )}

              {/* Foreground: active card */}
              <div className="absolute inset-0">
                <ProfileCard
                  key={`fg-${currentProfile.id}`}
                  profile={currentProfile}
                  currentPhotoIndex={currentPhotoIndex}
                  onNextPhoto={handleNextPhoto}
                  onPrevPhoto={handlePrevPhoto}
                  onAction={handleAction}
                  onExitComplete={handleExitComplete}
                  exitDirection={exitDirection}
                  isTopCard={true}
                />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="w-full h-full rounded-[28px] bg-[#121424]/90 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
                <HeartIcon className="w-8 h-8 text-white fill-white" filled={true} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                You&apos;ve seen all profiles in {category.title}!
              </h3>
              <p className="text-sm text-slate-300 max-w-xs mb-6 leading-relaxed">
                Check back soon as more students join this category.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                Browse Again
              </button>
            </div>
          )}
        </div>

        {/* Like / Pass / Rewind Buttons — identical layout to Discover */}
        <ProfileActions
          onRewind={handleRewindClick}
          onPass={handlePassClick}
          onLike={handleLikeClick}
          canRewind={history.length > 0 && !isAnimating}
        />
      </div>
    </div>
  );
}
