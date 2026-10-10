"use client";

import React from "react";
import { ConversationItem } from "../../types/chat";
import { MegaphoneIcon } from "../common/Icons";

interface ChatListItemProps {
  conversation: ConversationItem;
  onClick: () => void;
}

export function ChatListItem({ conversation, onClick }: ChatListItemProps) {
  const initial = conversation.name.charAt(0).toUpperCase() || "?";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-5 py-3 hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors text-left select-none border-b border-white/[0.04] last:border-b-0 cursor-pointer"
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
        {conversation.isSystem ? (
          <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] flex items-center justify-center text-white shadow-md">
            <MegaphoneIcon className="w-6 h-6 text-white" />
          </div>
        ) : conversation.avatar ? (
          <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-[52px] h-[52px] rounded-full bg-[#B365FC]/20 border border-[#B365FC]/40 flex items-center justify-center text-lg font-bold text-[#E2C7FE]">
            {initial}
          </div>
        )}

        {/* Green Online Dot */}
        {conversation.isOnline && !conversation.isSystem && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0B0C15] shadow-sm" />
        )}
      </div>

      {/* Message Info Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-white truncate">
            {conversation.name}
          </span>
          {conversation.isOnline && !conversation.isSystem && (
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
          )}
        </div>

        <p className="text-xs text-slate-400 truncate leading-snug">
          {conversation.lastMessage}
        </p>
      </div>

      {/* Right Column: Timestamp & Unread count */}
      <div className="flex flex-col items-end justify-center gap-1.5 shrink-0 select-none">
        <span className="text-[11px] font-normal text-slate-400">
          {conversation.timestamp}
        </span>

        {conversation.unreadCount && conversation.unreadCount > 0 ? (
          <div className="w-5 h-5 rounded-full bg-[#9B42F6] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(155,66,246,0.6)]">
            {conversation.unreadCount}
          </div>
        ) : (
          <div className="w-5 h-5" /> // spacer
        )}
      </div>
    </button>
  );
}
