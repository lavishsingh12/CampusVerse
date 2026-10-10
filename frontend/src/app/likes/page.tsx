import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import { LikesScreen } from "../../components/likes/LikesScreen";

export default function LikesPage() {
  return (
    <AppShell>
      <LikesScreen />
    </AppShell>
  );
}
