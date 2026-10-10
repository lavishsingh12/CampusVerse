import React from "react";
import { AppShell } from "../components/layout/AppShell";
import { DiscoverScreen } from "../components/discover/DiscoverScreen";

export default function HomePage() {
  return (
    <AppShell>
      <DiscoverScreen />
    </AppShell>
  );
}
