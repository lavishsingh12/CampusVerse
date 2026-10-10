"use client";

import React, { useState } from "react";
import { ConversationItem } from "../../types/chat";
import { ChatListItem } from "./ChatListItem";

interface ChatListProps {
  conversations: ConversationItem[];
  onSelectConversation: (conversation: ConversationItem) => void;
  searchQuery: string;
}

export function ChatList({
  conversations,
  onSelectConversation,
  searchQuery,
}: ChatListProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "unread") return (c.unreadCount || 0) > 0;
    return true;
  });

  return (
    <div className="w-full flex flex-col flex-1 pb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1.5">
        <h3 className="text-sm font-bold text-white tracking-tight">Messages</h3>

        {/* Filter pill */}
        <button
          type="button"
          onClick={() => setFilter((prev) => (prev === "all" ? "unread" : "all"))}
          className="px-2.5 py-1 rounded-full bg-[#181A2D] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1 hover:text-white transition-colors"
        >
          <span>{filter === "all" ? "All Chats" : "Unread"}</span>
          <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 flex flex-col">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <ChatListItem
              key={item.id}
              conversation={item}
              onClick={() => onSelectConversation(item)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <p className="text-xs">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
