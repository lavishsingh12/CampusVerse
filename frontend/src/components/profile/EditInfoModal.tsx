"use client";

import React, { useState } from "react";
import { UserProfile, UserProfileLifestyle } from "../../data/mockUserProfile";
import { CloseIcon, CheckIcon } from "../common/Icons";

const HEIGHT_OPTIONS = [
  "4'10\" (147 cm)",
  "4'11\" (150 cm)",
  "5'0\" (152 cm)",
  "5'1\" (155 cm)",
  "5'2\" (157 cm)",
  "5'3\" (160 cm)",
  "5'4\" (163 cm)",
  "5'5\" (165 cm)",
  "5'6\" (168 cm)",
  "5'7\" (170 cm)",
  "5'8\" (173 cm)",
  "5'9\" (175 cm)",
  "5'10\" (178 cm)",
  "5'11\" (180 cm)",
  "6'0\" (183 cm)",
  "6'1\" (185 cm)",
  "6'2\" (188 cm)",
  "6'3\" (191 cm)",
  "6'4\" (193 cm)",
  "6'5\" (195 cm)",
  "6'6\" (198 cm)",
];

const WORKOUT_OPTIONS = [
  "Rarely / Never",
  "Occasionally",
  "Active (3–4x week)",
  "Daily",
];

const LOOKING_FOR_OPTIONS = [
  "Meaningful connection",
  "Study buddy",
  "Friendship",
  "Coffee / casual meetup",
  "Romantic connection",
  "Long-term relationship",
  "Short-term fun",
];

function isPresetLookingFor(value: string) {
  return LOOKING_FOR_OPTIONS.includes(value.trim());
}

interface EditInfoModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: {
    name: string;
    age: number;
    bio: string;
    degree: string;
    year: string;
    branch: string;
    university: string;
    campus: string;
    lifestyle: UserProfileLifestyle;
  }) => Promise<void>;
}

export function EditInfoModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: EditInfoModalProps) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [bio, setBio] = useState(profile.bio);
  const [degree, setDegree] = useState(profile.degree);
  const [year, setYear] = useState(profile.year);
  const [branch, setBranch] = useState(profile.branch);
  const [university, setUniversity] = useState(profile.university);
  const [campus, setCampus] = useState(profile.campus);

  const [height, setHeight] = useState(profile.lifestyle.height);
  const [drinking, setDrinking] = useState(profile.lifestyle.drinking);
  const [smoking, setSmoking] = useState(profile.lifestyle.smoking);
  const [workout, setWorkout] = useState(profile.lifestyle.workout);
  const [pets, setPets] = useState(profile.lifestyle.pets);
  const [zodiac, setZodiac] = useState(profile.lifestyle.zodiac);
  const [lookingFor, setLookingFor] = useState(profile.lifestyle.lookingFor);
  const [lookingForCustom, setLookingForCustom] = useState(
    !isPresetLookingFor(profile.lifestyle.lookingFor) ? profile.lifestyle.lookingFor : ""
  );
  const [lookingForOption, setLookingForOption] = useState(
    isPresetLookingFor(profile.lifestyle.lookingFor) ? profile.lifestyle.lookingFor : "Custom"
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    setName(profile.name);
    setAge(profile.age);
    setBio(profile.bio);
    setDegree(profile.degree);
    setYear(profile.year);
    setBranch(profile.branch);
    setUniversity(profile.university);
    setCampus(profile.campus);
    setHeight(profile.lifestyle.height);
    setDrinking(profile.lifestyle.drinking);
    setSmoking(profile.lifestyle.smoking);
    setWorkout(profile.lifestyle.workout);
    setPets(profile.lifestyle.pets);
    setZodiac(profile.lifestyle.zodiac);
    setLookingFor(profile.lifestyle.lookingFor);
    setLookingForCustom(
      !isPresetLookingFor(profile.lifestyle.lookingFor) ? profile.lifestyle.lookingFor : ""
    );
    setLookingForOption(
      isPresetLookingFor(profile.lifestyle.lookingFor) ? profile.lifestyle.lookingFor : "Custom"
    );
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const finalLookingFor = lookingForOption === "Custom"
    ? lookingForCustom.trim()
    : lookingForOption;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        name,
        age: Number(age),
        bio,
        degree,
        year,
        branch,
        university,
        campus,
        lifestyle: {
          height,
          drinking,
          smoking,
          workout,
          pets,
          zodiac,
          lookingFor: finalLookingFor || lookingFor,
        },
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[88dvh] rounded-t-[28px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Edit Profile Info</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your basic details, campus &amp; lifestyle
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close edit profile"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 space-y-5">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B365FC]">
              Basic Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="17"
                  max="35"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Bio Quote
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={140}
                placeholder="Share a short glimpse of your campus vibe..."
                className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC] resize-none"
              />
              <span className="text-[10px] text-slate-500 float-right mt-0.5">
                {bio.length}/140
              </span>
            </div>
          </div>

          {/* Section 2: Education & Campus */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B365FC]">
              Education &amp; Campus
            </span>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                University
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                maxLength={150}
                className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. B.Tech"
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgrad">Postgrad</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Branch / Major
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. CSE (AI & DS)"
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Campus Location
                </label>
                <input
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. Jaipur Main Campus"
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lifestyle & Details */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B365FC]">
              Lifestyle &amp; Habits
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Height
                </label>
                <select
                  value={HEIGHT_OPTIONS.includes(height) ? height : height || "5'10\" (178 cm)"}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                >
                  {HEIGHT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  {!HEIGHT_OPTIONS.includes(height) && height && (
                    <option value={height}>Custom: {height}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Drinking
                </label>
                <select
                  value={drinking}
                  onChange={(e) => setDrinking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                >
                  <option value="Never">Never</option>
                  <option value="Socially">Socially</option>
                  <option value="Regularly">Regularly</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Smoking
                </label>
                <select
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                >
                  <option value="Never">Never</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Regularly">Regularly</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Workout / Gym
                </label>
                <select
                  value={WORKOUT_OPTIONS.includes(workout) ? workout : (workout || WORKOUT_OPTIONS[2])}
                  onChange={(e) => setWorkout(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                >
                  {WORKOUT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  {!WORKOUT_OPTIONS.includes(workout) && workout && (
                    <option value={workout}>Custom: {workout}</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Looking For
              </label>
              <select
                value={lookingForOption}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setLookingForOption(nextValue);
                  if (nextValue === "Custom") {
                    setLookingFor("Custom");
                    return;
                  }
                  setLookingFor(nextValue);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
              >
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
                <option value="Custom">Custom</option>
              </select>
              {lookingForOption === "Custom" && (
                <input
                  type="text"
                  value={lookingForCustom}
                  onChange={(e) => {
                    setLookingForCustom(e.target.value);
                    setLookingFor(e.target.value);
                  }}
                  maxLength={80}
                  placeholder="Describe your preference"
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                />
              )}
            </div>
          </div>

          <div className="pt-2">
            {saveError && (
              <p role="alert" className="mb-3 text-xs text-red-300">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <span>Saving...</span> : <><CheckIcon className="w-4 h-4" /><span>Save Profile Changes</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
