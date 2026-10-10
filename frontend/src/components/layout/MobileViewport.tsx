"use client";

import React, { ReactNode } from "react";

interface MobileViewportProps {
  children: ReactNode;
}

export function MobileViewport({ children }: MobileViewportProps) {
  return (
    <div className="min-h-screen w-full bg-[#05060a] flex items-center justify-center p-0 md:py-6 selection:bg-[#B365FC] selection:text-white">
      {/* 
        Mobile phone simulated container:
        - 390px base width on desktop
        - 844px height (iPhone 12/13/14 reference)
        - Seamless 100% full screen on actual mobile devices
      */}
      <div className="relative w-full h-[100dvh] md:h-[844px] md:max-w-[390px] bg-[#0B0C15] md:rounded-[44px] shadow-2xl md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_10px_#181A28,0_0_0_11px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden text-white border-0 md:border md:border-white/10">
        
        {/* iOS-Style Status Bar (Simulated) */}
        <div className="relative z-50 flex items-center justify-between px-7 pt-3 pb-1 text-xs font-semibold tracking-tight text-white select-none shrink-0">
          <span>9:41</span>
          
          {/* Dynamic Island / Speaker Pill */}
          <div className="hidden md:block w-24 h-4 bg-black rounded-full mx-auto" />

          {/* Status Icons: Signal, Wifi, Battery */}
          <div className="flex items-center space-x-1.5 text-white">
            <svg className="w-4 h-3 fill-current" viewBox="0 0 20 16">
              <path d="M0 12h3v4H0zm5-4h3v8H5zm5-4h3v12h-3zm5-4h3v16h-3z" />
            </svg>
            <svg className="w-3.5 h-3 fill-current" viewBox="0 0 20 16">
              <path d="M10 3a13.5 13.5 0 0 1 8.5 3l-1.5 1.7A11.3 11.3 0 0 0 10 5.4c-2.7 0-5.2.9-7 2.3L1.5 6A13.5 13.5 0 0 1 10 3zm0 4.5a8.7 8.7 0 0 1 5.5 2l-1.6 1.8A6.5 6.5 0 0 0 10 9.8c-1.6 0-3.1.6-4 1.5L4.5 9.5a8.7 8.7 0 0 1 5.5-2zm0 4.5a3.8 3.8 0 0 1 2.5.9L10 15l-2.5-2.6a3.8 3.8 0 0 1 2.5-.9z" />
            </svg>
            <div className="flex items-center">
              <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-[1.5px]" />
              </div>
              <div className="w-0.5 h-1 bg-white/80 rounded-r-sm -ml-[0.5px]" />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pt-1 pb-2 flex justify-center items-center shrink-0 z-50 pointer-events-none select-none">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
