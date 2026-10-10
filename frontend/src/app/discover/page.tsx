import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import { DiscoverScreen } from "../../components/discover/DiscoverScreen";

export default function DiscoverRoutePage() {
  return (
    <AppShell>
      <DiscoverScreen />
    </AppShell>
  );
}
