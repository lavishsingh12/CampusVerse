"use client";

import React from "react";
import { ChatMessage } from "../../types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  return (
    <div className={`w-full flex ${isMe ? "justify-end" : "justify-start"} my-1.5`}>
      <div
        className={`max-w-[78%] px-3.5 py-2.5 shadow-md ${
          isMe
            ? "bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white rounded-2xl rounded-tr-sm"
            : "bg-[#181B30] border border-white/[0.08] text-slate-100 rounded-2xl rounded-tl-sm"
        }`}
      >
        <p className="text-xs sm:text-sm leading-relaxed break-words">{message.text}</p>
        <span
          className={`block text-[10px] mt-1 ${
            isMe ? "text-purple-200 text-right" : "text-slate-400 text-left"
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}
