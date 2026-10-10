"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ConversationItem, ChatMessage } from "../../types/chat";
import { MessageBubble } from "./MessageBubble";
import { BackIcon, MoreVerticalIcon, SendIcon, MegaphoneIcon } from "../common/Icons";
import { getAccessToken, getUserId } from "../../lib/token";
import { getMatchMessages, sendMatchMessage } from "../../lib/chat";

interface IndividualChatScreenProps {
  conversation: ConversationItem;
  onBack: () => void;
  onMessageSent?: () => void;
}

function formatMessageTime(isoString?: string): string {
  if (!isoString) return "Just now";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Just now";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

export function IndividualChatScreen({
  conversation,
  onBack,
  onMessageSent,
}: IndividualChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myUserId = getUserId();
  const initial = conversation.name.charAt(0).toUpperCase() || "?";

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async (isPolling = false) => {
    const token = getAccessToken();
    if (!token) {
      if (!isPolling) {
        setError("You are not logged in. Please log in to view messages.");
        setLoading(false);
      }
      return;
    }

    try {
      if (!isPolling) {
        setError(null);
      }
      const rawMessages = await getMatchMessages(conversation.id, token);
      
      const mapped: ChatMessage[] = rawMessages.map((msg) => ({
        id: String(msg.id),
        sender: msg.sender_id === myUserId ? "me" : "them",
        text: msg.content,
        timestamp: formatMessageTime(msg.created_at),
        createdAt: msg.created_at,
      }));

      setMessages(mapped);
    } catch (err) {
      if (!isPolling) {
        setError(err instanceof Error ? err.message : "Failed to load messages.");
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  }, [conversation.id, myUserId]);

  useEffect(() => {
    void loadMessages(false);

    // Light periodic refresh while chat is open
    const interval = setInterval(() => {
      void loadMessages(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || sending) return;

    const token = getAccessToken();
    if (!token) {
      setError("Please log in to send messages.");
      return;
    }

    setSending(true);
    setError(null);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      sender: "me",
      text: content,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");

    try {
      const savedMessage = await sendMatchMessage(conversation.id, content, token);
      
      // Replace optimistic message with confirmed backend message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: String(savedMessage.id),
                sender: "me",
                text: savedMessage.content,
                timestamp: formatMessageTime(savedMessage.created_at),
                createdAt: savedMessage.created_at,
              }
            : m
        )
      );

      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      // Rollback optimistic message on failure and show error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(content);
      setError(err instanceof Error ? err.message : "Failed to send message. Please retry.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0C15] overflow-hidden select-none">
      {/* Chat Header */}
      <header className="flex items-center justify-between px-3 py-2.5 bg-[#0B0C15]/95 border-b border-white/[0.08] backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <BackIcon className="w-6 h-6" />
          </button>

          {/* Avatar */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10">
            {conversation.isSystem ? (
              <div className="w-full h-full bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] flex items-center justify-center text-white">
                <MegaphoneIcon className="w-4 h-4" />
              </div>
            ) : conversation.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#B365FC]/20 flex items-center justify-center text-sm font-bold text-[#E2C7FE]">
                {initial}
              </div>
            )}
            {conversation.isOnline && !conversation.isSystem && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0B0C15]" />
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight">
              {conversation.name}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {conversation.isOnline ? "Active now" : "Online"}
            </span>
          </div>
        </div>

        {/* More options button */}
        <button
          type="button"
          aria-label="More options"
          className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all"
        >
          <MoreVerticalIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Error alert if any */}
      {error && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadMessages(false)}
            className="ml-2 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col justify-start">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-[#B365FC]" />
            <p className="text-xs text-slate-400">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-3">
              👋
            </div>
            <h4 className="text-sm font-semibold text-white">No messages yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Say hello to {conversation.name} and break the ice!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#0E1020] border-t border-white/[0.08] shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-[#181B30] border border-white/10 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#B365FC]/70 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            aria-label="Send message"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !sending
                ? "bg-gradient-to-tr from-[#9B42F6] to-[#E93C9A] text-white shadow-md active:scale-95 cursor-pointer"
                : "bg-white/5 text-slate-500 cursor-not-allowed"
            }`}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

