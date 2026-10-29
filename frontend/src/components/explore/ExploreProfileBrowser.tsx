
"use client";

import React, { useState, useCallback, useRef } from "react";

import { Profile } from "../../types/profile";
import { ProfileCard } from "../discover/ProfileCard";
import { ProfileActions } from "../discover/ProfileActions";
import { MessageComposerModal } from "../discover/MessageComposerModal";
import { BackIcon, HeartIcon } from "../common/Icons";
import { ExploreCategory } from "../../data/mockExplore";
import { createAction, rewindLastAction } from "../../lib/discover";
import { getAccessToken } from "../../lib/token";

interface ExploreProfileBrowserProps {
  category: ExploreCategory;
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export function ExploreProfileBrowser({
  category,
  profiles,
  loading,
  error,
  onBack,
}: ExploreProfileBrowserProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<number[]>([]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isActionSaving, setIsActionSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const actionDirRef = useRef<"left" | "right" | null>(null);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const currentPhotoIndex = currentProfile
    ? photoIndices[currentProfile.id] || 0
    : 0;

  const recipientDisplayName =
    currentProfile?.displayName || currentProfile?.name || "Student";

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
    const direction = actionDirRef.current ?? "right";
    const current = profiles[currentIndex];

    if (current) {
      setHistory((previous) => [...previous, currentIndex]);

      if (category.id !== "blinddate") {
        const token = getAccessToken();

        if (!token) {
          setFeedback("Please log in to save this action.");
        } else {
          setIsActionSaving(true);

          void createAction(
            Number(current.id),
            direction === "right" ? "like" : "pass",
            token
          )
            .then((result) => {
              if (result.match_created) {
                setFeedback("It's a Match! Chat is now open.");
              }
            })
            .catch((reason: unknown) => {
              setFeedback(
                reason instanceof Error
                  ? reason.message
                  : "Could not save this action."
              );
            })
            .finally(() => setIsActionSaving(false));
        }
      }
    }

    setExitDirection(null);
    actionDirRef.current = null;
    setIsAnimating(false);
    setCurrentIndex((previous) => previous + 1);
  }, [category.id, currentIndex, profiles]);

  const handlePassClick = useCallback(() => {
    if (
      isAnimating ||
      exitDirection !== null ||
      currentIndex >= profiles.length
    ) {
      return;
    }

    setIsAnimating(true);
    actionDirRef.current = "left";
    setExitDirection("left");
  }, [isAnimating, exitDirection, currentIndex, profiles.length]);

  const handleLikeClick = useCallback(() => {
    if (
      isAnimating ||
      exitDirection !== null ||
      currentIndex >= profiles.length
    ) {
      return;
    }

    setIsAnimating(true);
    actionDirRef.current = "right";
    setExitDirection("right");
  }, [isAnimating, exitDirection, currentIndex, profiles.length]);

  // Open the existing message-request composer.
  const handleMessageClick = useCallback(() => {
    if (
      !currentProfile ||
      isAnimating ||
      isActionSaving ||
      exitDirection !== null
    ) {
      return;
    }

    if (currentProfile.userId == null) {
      setFeedback("Unable to identify this student's account. Please try again.");
      return;
    }

    setFeedback(null);
    setIsComposerOpen(true);
  }, [currentProfile, isAnimating, isActionSaving, exitDirection]);

  // Called only after the existing API successfully creates the request.
  const handleMessageSuccess = useCallback(() => {
    setIsComposerOpen(false);
    setFeedback(`Message request sent to ${recipientDisplayName}!`);
  }, [recipientDisplayName]);

  const handleRewindClick = useCallback(() => {
    if (
      isAnimating ||
      isActionSaving ||
      exitDirection !== null ||
      history.length === 0
    ) {
      return;
    }

    const previousIndex = history[history.length - 1];

    const restorePreviousProfile = async () => {
      if (category.id !== "blinddate") {
        const token = getAccessToken();

        if (!token) {
          setFeedback("Please log in to rewind.");
          return;
        }

        try {
          await rewindLastAction(token);
        } catch (reason) {
          setFeedback(
            reason instanceof Error
              ? reason.message
              : "Could not rewind this action."
          );
          return;
        }
      }

      setHistory((previous) => previous.slice(0, -1));
      setCurrentIndex(previousIndex);
    };

    void restorePreviousProfile();
  }, [
    category.id,
    isAnimating,
    isActionSaving,
    exitDirection,
    history,
  ]);

