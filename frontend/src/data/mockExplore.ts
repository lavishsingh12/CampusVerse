import { Profile } from "../types/profile";

export interface ExploreCategory {
  id: string;
  title: string;
  tagline: string;
  memberCount: number | null;
  bgImage: string;
  gradientFrom: string;
  gradientTo: string;
}

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: "romantic",
    title: "Romantic",
    tagline: "Find someone special on campus",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#9D174D",
    gradientTo: "#BE185D",
  },
  {
    id: "garba",
    title: "Garba Partner",
    tagline: "Find a garba partner for upcoming events",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#6D28D9",
    gradientTo: "#BE185D",
  },
  {
    id: "foodies",
    title: "Foodies",
    tagline: "Find food partners and explore cafés",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#9A3412",
    gradientTo: "#B45309",
  },
  {
    id: "shortterm",
    title: "Short-Term Fun",
    tagline: "Meet, hangout and make memories",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#581C87",
    gradientTo: "#7E22CE",
  },
  {
    id: "coffee",
    title: "Coffee Date",
    tagline: "Cafés, food and good conversations",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#78350F",
    gradientTo: "#A16207",
  },
  {
    id: "gym",
    title: "Gym Lovers",
    tagline: "Workout buddies and fitness friends",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#064E3B",
    gradientTo: "#0F766E",
  },
  {
    id: "bikelovers",
    title: "Bike Lovers",
    tagline: "Rides, road trips and bike buddies",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#1E3A8A",
    gradientTo: "#3B82F6",
  },
  {
    id: "longterm",
    title: "Long-Term Partners",
    tagline: "Looking for something meaningful",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#831843",
    gradientTo: "#9D174D",
  },
  {
    id: "blinddate",
    title: "Blind Date",
    tagline: "Meet someone new without the usual expectations",
    memberCount: 52,
    bgImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#312E81",
    gradientTo: "#4F46E5",
  },
  {
    id: "hackathon",
    title: "Hackathon Friends",
    tagline: "Find teammates for hackathons & projects",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#0F172A",
    gradientTo: "#334155",
  },
  {
    id: "communities",
    title: "Communities / Common Interests",
    tagline: "Meet students who share your interests",
    memberCount: null,
    bgImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#312E81",
    gradientTo: "#0F766E",
  },
];

const BLIND_DATE_PROFILES: Profile[] = [
  {
    id: "ex-blind-1",
    name: "N.",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "BioTech",
    isVerified: true,
    matchPercentage: 92,
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Mystery Meet", emoji: "🎭" },
      { id: "2", label: "Surprises", emoji: "🎁" },
      { id: "3", label: "Open-minded", emoji: "✨" },
      { id: "4", label: "Trivia Nights", emoji: "🎲" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "No preconceptions, just genuine chemistry and curiosity." }],
  },
  {
    id: "ex-blind-2",
    name: "S.",
    age: 22,
    degree: "B.Com",
    year: "4th Year",
    branch: "Accounting",
    isVerified: true,
    matchPercentage: 88,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Blind Date", emoji: "🕶️" },
      { id: "2", label: "Spontaneous", emoji: "⚡" },
      { id: "3", label: "Good Energy", emoji: "🌟" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Pick a time and place, let fate do the rest." }],
  },
  {
    id: "ex-blind-3",
    name: "K.",
    age: 20,
    degree: "B.Sc",
    year: "2nd Year",
    branch: "Maths",
    isVerified: true,
    matchPercentage: 86,
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Conversation", emoji: "💬" },
      { id: "2", label: "Coffee Mystery", emoji: "☕" },
      { id: "3", label: "Unfiltered Talk", emoji: "🔮" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Best conversations happen when you have zero expectations." }],
  },
];

export function getBlindDateProfiles(): Profile[] {
  return BLIND_DATE_PROFILES;
}
