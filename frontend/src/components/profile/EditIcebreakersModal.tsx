"use client";

import React, { useState } from "react";
import { IcebreakerItem } from "../../types/profile";
import { ICEBREAKER_PROMPTS } from "../../data/mockUserProfile";
import { CloseIcon, CheckIcon, PlusIcon, TrashIcon } from "../common/Icons";

interface EditIcebreakersModalProps {
  currentIcebreakers: IcebreakerItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: IcebreakerItem[]) => void;
}

export function EditIcebreakersModal({
  currentIcebreakers,
  isOpen,
  onClose,
  onSave,
}: EditIcebreakersModalProps) {
  const [icebreakers, setIcebreakers] = useState<IcebreakerItem[]>(currentIcebreakers);
  const [selectedPrompt, setSelectedPrompt] = useState(ICEBREAKER_PROMPTS[0]);
  const [newAnswer, setNewAnswer] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  React.useEffect(() => {
    setIcebreakers(currentIcebreakers);
  }, [currentIcebreakers, isOpen]);

  if (!isOpen) return null;

  const handleUpdateText = (index: number, text: string) => {
    const updated = [...icebreakers];
    updated[index] = { ...updated[index], text };
    setIcebreakers(updated);
  };

  const handleDelete = (index: number) => {
    setIcebreakers(icebreakers.filter((_, i) => i !== index));
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    if (icebreakers.length >= 3) return; // Limit to 3 icebreakers

    setIcebreakers([
      ...icebreakers,
      {
        prompt: selectedPrompt,
        text: newAnswer.trim(),
      },
    ]);
    setNewAnswer("");
    setShowAddForm(false);
  };

  const handleSave = () => {
    onSave(icebreakers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[85vh] rounded-t-[28px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Campus Icebreakers</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fun prompts to spark better conversations with matches ({icebreakers.length}/3)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close icebreakers modal"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {/* Active Icebreakers List */}
          <div className="space-y-3">
            {icebreakers.map((item, idx) => (
              <div
                key={`icebreaker-${idx}`}
                className="p-3.5 rounded-2xl bg-[#16182D] border border-white/[0.08] relative group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#B365FC] tracking-wide">
                    {item.prompt}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    aria-label="Delete icebreaker"
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={item.text}
                  onChange={(e) => handleUpdateText(idx, e.target.value)}
                  rows={2}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-xl bg-[#111322] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B365FC] resize-none"
                />
              </div>
            ))}

            {icebreakers.length === 0 && (
              <div className="p-6 text-center rounded-2xl bg-[#16182D]/50 border border-white/5">
                <p className="text-xs text-slate-400">
                  You haven&apos;t added any icebreakers yet. Add a prompt below to get more conversation starters!
                </p>
              </div>
            )}
          </div>

          {/* Add New Icebreaker Form */}
          {icebreakers.length < 3 && (
            <div>
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 rounded-2xl border border-dashed border-white/20 hover:border-[#B365FC]/60 bg-[#16182D]/40 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                >
                  <PlusIcon className="w-4 h-4 text-[#B365FC]" />
                  <span>Add Another Icebreaker</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddNew}
                  className="p-4 rounded-2xl bg-[#16182D] border border-[#B365FC]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Choose Prompt
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111322] border border-white/10 text-white text-xs focus:outline-none focus:border-[#B365FC]"
                  >
                    {ICEBREAKER_PROMPTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Type your witty answer here..."
                    rows={2}
                    maxLength={150}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#111322] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B365FC] resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-[#B365FC] text-white text-xs font-bold shadow-md hover:bg-[#a14fe8] transition-colors"
                  >
                    Add Icebreaker
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0E101D] flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            {icebreakers.length} active prompts
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Save Icebreakers</span>
          </button>
        </div>
      </div>
    </div>
  );
}
