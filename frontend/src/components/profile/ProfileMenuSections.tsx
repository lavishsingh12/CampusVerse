"use client";

import React from "react";
import {
  DocumentUserIcon,
  StarIcon,
  MessageBubbleIcon,
  ShieldLockIcon,
  QuestionCircleIcon,
  ChevronRightIcon,
} from "../common/Icons";

interface ProfileMenuSectionsProps {
  onOpenMyInfo: () => void;
  onOpenInterests: () => void;
  onOpenIcebreakers: () => void;
  onOpenSettings: (section: "settings" | "privacy" | "notifications") => void;
  onOpenSupport: () => void;
}

export function ProfileMenuSections({
  onOpenMyInfo,
  onOpenInterests,
  onOpenIcebreakers,
  onOpenSettings,
  onOpenSupport,
}: ProfileMenuSectionsProps) {
  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* 1. Profile Information Group */}
      <div className="rounded-[22px] bg-[#14162B] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06] shadow-sm">
        {/* My Info */}
        <button
          type="button"
          onClick={onOpenMyInfo}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[#E93C9A] flex items-center justify-center shrink-0">
              <DocumentUserIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                My Info
              </span>
              <span className="text-xs text-slate-400 truncate mt-0.5">
                Basic details, education, location (campus)
              </span>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
        </button>

        {/* Interests */}
        <button
          type="button"
          onClick={onOpenInterests}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[#E93C9A] flex items-center justify-center shrink-0">
              <StarIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                Interests
              </span>
              <span className="text-xs text-slate-400 truncate mt-0.5">
                Hobbies and interests
              </span>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
        </button>

        {/* Icebreakers */}
        <button
          type="button"
          onClick={onOpenIcebreakers}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[#E93C9A] flex items-center justify-center shrink-0">
              <MessageBubbleIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                Icebreakers
              </span>
              <span className="text-xs text-slate-400 truncate mt-0.5">
                Set your icebreakers to spark better conversations
              </span>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
        </button>
      </div>

      {/* 2. Settings & Support Group */}
      <div className="rounded-[22px] bg-[#14162B] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06] shadow-sm">
        {/* App Settings */}
        <button
          type="button"
          onClick={() => onOpenSettings("settings")}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[#E93C9A] flex items-center justify-center shrink-0">
              <ShieldLockIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                App Settings
              </span>
              <span className="text-xs text-slate-400 truncate mt-0.5">
                Notifications, privacy and preferences
              </span>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
        </button>

        {/* Help & Support */}
        <button
          type="button"
          onClick={onOpenSupport}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[#E93C9A] flex items-center justify-center shrink-0">
              <QuestionCircleIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                Help &amp; Support
              </span>
              <span className="text-xs text-slate-400 truncate mt-0.5">
                FAQs, feedback and contact us
              </span>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
        </button>
      </div>
    </div>
  );
}
