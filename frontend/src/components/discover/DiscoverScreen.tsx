"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ProfileCard } from "./ProfileCard";
import { ProfileActions } from "./ProfileActions";
import { MessageComposerModal } from "./MessageComposerModal";
import { HeartIcon, CheckIcon } from "../common/Icons";
import { Profile } from "../../types/profile";
import { BackendProfile } from "../../lib/profile";
import {
  getDiscoverProfiles,
  createAction,
  rewindLastAction,
  toDiscoverCardProfile,
} from "../../lib/discover";
import { getAccessToken } from "../../lib/token";

export function DiscoverScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [backendProfiles, setBackendProfiles] = useState<BackendProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<{ index: number; profileId: string }[]>([]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRewinding, setIsRewinding] = useState(false);
  const actionDirRef = useRef<"left" | "right" | null>(null);

  // Message Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load discover profiles from backend
  const loadProfiles = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to discover profiles.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getDiscoverProfiles(token);
      setBackendProfiles(data);
      setProfiles(data.map(toDiscoverCardProfile));
      setCurrentIndex(0);
      setHistory([]);
      setPhotoIndices({});
      setExitDirection(null);
      setIsAnimating(false);
      setIsRewinding(false);
      actionDirRef.current = null;
    } catch (err) {
      console.error("Failed to load discover profiles:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load profiles."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const currentPhotoIndex = currentProfile
    ? photoIndices[currentProfile.id] || 0
    : 0;

  // Next photo of SAME person
  const handleNextPhoto = useCallback(() => {
    if (!currentProfile) return;
    const max = currentProfile.photos.length - 1;
    const nextIdx = currentPhotoIndex < max ? currentPhotoIndex + 1 : 0;
    setPhotoIndices((prev) => ({
      ...prev,
      [currentProfile.id]: nextIdx,
    }));
  }, [currentProfile, currentPhotoIndex]);

  // Previous photo of SAME person
  const handlePrevPhoto = useCallback(() => {
    if (!currentProfile) return;
    const max = currentProfile.photos.length - 1;
    const prevIdx = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : max;
    setPhotoIndices((prev) => ({
      ...prev,
      [currentProfile.id]: prevIdx,
    }));
  }, [currentProfile, currentPhotoIndex]);

  // Persist action to backend
  const persistAction = useCallback(
    async (profileId: string, action: "like" | "pass") => {
      const token = getAccessToken();
      if (!token) return;

      const bp = backendProfiles.find((p) => String(p.id) === profileId);
      if (!bp) return;

      try {
        const result = await createAction(bp.id, action, token);
        if (result.match_created) {
          setFeedbackNotice("🎉 It's a Match! Chat is now open.");
          setTimeout(() => setFeedbackNotice(null), 4000);
        }
      } catch (err) {
        console.error(`Failed to ${action} profile:`, err);
      }
    },
    [backendProfiles]
  );

  // Called immediately when gesture swipe crosses threshold
  const handleAction = useCallback((dir: "left" | "right") => {
    actionDirRef.current = dir;
    setIsAnimating(true);
  }, []);

  // Called when card exit animation completes — reliably advance the deck
  const handleExitComplete = useCallback(() => {
    const dir = actionDirRef.current ?? "right";
    const current = profiles[currentIndex];

    if (current) {
      const action = dir === "right" ? "like" : "pass";
      void persistAction(current.id, action as "like" | "pass");
      setHistory((prev) => [...prev, { index: currentIndex, profileId: current.id }]);
    }

    setExitDirection(null);
    actionDirRef.current = null;
    setIsAnimating(false);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, profiles, persistAction]);

  // PASS button click (triggers smooth left swipe)
  const handlePassClick = useCallback(() => {
    if (isAnimating || exitDirection !== null || currentIndex >= profiles.length) return;
    setIsAnimating(true);
    actionDirRef.current = "left";
    setExitDirection("left");
  }, [isAnimating, exitDirection, currentIndex, profiles.length]);

  // LIKE button click (triggers smooth right swipe)
  const handleLikeClick = useCallback(() => {
    if (isAnimating || exitDirection !== null || currentIndex >= profiles.length) return;
    setIsAnimating(true);
    actionDirRef.current = "right";
    setExitDirection("right");
  }, [isAnimating, exitDirection, currentIndex, profiles.length]);

  // MESSAGE button click (opens custom message composer)
  const handleMessageClick = useCallback(() => {
    if (!currentProfile || isAnimating) return;
    setIsComposerOpen(true);
  }, [currentProfile, isAnimating]);

  // Handle successful message request submission
  const handleMessageSuccess = useCallback(() => {
    setIsComposerOpen(false);
    const sentToName = currentProfile?.displayName || currentProfile?.name || "Student";
    setFeedbackNotice(`Message request sent to ${sentToName}!`);
    setTimeout(() => setFeedbackNotice(null), 4000);

    // Advance to next profile on successful message request send
    if (currentProfile) {
      setHistory((prev) => [...prev, { index: currentIndex, profileId: currentProfile.id }]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentProfile, currentIndex]);

  // REWIND button click (restores previous profile via backend)
  const handleRewindClick = useCallback(async () => {
    if (isRewinding || isAnimating || exitDirection !== null || history.length === 0) return;

    const token = getAccessToken();
    if (!token) return;

    setIsRewinding(true);
    try {
      await rewindLastAction(token);

      const lastEntry = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentIndex(lastEntry.index);
    } catch (err) {
      console.error("Failed to rewind:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to rewind. Please try again.";
      setFeedbackNotice(msg);
      setTimeout(() => setFeedbackNotice(null), 3000);
    } finally {
      setIsRewinding(false);
    }
  }, [isRewinding, isAnimating, exitDirection, history]);

  // Refresh profiles
  const handleRefresh = () => {
    void loadProfiles();
  };

  const recipientUserId = currentProfile?.userId ?? Number(currentProfile?.id || 0);
  const recipientDisplayName = currentProfile?.displayName || currentProfile?.name || "Student";

  return (
    <div className="flex-1 flex flex-col justify-between px-3.5 pb-2 pt-1 overflow-hidden relative">
      {/* Toast Feedback Notification */}
      {feedbackNotice && (
        <div className="absolute top-2 inset-x-6 z-50 flex items-center justify-center animate-fade-in pointer-events-none">
          <div className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-xl flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-white" />
            <span>{feedbackNotice}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="relative flex-1 w-full min-h-[440px] max-h-[640px] my-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#B365FC]" />
            <p className="text-sm text-slate-400">Discovering profiles...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="relative flex-1 w-full min-h-[440px] max-h-[640px] my-auto flex items-center justify-center">
          <div className="w-full rounded-[28px] bg-[#121424]/90 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-red-400/15 flex items-center justify-center mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-slate-300 max-w-xs mb-6 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Cards Presentation Container */}
      {!loading && !error && (
        <div className="relative flex-1 w-full min-h-[440px] max-h-[640px] my-auto">
          {currentProfile ? (
            <>
              {/* Background card: next profile waiting in deck */}
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

              {/* Active Foreground Card */}
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
            /* Empty State when all profiles are discovered */
            <div className="w-full h-full rounded-[28px] bg-[#121424]/90 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
                <HeartIcon className="w-8 h-8 text-white fill-white" filled={true} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">You&apos;re All Caught Up!</h3>
              <p className="text-sm text-slate-300 max-w-xs mb-6 leading-relaxed">
                You&apos;ve discovered all active students in your campus batch for now. Check back soon for new campus connections.
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                Discover Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: 1. Rewind -> 2. Message -> 3. Like -> 4. Pass */}
      <ProfileActions
        onRewind={handleRewindClick}
        onMessage={handleMessageClick}
        onLike={handleLikeClick}
        onPass={handlePassClick}
        canRewind={history.length > 0 && !isAnimating && !isRewinding}
        isRewinding={isRewinding}
        disabled={!currentProfile || isAnimating}
      />

      {/* Message Composer Modal for Message Requests */}
      <MessageComposerModal
        isOpen={isComposerOpen}
        recipientName={recipientDisplayName}
        recipientUserId={recipientUserId}
        onClose={() => setIsComposerOpen(false)}
        onSuccess={handleMessageSuccess}
      />
    </div>
  );
}
