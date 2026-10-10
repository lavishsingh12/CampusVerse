"use client";

import React, { ReactNode } from "react";
import { MobileViewport } from "./MobileViewport";
import { AppHeader } from "./AppHeader";
import { BottomNavigation } from "./BottomNavigation";

interface AppShellProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function AppShell({ children, showHeader = true }: AppShellProps) {
  return (
    <MobileViewport>
      {showHeader && <AppHeader />}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
      <BottomNavigation />
    </MobileViewport>
  );
}
