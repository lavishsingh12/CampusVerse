
"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  type ConversationItem,
  type MatchProfile,
} from "../../types/chat";

import {
  getReceivedRequests,
  acceptMessageRequest,
  declineMessageRequest,
  getRequestConversations,
  type MessageRequest,
} from "../../lib/messageRequests";

import { getMyMatches, type ApiMatch } from "../../lib/chat";
import { getAccessToken, getUserId } from "../../lib/token";
import { resolveApiMediaUrl } from "../../lib/api";
import { MatchStrip } from "./MatchStrip";
import { ChatList } from "./ChatList";
import { IndividualChatScreen } from "./IndividualChatScreen";
import { SearchIcon } from "../common/Icons";

function formatConversationTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function ChatsScreen() {
  const [activeConversation, setActiveConversation] =
    useState<ConversationItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [activeTab, setActiveTab] = useState<"chats" | "requests">("chats");

  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);
  const [requestNotice, setRequestNotice] = useState("");

  const [realMatches, setRealMatches] = useState<ConversationItem[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState("");

  const loadMatches = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setMatchesError("Please log in to view your matches.");
      return;
    }

    setMatchesLoading(true);
    setMatchesError("");

    try {
      const [data, requestConversations] = await Promise.all([
        getMyMatches(token),
        getRequestConversations(token),
      ]);

      const mappedMatches: ConversationItem[] = data.map((match) => {
        const lastMsgText = match.last_message
          ? match.last_message.content
          : "You're matched! Say hello 👋";
        const lastMsgTime = match.last_message
          ? formatConversationTime(match.last_message.created_at)
          : "";

        return {
          id: String(match.id),
          name: match.user.profile?.display_name || match.user.name,
          avatar: match.user.profile?.avatar
            ? resolveApiMediaUrl(match.user.profile.avatar)
            : "",
          isOnline: true,
          lastMessage: lastMsgText,
          timestamp: lastMsgTime,
          messages: [],
          otherUserId: match.user.id,
        };
      });

      const mappedRequests: ConversationItem[] = requestConversations.map((request) => ({
        id: String(request.id),
        name: request.other_user.name,
        avatar: "",
        isOnline: true,
        lastMessage: request.pending_messages?.at(-1) || request.content,
        timestamp: formatConversationTime(request.created_at),
        messages: [],
        otherUserId: request.other_user.id,
        conversationKind: "request",
        requestStatus: request.status === "accepted" ? "accepted" : "pending",
        canSendPending: request.sender_id === getUserId(),
      }));
      setRealMatches([...mappedRequests, ...mappedMatches]);
    } catch (error) {
      console.error("Failed to load matches:", error);

      setMatchesError(
        error instanceof Error
          ? error.message
          : "Unable to load matches."
      );
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  async function loadRequests() {
    const token = getAccessToken();

    if (!token) {
      setRequestsError("Please log in to view your message requests.");
      return;
    }

    setRequestsLoading(true);
    setRequestsError("");
    setRequestNotice("");

    try {
      const data = await getReceivedRequests(token);
      setRequests(data);
    } catch (error) {
      setRequestsError(
        error instanceof Error
          ? error.message
          : "Unable to load message requests."
      );
    } finally {
      setRequestsLoading(false);
    }
  }

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    if (activeTab === "requests") {
      void loadRequests();
    }
  }, [activeTab]);

  async function handleAccept(requestId: number) {
    const token = getAccessToken();

    if (!token) {
      setRequestsError("Please log in to continue.");
      return;
    }

    setBusyRequestId(requestId);
    setRequestsError("");
    setRequestNotice("");

    try {
      await acceptMessageRequest(requestId, token);

      setRequests((current) =>
        current.filter((request) => request.id !== requestId)
      );

      await loadMatches();

      setRequestNotice(
        "Request accepted! Your conversation is now available in Chats."
      );
    } catch (error) {
      setRequestsError(
        error instanceof Error ? error.message : "Could not accept request."
      );
    } finally {
      setBusyRequestId(null);
    }
  }

  async function handleDecline(requestId: number) {
    const token = getAccessToken();

    if (!token) {
      setRequestsError("Please log in to continue.");
      return;
    }

    setBusyRequestId(requestId);
    setRequestsError("");
    setRequestNotice("");

    try {
      await declineMessageRequest(requestId, token);

      setRequests((current) =>
        current.filter((request) => request.id !== requestId)
      );

      setRequestNotice("Message request declined.");
    } catch (error) {
      setRequestsError(
        error instanceof Error ? error.message : "Could not decline request."
      );
    } finally {
      setBusyRequestId(null);
    }
  }

  const realMatchProfiles: MatchProfile[] = realMatches.map((match) => ({
    id: match.id,
    name: match.name,
    avatar: match.avatar,
    isOnline: match.isOnline ?? false,
  }));

  if (activeConversation) {
    return (
      <IndividualChatScreen
        conversation={activeConversation}
        onBack={() => {
          setActiveConversation(null);
          void loadMatches();
        }}
        onMessageSent={() => {
          void loadMatches();
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pb-3 pt-1 shrink-0">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Chat
        </h1>
        <p className="text-xs text-slate-400 font-normal mt-0.5">
          Your matches and conversations
        </p>
      </div>

      {/* Search */}
      <div className="px-5 pb-3 shrink-0">
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] bg-[#181B30] border transition-all ${searchFocused
            ? "border-[#B365FC]/50"
            : "border-white/[0.08]"
            }`}
        >
          <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />

          <input
            type="text"
            placeholder={
              activeTab === "chats"
                ? "Search conversations..."
                : "Search message requests..."
            }
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none min-w-0"
          />
        </div>
      </div>

      {/* Chats / Requests tabs */}
      <div className="px-5 pb-3 shrink-0">
        <div className="flex rounded-xl bg-[#181B30] p-1 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("chats");
              setSearchQuery("");
              setRequestsError("");
              setRequestNotice("");
              void loadMatches();
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${activeTab === "chats"
              ? "bg-[#B365FC] text-white"
              : "text-slate-400 hover:text-white"
              }`}
          >
            Chats
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("requests");
              setSearchQuery("");
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${activeTab === "requests"
              ? "bg-[#B365FC] text-white"
              : "text-slate-400 hover:text-white"
              }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        {activeTab === "chats" ? (
          <>
            {matchesError && (
              <div className="mx-5 mb-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                {matchesError}
                <button
                  type="button"
                  onClick={() => void loadMatches()}
                  className="ml-2 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            <MatchStrip
              matches={realMatchProfiles}
              onSelectMatch={(match) => {
                const conversation = realMatches.find(
                  (item) => item.id === match.id
                );

                if (conversation) {
                  setActiveConversation(conversation);
                }
              }}
            />

            {realMatchProfiles.length > 0 && (
              <div className="mx-5 mb-0.5 border-t border-white/[0.06]" />
            )}

            {matchesLoading && realMatches.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-[#B365FC]" />
                <p className="text-sm text-slate-400">
                  Loading your matches...
                </p>
              </div>
            ) : realMatches.length === 0 && !matchesLoading && !matchesError ? (
              <div className="flex flex-col items-center py-16 px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#181B30] text-3xl">
                  💬
                </div>
                <h2 className="text-base font-bold text-white">
                  No conversations yet
                </h2>
                <p className="mt-2 max-w-xs text-sm text-slate-400">
                  Your matches and message-request conversations will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => void loadMatches()}
                  className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <ChatList
                conversations={realMatches}
                onSelectConversation={setActiveConversation}
                searchQuery={searchQuery}
              />
            )}
          </>
        ) : (
          <div className="px-5 pb-6">
            {requestNotice && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300"
              >
                {requestNotice}
              </div>
            )}

            {requestsError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                <p>{requestsError}</p>

                {!getAccessToken() && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                    className="mt-2 font-semibold underline"
                  >
                    Go to login
                  </button>
                )}

                {getAccessToken() && (
                  <button
                    type="button"
                    onClick={() => void loadRequests()}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            {requestsLoading ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-[#B365FC]" />
                <p className="text-sm text-slate-400">
                  Loading message requests...
                </p>
              </div>
            ) : requests.length === 0 && !requestsError ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#181B30] text-3xl">
                  💌
                </div>

                <h2 className="text-base font-bold text-white">
                  No message requests yet
                </h2>

                <p className="mt-2 max-w-xs text-sm text-slate-400">
                  When someone sends you a message request, it will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => void loadRequests()}
                  className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests
                  .filter((request) => {
                    const query = searchQuery.trim().toLowerCase();

                    if (!query) return true;

                    return (
                      request.sender?.name?.toLowerCase().includes(query) ||
                      request.content.toLowerCase().includes(query)
                    );
                  })
                  .map((request) => {
                    const busy = busyRequestId === request.id;

                    return (
                      <article
                        key={request.id}
                        className="rounded-2xl border border-white/[0.08] bg-[#181B30] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B365FC]/15 text-lg font-bold text-[#D7B4FF]">
                            {request.sender?.name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="truncate text-sm font-bold text-white">
                                {request.sender?.name || "CampusVerse user"}
                              </h3>

                              <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-300">
                                Pending
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-300 break-words">
                              {request.content}
                            </p>

                            {request.created_at && (
                              <p className="mt-2 text-[10px] text-slate-500">
                                {new Date(request.created_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Accept / Decline */}
                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleAccept(request.id)}
                            className="flex-1 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/15 disabled:opacity-50"
                          >
                            Accept
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleDecline(request.id)}
                            className="flex-1 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-400/15 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      </article>
                    );
                  })}

                {!requestsLoading &&
                  requests.length > 0 &&
                  requests.filter((request) => {
                    const query = searchQuery.trim().toLowerCase();

                    return (
                      !query ||
                      request.sender?.name?.toLowerCase().includes(query) ||
                      request.content.toLowerCase().includes(query)
                    );
                  }).length === 0 && (
                    <p className="py-10 text-center text-sm text-slate-400">
                      No requests match your search.
                    </p>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
