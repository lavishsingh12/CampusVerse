export interface ChatMessage {
  id: string;
  sender: "them" | "me";
  text: string;
  timestamp: string;
  createdAt?: string;
}

export interface MatchProfile {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  degree?: string;
  year?: string;
  branch?: string;
}

export interface ConversationItem {
  id: string; // match ID string
  name: string;
  avatar: string;
  isSystem?: boolean;
  isOnline?: boolean;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  messages: ChatMessage[];
  otherUserId?: number;
}
