"use client";

import React, { useRef, useState, useEffect } from "react";
import { Profile } from "../../types/profile";
import { ProfilePhotoViewer } from "./ProfilePhotoViewer";
import { ProfilePhotoOverlay, ProfileDetailsBelowPhoto } from "./ProfileInfo";

// How long the exit animation plays before onExitComplete is called
const EXIT_MS = 260;
const SWIPE_THRESHOLD = 72; // px of horizontal travel to commit a swipe

interface ProfileCardProps {
  profile: Profile;
  currentPhotoIndex: number;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  /** Called immediately when gesture reaches threshold OR when exit animation should start */
  onAction?: (direction: "left" | "right") => void;
  /** Called after exit animation finishes — parent should advance the deck */
  onExitComplete?: () => void;
  /** Set by parent to drive a programmatic exit (e.g. button press) */
  exitDirection?: "left" | "right" | null;
  isTopCard: boolean;
}

export function ProfileCard({
  profile,
  currentPhotoIndex,
  onNextPhoto,
  onPrevPhoto,
  onAction,
  onExitComplete,
  exitDirection = null,
  isTopCard,
}: ProfileCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
const startPos = useRef({ x: 0, y: 0 });
const exitFired = useRef(false);
const photoAreaRef = useRef<HTMLDivElement>(null);
const startedOnPhoto = useRef(false);

  // Stable refs for callbacks so parent re-renders never invalidate pending timeouts
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  // Set locally the moment a gesture crosses the threshold so animation
  // starts immediately without waiting for the parent re-render
  const [localExitDir, setLocalExitDir] = useState<"left" | "right" | null>(null);

  // Reset all local state when the profile changes
  useEffect(() => {
    exitFired.current = false;
    setLocalExitDir(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setIsHorizontal(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [profile.id]);

  // The active exit direction (gesture or button-driven)
  const activeExit = localExitDir ?? exitDirection;

  // Schedule onExitComplete once the exit animation is committed.
  // Using onExitCompleteRef ensures the timer is NEVER cancelled due to parent re-rendering.
  useEffect(() => {
    if (!activeExit) {
      exitFired.current = false;
      return;
    }
    if (exitFired.current) return;
    exitFired.current = true;

    const t = setTimeout(() => {
      onExitCompleteRef.current?.();
    }, EXIT_MS + 10);

    return () => clearTimeout(t);
  }, [activeExit]);

  // ── Pointer handlers ──────────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTopCard || activeExit) return;
    setIsDragging(true);
    setIsHorizontal(false);
    startPos.current = { x: e.clientX, y: e.clientY };
	const photoRect = photoAreaRef.current?.getBoundingClientRect();
startedOnPhoto.current =
  !!photoRect &&
  e.clientX >= photoRect.left &&
  e.clientX <= photoRect.right &&
  e.clientY >= photoRect.top &&
  e.clientY <= photoRect.bottom;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if pointer capture not supported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isTopCard || activeExit) return;

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    // Lock into horizontal swipe intent
    if (!isHorizontal) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        setIsHorizontal(true);
      }
    }

    if (isHorizontal) {
      setDragOffset({ x: dx, y: dy * 0.1 });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
  if (!isDragging || !isTopCard) return;

  try {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  } catch {
    // ignore
  }

  setIsDragging(false);

  const dx = e.clientX - startPos.current.x;
  const dy = e.clientY - startPos.current.y;

  // Normal tap on the profile photo
  if (
    startedOnPhoto.current &&
    !isHorizontal &&
    Math.abs(dx) < 15 &&
    Math.abs(dy) < 15
  ) {
    const photoRect = photoAreaRef.current?.getBoundingClientRect();

    if (photoRect) {
      const tapX = e.clientX - photoRect.left;

      if (tapX < photoRect.width * 0.45) {
        onPrevPhoto();
      } else {
        onNextPhoto();
      }
    }

    startedOnPhoto.current = false;
    setIsHorizontal(false);
    return;
  }

  // Normal card swipe
  if (isHorizontal && Math.abs(dx) >= SWIPE_THRESHOLD) {
    const dir: "left" | "right" = dx > 0 ? "right" : "left";

    setLocalExitDir(dir);
    setIsHorizontal(false);
    startedOnPhoto.current = false;

    onActionRef.current?.(dir);
  } else {
    // Didn't reach swipe threshold — spring back
    setDragOffset({ x: 0, y: 0 });
    setIsHorizontal(false);
    startedOnPhoto.current = false;
  }
};

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    setIsDragging(false);
    setIsHorizontal(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // ── Visual transform ───────────────────────────────────────────────────────

  let cardTransform: string;
  let cardTransition: string;
  let cardOpacity = 1;

  if (!isTopCard) {
    // Background card: slightly scaled down, resting underneath
    cardTransform = "scale(0.96) translate3d(0, 10px, 0)";
    cardTransition = "transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)";
    cardOpacity = 0.8;
  } else if (activeExit) {
    // Exiting — fly off screen smoothly
    const tx = activeExit === "right" ? 520 : -520;
    const rot = activeExit === "right" ? 16 : -16;
    cardTransform = `translate3d(${tx}px, 0, 0) rotate(${rot}deg)`;
    cardTransition = `transform ${EXIT_MS}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${EXIT_MS}ms ease`;
    cardOpacity = 0;
  } else if (isDragging && isHorizontal) {
    // Following the finger — 1:1 with subtle rotation
    const rot = (dragOffset.x / 320) * 10;
    cardTransform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rot}deg)`;
    cardTransition = "none"; // instant, physically connected
    cardOpacity = 1;
  } else {
    // Idle / spring snapping back to centre
    cardTransform = "translate3d(0, 0, 0) rotate(0deg)";
    cardTransition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    cardOpacity = 1;
  }

  // Swipe stamp opacities
  const likeOpacity =
    activeExit === "right"
      ? 1
      : isHorizontal && dragOffset.x > 20
      ? Math.min((dragOffset.x - 20) / 55, 1)
      : 0;

  const passOpacity =
    activeExit === "left"
      ? 1
      : isHorizontal && dragOffset.x < -20
      ? Math.min((-dragOffset.x - 20) / 55, 1)
      : 0;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        transform: cardTransform,
        transition: cardTransition,
        opacity: cardOpacity,
        willChange: "transform, opacity",
      }}
      className={`absolute inset-0 rounded-[28px] overflow-hidden shadow-2xl bg-[#121424] border border-white/[0.08] select-none touch-pan-y ${
        isTopCard ? "z-20 cursor-grab active:cursor-grabbing" : "z-10 pointer-events-none"
      }`}
    >
      {/* LIKE / PASS stamps */}
      {isTopCard && (
        <>
          <div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 z-40 px-4 py-1.5 rounded-xl border-4 border-[#B365FC] bg-[#B365FC]/30 text-white font-extrabold text-2xl uppercase tracking-wider -rotate-12 backdrop-blur-sm pointer-events-none"
          >
            LIKE
          </div>
          <div
            style={{ opacity: passOpacity }}
            className="absolute top-8 right-6 z-40 px-4 py-1.5 rounded-xl border-4 border-slate-400 bg-black/40 text-slate-300 font-extrabold text-2xl uppercase tracking-wider rotate-12 backdrop-blur-sm pointer-events-none"
          >
            PASS
          </div>
        </>
      )}

      {/* Internal scrollable content */}
      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth flex flex-col"
      >
        {/* Photo area — visually clear and unobstructed */}
        <div
 	 ref={photoAreaRef}
	  className="relative w-full h-[475px] shrink-0 overflow-hidden bg-slate-900"
	>
          <ProfilePhotoViewer
            photos={profile.photos}
            currentPhotoIndex={currentPhotoIndex}
            onNextPhoto={onNextPhoto}
            onPrevPhoto={onPrevPhoto}
            altText={`${profile.name}, ${profile.age}`}
          />
          {/* Gradient + minimal overlay info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0C15] via-[#0B0C15]/75 to-transparent pt-14 pb-3.5 px-4 pointer-events-none z-20 flex flex-col justify-end">
            <ProfilePhotoOverlay profile={profile} />
            <div className="flex justify-center pt-2.5 opacity-60">
              <div className="w-7 h-1 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Below-photo: interests, hobbies, icebreakers */}
        <div className="w-full px-4 pt-3.5 pb-8 bg-[#121424] flex flex-col gap-4">
          <ProfileDetailsBelowPhoto profile={profile} />
        </div>
      </div>
    </div>
  );
}
