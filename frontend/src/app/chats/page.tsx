import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import { ChatsScreen } from "../../components/chat/ChatsScreen";

export default function ChatsPage() {
  return (
    <AppShell>
      <ChatsScreen />
    </AppShell>
  );
}
