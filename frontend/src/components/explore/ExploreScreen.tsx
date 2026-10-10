"use client";

import React, { useState } from "react";
import { EXPLORE_CATEGORIES, ExploreCategory, getProfilesForCategory } from "../../data/mockExplore";
import { ExploreCategoryCard } from "./ExploreCategoryCard";
import { ExploreProfileBrowser } from "./ExploreProfileBrowser";

export function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState<ExploreCategory | null>(null);

  // ── Category Profile Browser ─────────────────────────────────────────────
  if (activeCategory) {
    const profiles = getProfilesForCategory(activeCategory.id);
    return (
      <ExploreProfileBrowser
        category={activeCategory}
        profiles={profiles}
        onBack={() => setActiveCategory(null)}
      />
    );
  }

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
        <div className="grid grid-cols-2 gap-3">
          {EXPLORE_CATEGORIES.map((category) => (
            <ExploreCategoryCard
              key={category.id}
              category={category}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
