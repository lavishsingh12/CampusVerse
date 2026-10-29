"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";

import { LogoutButton } from "../auth/LogoutButton";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ProfileStats } from "./ProfileStats";
import { MyPhotosSection } from "./MyPhotosSection";
import { ProfileMenuSections } from "./ProfileMenuSections";
import { PhotoManagerModal } from "./PhotoManagerModal";
import { EditInfoModal } from "./EditInfoModal";
import { EditInterestsModal } from "./EditInterestsModal";
import { EditIcebreakersModal } from "./EditIcebreakersModal";
import { SettingsModal, SettingsTab } from "./SettingsModal";

import { TagItem, IcebreakerItem } from "../../types/profile";
import { UserProfile, UserProfileLifestyle } from "../../data/mockUserProfile";
import { getAccessToken } from "../../lib/token";
import { resolveApiMediaUrl } from "../../lib/api";

import {
  getMyProfile,
  updateProfile as apiUpdateProfile,
  syncProfilePhotos as apiSyncProfilePhotos,
  BackendProfile,
  ProfilePhotoSelection,
} from "../../lib/profile";

const DEFAULT_LIFESTYLE: UserProfileLifestyle = {
  height: "5'10\" (178 cm)",
  drinking: "Socially",
  smoking: "Never",
  workout: "Active (3-4x week)",
  pets: "Dog friendly 🐕",
  zodiac: "Libra ♎",
  lookingFor: "Meaningful connection & study buddy",
};

const DEFAULT_INTERESTS: TagItem[] = [
  { id: "1", label: "Music", emoji: "🎵" },
  { id: "2", label: "Coding", emoji: "💻" },
  { id: "3", label: "Coffee", emoji: "☕" },
  { id: "4", label: "Photography", emoji: "📷" },
];

const DEFAULT_ICEBREAKERS: IcebreakerItem[] = [
  {
    prompt: "My ideal Sunday is...",
    text: "Good coffee, discovering new music, and relaxed conversations.",
  },
];

