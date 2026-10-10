"use client";

import React from "react";
import { MessageBubbleIcon } from "../common/Icons";

interface IcebreakerProps {
  prompt?: string;
  text: string;
}

export function Icebreaker({ prompt = "ICEBREAKER", text }: IcebreakerProps) {
  return (
    <div className="w-full bg-[#121424]/90 border border-white/[0.08] rounded-2xl p-3.5 backdrop-blur-sm shadow-md transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <MessageBubbleIcon className="w-4 h-4 text-[#B365FC]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#B365FC]">
          {prompt}
        </span>
      </div>
      <p className="text-slate-200 text-xs sm:text-sm font-normal leading-snug tracking-normal">
        {text}
      </p>
    </div>
  );
}
