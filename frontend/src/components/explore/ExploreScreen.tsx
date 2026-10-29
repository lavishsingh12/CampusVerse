"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  EXPLORE_CATEGORIES,
  ExploreCategory,
  getBlindDateProfiles,
} from "../../data/mockExplore";
import { ExploreCategoryCard } from "./ExploreCategoryCard";
import { ExploreProfileBrowser } from "./ExploreProfileBrowser";
import {
  getExploreCategoryCounts,
  getExploreCategoryProfiles,
  toDiscoverCardProfile,
} from "../../lib/discover";
import { getAccessToken } from "../../lib/token";
import type { Profile } from "../../types/profile";

export function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState<ExploreCategory | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [categoryCountError, setCategoryCountError] = useState<string | null>(null);
  const [categoryProfiles, setCategoryProfiles] = useState<Profile[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const categoryRequestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setCategoryCountError("Please log in to load Explore member counts.");
      return;
    }

    void getExploreCategoryCounts(token)
      .then((counts) => {
        if (!cancelled) {
          setCategoryCounts(counts);
          setCategoryCountError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCategoryCountError(
            error instanceof Error ? error.message : "Could not load Explore member counts."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCategory = useCallback(async (category: ExploreCategory) => {
    const requestId = ++categoryRequestIdRef.current;
    setActiveCategory(category);
    setCategoryProfiles([]);
    setCategoryError(null);

    if (category.id === "blinddate") {
      setCategoryProfiles(getBlindDateProfiles());
      setCategoryLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setCategoryLoading(false);
      setCategoryError("Please log in to browse Explore profiles.");
      return;
    }

    setCategoryLoading(true);
    try {
      const result = await getExploreCategoryProfiles(category.id, token);
      if (categoryRequestIdRef.current !== requestId) return;
      setCategoryProfiles(result.profiles.map(toDiscoverCardProfile));
      setActiveCategory((current) =>
        current?.id === category.id
          ? { ...current, memberCount: result.member_count }
          : current
      );
    } catch (error) {
      if (categoryRequestIdRef.current === requestId) {
        setCategoryError(
          error instanceof Error ? error.message : "Could not load profiles for this category."
        );
      }
    } finally {
      if (categoryRequestIdRef.current === requestId) setCategoryLoading(false);
    }
  }, []);

  const handleBack = () => {
    categoryRequestIdRef.current += 1;
    setActiveCategory(null);
    setCategoryLoading(false);
  };

  // ── Category Profile Browser ─────────────────────────────────────────────
  if (activeCategory) {
    return (
      <ExploreProfileBrowser
        key={activeCategory.id}
        category={activeCategory}
        profiles={categoryProfiles}
        loading={categoryLoading}
        error={categoryError}
        onBack={handleBack}
      />
    );
  }

  const categories = EXPLORE_CATEGORIES.map((category) =>
    category.id === "blinddate"
      ? category
      : { ...category, memberCount: categoryCounts[category.id] ?? null }
  );

  // ── Explore Landing Grid ─────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Title */}
      <div className="px-4 pt-2 pb-3 shrink-0">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Explore</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Find people with similar interests and experiences
        </p>
      </div>

      {/* 2-Column Category Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {categoryCountError && (
          <p role="alert" className="mb-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">
            {categoryCountError}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <ExploreCategoryCard
              key={category.id}
              category={category}
              onClick={() => void openCategory(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
