"use client";

import React from "react";
import { RewindIcon, MessageBubbleIcon, HeartIcon, CloseIcon } from "../common/Icons";

interface ProfileActionsProps {
  onRewind: () => void;
  onMessage?: () => void;
  onLike: () => void;
  onPass: () => void;
  canRewind?: boolean;
  isRewinding?: boolean;
  disabled?: boolean;
}

export function ProfileActions({
  onRewind,
  onMessage,
  onLike,
  onPass,
  canRewind = false,
  isRewinding = false,
  disabled = false,
}: ProfileActionsProps) {
  // Rewind has its own disabled logic — it should remain available
  // even when all cards are swiped (currentProfile is undefined)
  const rewindDisabled = !canRewind || isRewinding;

  return (
    <div className="w-full flex items-center justify-center gap-3 sm:gap-4 pt-2.5 pb-1.5 z-30 select-none">
      {/* 1. Rewind Button (Smaller — w-14 = 56px) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRewind();
        }}
        disabled={rewindDisabled}
        aria-label="Rewind to previous profile"
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border ${
          !rewindDisabled
            ? "bg-[#1E2140] border-white/15 text-slate-200 hover:text-white hover:bg-[#272B4D] active:scale-90 shadow-md cursor-pointer"
            : "bg-[#141522]/60 text-slate-600 border-white/5 cursor-not-allowed opacity-50"
        }`}
      >
        <RewindIcon className="w-5 h-5" />
      </button>

      {/* 2. Message Button (Larger — w-16 = 64px, same as Like) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMessage?.();
        }}
        disabled={disabled}
        aria-label="Send message request"
        className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#B365FC] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_22px_rgba(139,92,246,0.55)] active:scale-90 transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <MessageBubbleIcon className="w-7 h-7 stroke-[2.2] text-white drop-shadow-md" />
      </button>

      {/* 3. Like Button (Larger — w-16 = 64px, same as Message) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
        disabled={disabled}
        aria-label="Like profile"
        className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#9B42F6] via-[#B838DF] to-[#E93C9A] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(184,56,223,0.4)] hover:shadow-[0_8px_22px_rgba(184,56,223,0.55)] active:scale-90 transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <HeartIcon className="w-7 h-7 fill-white text-white drop-shadow-md" filled={true} />
      </button>

      {/* 4. Pass Button (Smaller — w-14 = 56px, same as Rewind) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPass();
        }}
        disabled={disabled}
        aria-label="Pass profile"
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 border ${
          !disabled
            ? "bg-[#1E2140] border-white/15 text-slate-200 hover:text-white hover:bg-[#272B4D] active:scale-90 shadow-md cursor-pointer"
            : "bg-[#141522]/60 text-slate-600 border-white/5 cursor-not-allowed opacity-50"
        }`}
      >
        <CloseIcon className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}
