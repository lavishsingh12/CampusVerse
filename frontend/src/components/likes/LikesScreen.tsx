"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LikesTabs, LikesTabType } from "./LikesTabs";
import { LikeCard } from "./LikeCard";
import { HeartIcon, PaperAirplaneIcon } from "../common/Icons";
import { getReceivedLikes, getSentLikes, LikeItem } from "../../lib/likes";
import { getAccessToken } from "../../lib/token";

export function LikesScreen() {
  const [activeTab, setActiveTab] = useState<LikesTabType>("likes");

  const [receivedLikes, setReceivedLikes] = useState<LikeItem[]>([]);
  const [sentLikes, setSentLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLikes = useCallback(async (tab: LikesTabType) => {
    const token = getAccessToken();
    if (!token) {
      setError("Please log in to view likes.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (tab === "likes") {
        const data = await getReceivedLikes(token);
        setReceivedLikes(data);
      } else {
        const data = await getSentLikes(token);
        setSentLikes(data);
      }
    } catch (err) {
      console.error("Failed to load likes:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load likes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLikes(activeTab);
  }, [activeTab, loadLikes]);

  const isLikesTab = activeTab === "likes";
  const items = isLikesTab ? receivedLikes : sentLikes;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* 1. Likes / You Liked Tabs */}
      <LikesTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* 2. Subheader Info Row */}
      <div className="px-4.5 pt-3 pb-2.5 flex items-center gap-2.5 shrink-0 px-4">
        {isLikesTab ? (
          <div className="text-[#E93C9A] shrink-0">
            <HeartIcon className="w-5 h-5 fill-current" filled={true} />
          </div>
        ) : (
          <div className="text-[#E93C9A] shrink-0 -rotate-12">
            <PaperAirplaneIcon className="w-5 h-5" />
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <h2 className="text-base font-bold text-white tracking-tight">
            {isLikesTab ? `Likes (${items.length})` : `You Liked (${items.length})`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {isLikesTab
              ? "These students have liked you"
              : "These are the students you liked"}
          </p>
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-1 pb-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-[#B365FC]" />
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300 w-full max-w-sm">
              {error}
            </div>
            <button
              type="button"
              onClick={() => void loadLikes(activeTab)}
              className="mt-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#181B30] text-3xl">
              {isLikesTab ? "💜" : "💌"}
            </div>
            <h2 className="text-base font-bold text-white">
              {isLikesTab ? "No likes yet" : "You haven't liked anyone yet"}
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              {isLikesTab
                ? "When someone likes your profile, they'll appear here."
                : "Head to Discover to start liking profiles!"}
            </p>
            <button
              type="button"
              onClick={() => void loadLikes(activeTab)}
              className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Profile Card Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <LikeCard
                key={`${activeTab}-${item.id}`}
                item={item}
                isBlurred={isLikesTab}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
