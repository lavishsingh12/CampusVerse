import type {
  ChatMessage,
  MatchProfile,
  ConversationItem,
} from "../types/chat";

export type {
  ChatMessage,
  MatchProfile,
  ConversationItem,
};



export const MOCK_NEW_MATCHES: MatchProfile[] = [
  {
    id: "match-1",
    name: "Aanya",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    degree: "B.Tech",
    year: "3rd Year",
  },
  {
    id: "match-2",
    name: "Rohan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    degree: "B.Des",
    year: "4th Year",
  },
  {
    id: "match-3",
    name: "Meera",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    degree: "B.A.",
    year: "2nd Year",
  },
  {
    id: "match-4",
    name: "Arjun",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    degree: "B.Tech",
    year: "3rd Year",
  },
  {
    id: "match-5",
    name: "Karan",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    isOnline: false,
    degree: "B.Sc",
    year: "2nd Year",
  },
];

export const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: "conv-1",
    name: "Aanya",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    lastMessage: "Hey! How was your midsem? 😄",
    timestamp: "10:24 AM",
    unreadCount: 2,
    messages: [
      {
        id: "m-1",
        sender: "them",
        text: "Hey there! Saw we both take CS301 😊",
        timestamp: "10:15 AM",
      },
      {
        id: "m-2",
        sender: "me",
        text: "Hey Aanya! Yes, that algorithm exam was intense haha",
        timestamp: "10:18 AM",
      },
      {
        id: "m-3",
        sender: "them",
        text: "Hey! How was your midsem? 😄",
        timestamp: "10:24 AM",
      },
      {
        id: "m-4",
        sender: "them",
        text: "Are you free this evening for canteen coffee?",
        timestamp: "10:25 AM",
      },
    ],
  },
  {
    id: "conv-2",
    name: "Team CampusVerse",
    avatar: "",
    isSystem: true,
    isOnline: false,
    lastMessage: "From your first like to new friendships...",
    timestamp: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "sys-1",
        sender: "them",
        text: "Welcome to CampusVerse! 🎉 Verified students only, keeping your campus community genuine and safe.",
        timestamp: "Yesterday, 3:00 PM",
      },
      {
        id: "sys-2",
        sender: "them",
        text: "From your first like to new friendships, let us know if you have any questions or feedback!",
        timestamp: "Yesterday, 3:01 PM",
      },
    ],
  },
  {
    id: "conv-3",
    name: "Rohan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    lastMessage: "Yeah same here, it was tough",
    timestamp: "Yesterday",
    unreadCount: 1,
    messages: [
      {
        id: "r-1",
        sender: "me",
        text: "Did you finish the prototype submission on time?",
        timestamp: "Yesterday, 6:15 PM",
      },
      {
        id: "r-2",
        sender: "them",
        text: "Yeah same here, it was tough",
        timestamp: "Yesterday, 6:45 PM",
      },
    ],
  },
  {
    id: "conv-4",
    name: "Deepika",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    lastMessage: "Let's catch up at the fest?",
    timestamp: "2 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "d-1",
        sender: "me",
        text: "Heard the cultural fest schedule got released today!",
        timestamp: "2 days ago",
      },
      {
        id: "d-2",
        sender: "them",
        text: "Let's catch up at the fest?",
        timestamp: "2 days ago",
      },
    ],
  },
  {
    id: "conv-5",
    name: "Karan",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    isOnline: false,
    lastMessage: "Sent a photo",
    timestamp: "3 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "k-1",
        sender: "them",
        text: "Here is the campus basketball court update",
        timestamp: "3 days ago",
      },
      {
        id: "k-2",
        sender: "them",
        text: "Sent a photo",
        timestamp: "3 days ago",
      },
    ],
  },
  {
    id: "conv-6",
    name: "Meera",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    isOnline: true,
    lastMessage: "That café near campus is actually so good!",
    timestamp: "4 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m-1",
        sender: "me",
        text: "Have you tried the new coffee spot across the library?",
        timestamp: "4 days ago",
      },
      {
        id: "m-2",
        sender: "them",
        text: "That café near campus is actually so good!",
        timestamp: "4 days ago",
      },
    ],
  },
];