  const handleReset = () => {
    setCurrentIndex(0);
    setHistory([]);
    setPhotoIndices({});
    setExitDirection(null);
    setIsAnimating(false);
    actionDirRef.current = null;
  };

  const cardDeck = loading ? (
    <div className="w-full h-full rounded-[28px] bg-[#121424]/90 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-xl">
      <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#B365FC] animate-spin mb-3" />
      <p className="text-sm text-slate-300">
        Finding students for {category.title}…
      </p>
    </div>
  ) : error ? (
    <div
      role="alert"
      className="w-full h-full rounded-[28px] bg-[#121424]/90 border border-red-400/20 flex flex-col items-center justify-center p-6 text-center shadow-xl"
    >
      <h3 className="text-lg font-bold text-white mb-2">
        Could not load this category
      </h3>
      <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
        {error}
      </p>
    </div>
  ) : currentProfile ? (
    <>
      {nextProfile && (
        <div className="absolute inset-0 pointer-events-none">
          <ProfileCard
            key={`bg-${nextProfile.id}`}
            profile={nextProfile}
            currentPhotoIndex={photoIndices[nextProfile.id] || 0}
            onNextPhoto={() => { }}
            onPrevPhoto={() => { }}
            isTopCard={false}
          />
        </div>
      )}

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
    <div className="w-full h-full rounded-[28px] bg-[#121424]/90 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-xl">
      <div
        className={
          category.id === "blinddate"
            ? "w-16 h-16 rounded-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25"
            : "w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg"
        }
        style={
          category.id === "blinddate"
            ? undefined
            : {
              background: `linear-gradient(135deg, ${category.gradientFrom}, ${category.gradientTo})`,
            }
        }
      >
        <HeartIcon
          className="w-8 h-8 text-white fill-white"
          filled={true}
        />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        {category.id === "blinddate"
          ? `You've seen all profiles in ${category.title}!`
          : `No eligible students in ${category.title} yet`}
      </h3>

      <p className="text-sm text-slate-300 max-w-xs mb-6 leading-relaxed">
        {category.id === "blinddate"
          ? "Check back soon as more students join this category."
          : "New students who are eligible for this category will appear here."}
      </p>

      {category.id === "blinddate" && (
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
        >
          Browse Again
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-2 pb-2 shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Explore"
          className="w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
        >
          <BackIcon className="w-4 h-4" />
        </button>

        <div
          className={
            category.id === "blinddate"
              ? "flex min-w-0 flex-col"
              : "flex min-w-0 flex-col rounded-r-xl border-l-2 pl-3 py-1"
          }
          style={
            category.id === "blinddate"
              ? undefined
              : {
                borderColor: category.gradientTo,
                background: `linear-gradient(90deg, ${category.gradientFrom}25, transparent)`,
              }
          }
        >
          <h2
            className="text-sm font-bold tracking-tight truncate"
            style={
              category.id === "blinddate"
                ? undefined
                : { color: category.gradientTo }
            }
          >
            {category.title}
          </h2>

          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {category.id === "blinddate"
              ? `${category.memberCount} members · Browse profiles`
              : `${category.memberCount === null
                ? "Loading members"
                : `${category.memberCount} members`
              } · ${category.tagline}`}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between px-3.5 pb-2 pt-0 overflow-hidden relative">
        {feedback && (
          <div
            role="status"
            className="absolute top-1 inset-x-4 z-40 rounded-xl border border-white/10 bg-[#121424]/95 px-3 py-2 text-center text-xs text-slate-100 shadow-lg"
          >
            {feedback}
          </div>
        )}

        <div className="relative flex-1 w-full min-h-[440px] max-h-[640px] my-auto">
          {cardDeck}
        </div>

        <ProfileActions
          onRewind={handleRewindClick}
          onMessage={handleMessageClick}
          onPass={handlePassClick}
          onLike={handleLikeClick}
          canRewind={
            history.length > 0 && !isAnimating && !isActionSaving
          }
          isRewinding={isActionSaving}
          disabled={
            category.id !== "blinddate" &&
            (loading ||
              !!error ||
              !currentProfile ||
              isAnimating ||
              isActionSaving)
          }
        />
      </div>

      {currentProfile?.userId != null && (
        <MessageComposerModal
          isOpen={isComposerOpen}
          recipientName={recipientDisplayName}
          recipientUserId={currentProfile.userId}
          onClose={() => setIsComposerOpen(false)}
          onSuccess={handleMessageSuccess}
        />
      )}
    </div>
  );
}
