"use client";

import React, { ReactNode } from "react";
import Link from "next/link";

interface SectionPlaceholderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
}

export function SectionPlaceholder({ title, subtitle, icon }: SectionPlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#B365FC] mb-4 shadow-inner">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h2>
      <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
        {subtitle}
      </p>
      <Link
        href="/"
        className="px-5 py-2 rounded-full border border-white/15 bg-white/5 text-slate-200 hover:text-white text-xs font-medium transition-all active:scale-95"
      >
        Back to Discover
      </Link>
    </div>
  );
}
