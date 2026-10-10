import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import { ProfileScreen } from "../../components/profile/ProfileScreen";

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileScreen />
    </AppShell>
  );
}
