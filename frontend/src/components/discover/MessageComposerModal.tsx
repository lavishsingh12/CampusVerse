
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CloseIcon,
  SendIcon,
  MessageBubbleIcon,
} from "../common/Icons";
import { createMessageRequest } from "../../lib/messageRequests";
import { getAccessToken } from "../../lib/token";

interface MessageComposerModalProps {
  isOpen: boolean;
  recipientName: string;
  recipientUserId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function MessageComposerModal({
  isOpen,
  recipientName,
  recipientUserId,
  onClose,
  onSuccess,
}: MessageComposerModalProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updateViewportHeight = () => {
      const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(Math.max(240, visibleHeight - 16));
    };

    updateViewportHeight();

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateViewportHeight);
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      viewport?.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);

    const timeout = window.setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true });
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, sending, onClose]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();

    if (!trimmed || sending) return;

    const token = getAccessToken();

    if (!token) {
      setError("Please log in to send a message request.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await createMessageRequest(recipientUserId, trimmed, token);
      setContent("");
      onSuccess();
    } catch (err) {
      console.error("Failed to send message request:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not send message request. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !sending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-composer-title"
        className="relative w-full max-w-lg rounded-[24px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col min-h-0 overflow-hidden animate-slide-up"
        style={{
          maxHeight: viewportHeight ? `${viewportHeight}px` : "calc(100dvh - 1rem)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-3 pb-2.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#B365FC] flex items-center justify-center text-white shadow-md">
              <MessageBubbleIcon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h3
                id="message-composer-title"
                className="text-base font-bold text-white tracking-tight truncate"
              >
                Message {recipientName}
              </h3>

              <p className="text-[11px] text-slate-400">
                Send an initial message request
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close message composer"
            className="shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSend}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Scrollable body */}
          <div className="px-4 sm:px-5 pt-3 pb-2 flex flex-col gap-3 overflow-y-auto overscroll-contain flex-1 min-h-0">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2 shrink-0">
                <span className="text-sm shrink-0">⚠️</span>
                <p className="flex-1 min-w-0 leading-relaxed break-words">
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5 min-w-0">
              <label
                htmlFor="message-request-input"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Your Message
              </label>

              <textarea
                id="message-request-input"
                ref={textareaRef}
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Say something friendly to spark a conversation with ${recipientName}...`}
                maxLength={500}
                disabled={sending}
                className="block w-full min-h-[64px] rounded-2xl bg-[#181B30] border border-white/10 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B365FC] transition-colors resize-none disabled:opacity-50"
              />

              <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 px-1">
                <span>
                  Will be delivered to their Requests tab
                </span>

                <span className="shrink-0 tabular-nums">
                  {content.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-4 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-5 flex items-center gap-2 sm:gap-3 shrink-0 border-t border-white/[0.04] bg-[#121424]">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="min-w-0 flex-1 py-2.5 sm:py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="min-w-0 flex-1 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#B365FC] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 shrink-0 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <SendIcon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    Send Request
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
