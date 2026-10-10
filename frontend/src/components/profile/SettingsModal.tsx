"use client";

import React, { useState } from "react";
import {
  CloseIcon,
  ShieldLockIcon,
  QuestionCircleIcon,
  BackIcon,
  CheckIcon,
} from "../common/Icons";

export type SettingsTab = "settings" | "privacy" | "notifications" | "support";

interface SettingsModalProps {
  initialTab?: SettingsTab;
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({
  initialTab = "settings",
  isOpen,
  onClose,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Mock settings toggles state
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const [campusOnly, setCampusOnly] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [messageSounds, setMessageSounds] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);

  // FAQs accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "How does CampusVerse verify student status?",
      a: "CampusVerse verifies your identity using your official college/university email address (.edu / .ac.in) or student ID card verification.",
    },
    {
      q: "Can people from other colleges see my profile?",
      a: "By default, your profile is prioritized for your campus batch. You can toggle 'Same Campus Only' under Privacy settings to restrict visibility solely to your campus.",
    },
    {
      q: "How are match percentages calculated?",
      a: "Our algorithm compares common interests, branch/degree synergy, campus activities, and icebreaker compatibility.",
    },
    {
      q: "What is Ghost Mode?",
      a: "Ghost Mode temporarily hides your profile from the Discover card deck without losing your existing matches or ongoing chats.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[88vh] rounded-t-[28px] sm:rounded-[28px] bg-[#121424] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            {activeTab !== "settings" && (
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="p-1 -ml-1 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <BackIcon className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {activeTab === "settings" && "App Settings"}
                {activeTab === "privacy" && "Privacy Controls"}
                {activeTab === "notifications" && "Notification Preferences"}
                {activeTab === "support" && "Help & Support"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === "settings" && "Manage your app preferences and account"}
                {activeTab === "privacy" && "Control your visibility & campus safety"}
                {activeTab === "notifications" && "Customize your chat & match alerts"}
                {activeTab === "support" && "Guides, safety tips & campus support"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Quick Selector */}
        <div className="flex border-b border-white/[0.08] px-5 bg-[#0F1120] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === "settings"
                ? "border-[#B365FC] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === "privacy"
                ? "border-[#B365FC] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === "notifications"
                ? "border-[#B365FC] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === "support"
                ? "border-[#B365FC] text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Support
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
          {/* TAB 1: General Settings */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#16182D] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Enable Discovery
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Show your card in the campus Discover deck
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={discoveryEnabled}
                    onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Same Campus Only
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Only match with students from Poornima University
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={campusOnly}
                    onChange={(e) => setCampusOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#16182D] border border-white/[0.08] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Campus Account
                </span>
                <p className="text-xs text-slate-300">
                  Logged in as <strong className="text-white">lavish@poornima.edu.in</strong>
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    ✓ Verified Student
                  </span>
                  <span className="text-[11px] text-slate-500">Active Campus Pass</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Privacy */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#16182D] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Ghost Mode
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Hide profile from deck without losing chats
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ghostMode}
                    onChange={(e) => setGhostMode(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Show Online Status
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Display green active dot in chat list
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showActiveStatus}
                    onChange={(e) => setShowActiveStatus(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#16182D]/60 border border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#B365FC] mb-1">
                  <ShieldLockIcon className="w-4 h-4" />
                  <span>Student Safety &amp; Trust</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your phone number, exact GPS coordinates, and student ID are never shared publicly with other students.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#16182D] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Push Notifications
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Receive alerts on your mobile device
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      New Match Alerts
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Notify immediately when you match with someone
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matchAlerts}
                    onChange={(e) => setMatchAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      In-App Message Sounds
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Play subtle sound when messages arrive
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={messageSounds}
                    onChange={(e) => setMessageSounds(e.target.checked)}
                    className="w-4 h-4 accent-[#B365FC] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Support & FAQs */}
          {activeTab === "support" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Frequently Asked Questions
                </span>
                <div className="rounded-2xl bg-[#16182D] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
                  {faqs.map((faq, i) => (
                    <div key={i} className="p-3.5">
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full text-left flex items-center justify-between gap-2 text-xs font-semibold text-white"
                      >
                        <span>{faq.q}</span>
                        <span className="text-[#B365FC]">{expandedFaq === i ? "−" : "+"}</span>
                      </button>
                      {expandedFaq === i && (
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181B34] to-[#121424] border border-white/10 text-center space-y-2">
                <QuestionCircleIcon className="w-6 h-6 text-[#B365FC] mx-auto" />
                <h4 className="text-xs font-bold text-white">Need Campus Help?</h4>
                <p className="text-[11px] text-slate-300">
                  Contact the CampusVerse Student Safety &amp; Ambassador Team.
                </p>
                <a
                  href="mailto:support@campusverse.app"
                  className="inline-block mt-1 px-4 py-1.5 rounded-full bg-[#B365FC]/20 border border-[#B365FC]/40 text-[#B365FC] text-xs font-semibold hover:bg-[#B365FC]/30 transition-colors"
                >
                  support@campusverse.app
                </a>
              </div>

              <p className="text-[10px] text-slate-500 text-center">
                CampusVerse v1.2.0 • Poornima University Edition
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0E101D] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9B42F6] to-[#E93C9A] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
