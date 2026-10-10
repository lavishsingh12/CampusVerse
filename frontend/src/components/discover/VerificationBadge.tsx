"use client";

import React from "react";
import { StudentCapIcon } from "../common/Icons";

interface VerificationBadgeProps {
  className?: string;
}

export function VerificationBadge({ className = "" }: VerificationBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-medium tracking-tight shadow-sm select-none ${className}`}
    >
      <StudentCapIcon className="w-3.5 h-3.5 text-emerald-400" />
      <span>Student Verified</span>
    </div>
  );
}
