"use client";

import React, { useState } from "react";
import { TagItem } from "../../types/profile";
import { AVAILABLE_INTERESTS } from "../../data/mockUserProfile";
import { CloseIcon, CheckIcon, PlusIcon } from "../common/Icons";

interface EditInterestsModalProps {
  currentInterests: TagItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TagItem[]) => Promise<void>;
}

export function EditInterestsModal({
  currentInterests,
  isOpen,
  onClose,
  onSave,
}: EditInterestsModalProps) {
  const [selected, setSelected] = useState<TagItem[]>(currentInterests);
  const [customLabel, setCustomLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    setSelected(currentInterests);
  }, [currentInterests, isOpen]);

  if (!isOpen) return null;

  const toggleInterest = (item: TagItem) => {
    const exists = selected.some((s) => s.label.toLowerCase() === item.label.toLowerCase());
    if (exists) {
      if (selected.length <= 3) return;
      setSelected(selected.filter((s) => s.label.toLowerCase() !== item.label.toLowerCase()));
    } else {
      if (selected.length >= 10) return; // Limit to 10 max
      setSelected([...selected, item]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customLabel.trim();
    if (!trimmed || selected.length >= 10) return;
    if (selected.some((s) => s.label.toLowerCase() === trimmed.toLowerCase())) {
      setCustomLabel("");
      return;
    }
    const newTag: TagItem = {
      id: `custom-${Date.now()}`,
      label: trimmed,
      emoji: "✨",
    };
    setSelected([...selected, newTag]);
    setCustomLabel("");
  };

  const handleSave = async () => {
    if (selected.length < 3) {
      setSaveError("Select at least 3 interests before saving.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(selected);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save interests.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[85dvh] rounded-t-[28px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Interests &amp; Hobbies</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select 3–10 interests to show on your campus profile ({selected.length}/10 selected)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close interests modal"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 space-y-5">
          {/* Selected Chips */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Your Selected Interests
            </span>
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-2xl bg-[#16182D] border border-white/[0.07]">
              {selected.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-semibold shadow-md active:scale-95 transition-all group"
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                  <span className="text-white/70 group-hover:text-white text-[11px] ml-0.5">✕</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Tag */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Add custom interest (e.g. Hackathons, Debating)..."
              maxLength={24}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#181B30] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B365FC]"
            />
            <button
              type="submit"
              disabled={!customLabel.trim() || selected.length >= 10 || saving}
              className="px-4 py-2 rounded-xl bg-[#B365FC]/20 hover:bg-[#B365FC]/30 text-[#B365FC] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold border border-[#B365FC]/30 transition-all flex items-center gap-1"
            >
              <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </form>

          {/* Discover Catalog */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Popular Campus Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((item) => {
                const isSelected = selected.some(
                  (s) => s.label.toLowerCase() === item.label.toLowerCase()
                );
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${isSelected
                      ? "bg-[#B365FC]/30 border-[#B365FC] text-white shadow-sm"
                      : "bg-[#181B30] border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                      }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                    {isSelected && <span className="text-[#B365FC] font-bold text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0E101D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            {selected.length} interests active
          </span>
          {saveError && <p role="alert" className="text-xs text-red-300">{saveError}</p>}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || selected.length < 3}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <span>Saving...</span> : <><CheckIcon className="w-4 h-4" /><span>Save Interests</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