export function ProfileScreen() {
  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(
    null
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isEditInterestsOpen, setIsEditInterestsOpen] = useState(false);
  const [isEditIcebreakersOpen, setIsEditIcebreakersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("settings");

  const notifySuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const loadProfile = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setError("Please log in to view and manage your profile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getMyProfile(token);
      setBackendProfile(data);

      const photosUrls = (data.photos || [])
        .sort((a, b) => a.position - b.position)
        .map((photo) => resolveApiMediaUrl(photo.url));

      const formattedProfile: UserProfile = {
        id: String(data.id),
        name: data.display_name || data.user_name || "Campus User",
        age: data.age || 20,
        degree: data.degree || "Degree",
        year: data.year || "Year",
        branch: data.branch || "Branch",
        university: data.university ?? "CampusVerse College",
        campus: data.campus ?? "Main Campus",
        isVerified: data.is_verified,
        isStudentVerified: true,
        bio: data.bio || "",
        photos: photosUrls,
        stats: {
          likesRemaining: 10,
          maxLikes: 10,
          profileViews: 45,
          completeness: 80,
        },
        lifestyle: data.lifestyle
          ? { ...DEFAULT_LIFESTYLE, ...data.lifestyle }
          : DEFAULT_LIFESTYLE,
        interests: data.interests ?? DEFAULT_INTERESTS,
        icebreakers: data.icebreakers ?? DEFAULT_ICEBREAKERS,
      };

      setProfile(formattedProfile);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Dynamically calculate completeness percentage
  const completeness = useMemo(() => {
    if (!profile) return 0;

    let score = 0;

    if (profile.photos.length >= 2) score += 25;
    if (profile.photos.length >= 4) score += 15;
    if (profile.bio && profile.bio.trim().length > 5) score += 20;
    if (profile.degree && profile.branch) score += 20;
    if (profile.interests && profile.interests.length >= 2) score += 10;
    if (profile.icebreakers && profile.icebreakers.length >= 1) score += 10;

    return Math.min(score, 100);
  }, [profile]);

  // Derived stats with live completeness
  const activeStats = useMemo(() => {
    if (!profile) {
      return {
        likesRemaining: 10,
        maxLikes: 10,
        profileViews: 0,
        completeness: 0,
      };
    }

    return {
      ...profile.stats,
      completeness,
    };
  }, [profile, completeness]);

  const photoManagerPhotos = useMemo(
    () =>
      (backendProfile?.photos || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((photo) => ({
          id: photo.id,
          url: resolveApiMediaUrl(photo.url),
        })),
    [backendProfile?.photos]
  );

  // Photo update handler - sync with backend
  const handleSavePhotos = async (updatedPhotos: ProfilePhotoSelection[]) => {
    if (!backendProfile) throw new Error("Your profile is not ready to save.");

    const token = getAccessToken();

    if (!token) {
      throw new Error("Please log in to save photos.");
    }

    setSaving(true);
    setError(null);

    try {
      const updatedBackendPhotos = await apiSyncProfilePhotos(
        backendProfile.id,
        updatedPhotos,
        token
      );

      setBackendProfile((previous) =>
        previous ? { ...previous, photos: updatedBackendPhotos } : previous
      );

      setProfile((previous) =>
        previous
          ? {
            ...previous,
            photos: [...updatedBackendPhotos]
              .sort((a, b) => a.position - b.position)
              .map((photo) => resolveApiMediaUrl(photo.url)),
          }
          : previous
      );

      notifySuccess("Photos updated successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save photos.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  // Profile information update handler
  const handleSaveInfo = async (updated: {
    name: string;
    age: number;
    bio: string;
    degree: string;
    year: string;
    branch: string;
    university: string;
    campus: string;
    lifestyle: UserProfile["lifestyle"];
  }) => {
    if (!backendProfile) return;

    const token = getAccessToken();

    if (!token) {
      setError("Please log in to save profile info.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedBackend = await apiUpdateProfile(
        backendProfile.id,
        {
          display_name: updated.name,
          age: updated.age,
          degree: updated.degree,
          year: updated.year,
          branch: updated.branch,
          bio: updated.bio,
          university: updated.university,
          campus: updated.campus,
          lifestyle: updated.lifestyle,
        },
        token
      );

      setBackendProfile((previous) =>
        previous
          ? {
            ...previous,
            display_name: updatedBackend.display_name,
            age: updatedBackend.age,
            degree: updatedBackend.degree,
            year: updatedBackend.year,
            branch: updatedBackend.branch,
            bio: updatedBackend.bio,
            university: updatedBackend.university,
            campus: updatedBackend.campus,
            lifestyle: updatedBackend.lifestyle,
          }
          : previous
      );

      setProfile((previous) =>
        previous
          ? {
            ...previous,
            name: updated.name,
            age: updated.age,
            bio: updated.bio,
            degree: updated.degree,
            year: updated.year,
            branch: updated.branch,
            university: updated.university,
            campus: updated.campus,
            lifestyle: updated.lifestyle,
          }
          : null
      );

      notifySuccess("Profile information saved!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      const message = err instanceof Error ? err.message : "Failed to save profile.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  // Interests update handler
  const handleSaveInterests = async (updatedInterests: TagItem[]) => {
    if (!backendProfile) throw new Error("Your profile is not ready to save.");
    const token = getAccessToken();
    if (!token) throw new Error("Please log in to save interests.");

    setSaving(true);
    setError(null);
    try {
      const result = await apiUpdateProfile(
        backendProfile.id,
        { interests: updatedInterests },
        token
      );
      setBackendProfile((previous) =>
        previous ? { ...previous, interests: result.interests } : previous
      );
      setProfile((previous) =>
        previous ? { ...previous, interests: result.interests ?? updatedInterests } : previous
      );
      notifySuccess("Interests updated!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save interests.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIcebreakers = async (updatedIcebreakers: IcebreakerItem[]) => {
    if (!backendProfile) throw new Error("Your profile is not ready to save.");
    const token = getAccessToken();
    if (!token) throw new Error("Please log in to save icebreakers.");

    setSaving(true);
    setError(null);
    try {
      const result = await apiUpdateProfile(
        backendProfile.id,
        { icebreakers: updatedIcebreakers },
        token
      );
      setBackendProfile((previous) =>
        previous ? { ...previous, icebreakers: result.icebreakers } : previous
      );
      setProfile((previous) =>
        previous ? { ...previous, icebreakers: result.icebreakers ?? updatedIcebreakers } : previous
      );
      notifySuccess("Icebreakers updated!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save icebreakers.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSettingsTab = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#B365FC] animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 max-w-sm mb-4">
          <p className="text-sm font-semibold mb-1">Could not load profile</p>
          <p className="text-xs">{error}</p>
        </div>

        <button
          type="button"
          onClick={() => void loadProfile()}
          className="px-4 py-2 rounded-xl bg-[#B365FC] text-white text-xs font-semibold hover:bg-[#a14ce9] transition-colors"
        >
          Try Again
        </button>

        <div className="mt-6 w-full max-w-sm">
          <LogoutButton />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toast notifications */}
      {saveSuccessMsg && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in z-20">
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-between animate-fade-in z-20">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[10px] underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-1 pb-6 space-y-4">
        {/* 1. Profile Hero Card */}
        <ProfileHeroCard
          profile={profile}
          onEditAvatar={() => setIsPhotoManagerOpen(true)}
          onEditProfile={() => setIsEditInfoOpen(true)}
        />

        {/* 2. Profile Stats Row */}
        <ProfileStats
          stats={activeStats}
          onCompletenessClick={() => setIsEditInfoOpen(true)}
        />

        {/* 3. My Photos Section */}
        <div className="rounded-[22px] bg-[#14162B] border border-white/[0.08] p-4 shadow-sm">
          <MyPhotosSection
            photos={profile.photos}
            onOpenManager={() => setIsPhotoManagerOpen(true)}
          />
        </div>

        {/* 4. Profile Menu Sections */}
        <ProfileMenuSections
          onOpenMyInfo={() => setIsEditInfoOpen(true)}
          onOpenInterests={() => setIsEditInterestsOpen(true)}
          onOpenIcebreakers={() => setIsEditIcebreakersOpen(true)}
          onOpenSettings={(section) => handleOpenSettingsTab(section)}
          onOpenSupport={() => handleOpenSettingsTab("support")}
        />

        {/* Account / Logout */}
        <div className="rounded-[22px] bg-[#14162B] border border-white/[0.08] p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
          <LogoutButton />
        </div>
      </div>

      {/* Modals & Bottom Sheets */}
      <PhotoManagerModal
        photos={photoManagerPhotos}
        isOpen={isPhotoManagerOpen}
        onClose={() => setIsPhotoManagerOpen(false)}
        onSavePhotos={handleSavePhotos}
      />

      <EditInfoModal
        profile={profile}
        isOpen={isEditInfoOpen}
        onClose={() => setIsEditInfoOpen(false)}
        onSave={handleSaveInfo}
      />

      <EditInterestsModal
        currentInterests={profile.interests}
        isOpen={isEditInterestsOpen}
        onClose={() => setIsEditInterestsOpen(false)}
        onSave={handleSaveInterests}
      />

      <EditIcebreakersModal
        currentIcebreakers={profile.icebreakers}
        isOpen={isEditIcebreakersOpen}
        onClose={() => setIsEditIcebreakersOpen(false)}
        onSave={handleSaveIcebreakers}
      />

      <SettingsModal
        initialTab={settingsTab}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
