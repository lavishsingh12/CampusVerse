"use client";

import React, { useState } from "react";
import { PHOTO_CATALOG } from "../../data/mockUserProfile";
import { CloseIcon, TrashIcon, PlusIcon, CheckIcon } from "../common/Icons";

interface PhotoManagerModalProps {
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
  onSavePhotos: (updatedPhotos: string[]) => void;
}

export function PhotoManagerModal({
  photos: initialPhotos,
  isOpen,
  onClose,
  onSavePhotos,
}: PhotoManagerModalProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync state if initialPhotos changes when opened
  React.useEffect(() => {
    setPhotos(initialPhotos);
    setFeedbackMessage(null);
  }, [initialPhotos, isOpen]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3200);
  };

  // Move photo left
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setPhotos(updated);
  };

  // Move photo right
  const handleMoveRight = (index: number) => {
    if (index === photos.length - 1) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setPhotos(updated);
  };

  // Set as Main photo (moves to index 0)
  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setPhotos(updated);
    showFeedback("Main photo updated!");
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    if (photos.length <= 2) {
      showFeedback("⚠️ Minimum 2 photos are required for your campus profile.");
      return;
    }
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    showFeedback("Photo removed.");
  };

  // Add photo from catalog
  const handleAddPhoto = (url: string) => {
    if (photos.length >= 6) {
      showFeedback("⚠️ Maximum limit of 6 photos reached.");
      return;
    }
    if (photos.includes(url)) {
      showFeedback("This photo is already in your gallery.");
      return;
    }
    setPhotos([...photos, url]);
    showFeedback("Photo added to gallery!");
  };

  const handleSave = () => {
    onSavePhotos(photos);
    onClose();
  };

  // Photos from catalog not yet in user photos
  const availableToAdd = PHOTO_CATALOG.filter((url) => !photos.includes(url));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[85vh] rounded-t-[28px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Manage Photos</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {photos.length} of 6 photos • Minimum 2 required
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo manager"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="px-5 py-2 bg-gradient-to-r from-[#9B42F6]/20 to-[#E93C9A]/20 border-b border-[#B365FC]/30 text-xs text-slate-200 font-medium flex items-center justify-between">
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
          {/* Current Photos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Gallery (Reorder &amp; Main)
              </span>
              <span className="text-xs font-semibold text-[#B365FC]">
                {photos.length}/6 slots used
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {photos.map((url, idx) => {
                const isMain = idx === 0;
                return (
                  <div
                    key={`${url}-${idx}`}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border transition-all ${
                      isMain
                        ? "border-[#B365FC] ring-2 ring-[#B365FC]/30 shadow-lg"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Profile photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge: Main or Slot Number */}
                    <div className="absolute top-2 left-2">
                      {isMain ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#B365FC] text-white text-[10px] font-bold shadow-md uppercase tracking-wider">
                          Main
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 text-[10px] font-medium border border-white/10">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete button (disabled if <= 2 photos) */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      disabled={photos.length <= 2}
                      aria-label={`Remove photo ${idx + 1}`}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        photos.length <= 2
                          ? "bg-black/40 text-slate-500 cursor-not-allowed"
                          : "bg-black/60 hover:bg-rose-500 text-white backdrop-blur-md"
                      }`}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom controls overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-1">
                      {/* Move Left */}
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        disabled={idx === 0}
                        aria-label="Move photo left"
                        className="px-2 py-1 rounded bg-white/10 text-white text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        ←
                      </button>

                      {/* Set as Main */}
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(idx)}
                          className="px-2 py-1 rounded bg-[#B365FC]/30 hover:bg-[#B365FC]/50 text-white text-[10px] font-semibold truncate border border-[#B365FC]/40"
                        >
                          Make Main
                        </button>
                      )}

                      {/* Move Right */}
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        disabled={idx === photos.length - 1}
                        aria-label="Move photo right"
                        className="px-2 py-1 rounded bg-white/10 text-white text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Photos Section */}
          {photos.length < 6 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Add Photo ({6 - photos.length} slots left)
                </span>
              </div>

              {/* Direct Image URL input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL..."
                  id="custom-photo-url-input"
                  className="flex-1 bg-[#181B30] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B365FC]/70"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const target = e.currentTarget;
                      const val = target.value.trim();
                      if (val) {
                        handleAddPhoto(val);
                        target.value = "";
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("custom-photo-url-input") as HTMLInputElement | null;
                    if (input && input.value.trim()) {
                      handleAddPhoto(input.value.trim());
                      input.value = "";
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#B365FC] text-white text-xs font-semibold hover:bg-[#a14ce9] transition-colors"
                >
                  Add URL
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Or pick from curated campus photos below:
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {availableToAdd.slice(0, 6 - photos.length).map((url, i) => (
                  <button
                    key={`available-${i}`}
                    type="button"
                    onClick={() => handleAddPhoto(url)}
                    className="relative group rounded-xl overflow-hidden aspect-[4/5] border border-dashed border-white/20 hover:border-[#B365FC] transition-all bg-slate-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Available catalog photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#B365FC] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <PlusIcon className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Done button */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0E101D] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            {photos.length < 2 ? "Requires min 2 photos" : `${photos.length} photos ready`}
          </span>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Save Photos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
