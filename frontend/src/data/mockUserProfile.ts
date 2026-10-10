import { TagItem, IcebreakerItem } from "../types/profile";

export interface UserProfileLifestyle {
  height: string;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  zodiac: string;
  lookingFor: string;
}

export interface UserProfileStats {
  likesRemaining: number;
  maxLikes: number;
  profileViews: number;
  completeness: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  degree: string;
  year: string;
  branch: string;
  university: string;
  campus: string;
  isVerified: boolean;
  isStudentVerified: boolean;
  bio: string;
  photos: string[];
  stats: UserProfileStats;
  lifestyle: UserProfileLifestyle;
  interests: TagItem[];
  icebreakers: IcebreakerItem[];
}

export const INITIAL_USER_PROFILE: UserProfile = {
  id: "user-me",
  name: "Lavish",
  age: 20,
  degree: "B.Tech",
  year: "3rd Year",
  branch: "CSE (AI & DS)",
  university: "Poornima University",
  campus: "Jaipur Main Campus",
  isVerified: true,
  isStudentVerified: true,
  bio: "“Good food, better people, and meaningful conversations.”",
  photos: [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  ],
  stats: {
    likesRemaining: 10,
    maxLikes: 10,
    profileViews: 120,
    completeness: 85,
  },
  lifestyle: {
    height: "5'11\" (180 cm)",
    drinking: "Socially",
    smoking: "Never",
    workout: "Active (4x week)",
    pets: "Dog lover 🐕",
    zodiac: "Scorpio ♏",
    lookingFor: "Meaningful connection & study buddy",
  },
  interests: [
    { id: "1", label: "Music", emoji: "🎵" },
    { id: "2", label: "Photography", emoji: "📷" },
    { id: "3", label: "Coding", emoji: "💻" },
    { id: "4", label: "Coffee", emoji: "☕" },
    { id: "5", label: "Late Night Drives", emoji: "🚗" },
    { id: "6", label: "Badminton", emoji: "🏸" },
    { id: "7", label: "Anime", emoji: "🍙" },
  ],
  icebreakers: [
    {
      prompt: "My ideal Sunday is...",
      text: "Good food, discovering an indie coffee shop, and late-night lo-fi music.",
    },
    {
      prompt: "Best campus hack...",
      text: "The 3rd floor library corner always has working power plugs and fast Wi-Fi.",
    },
  ],
};

// Curated library of extra photos to pick when adding a photo
export const PHOTO_CATALOG: string[] = [
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
];

// Available interests catalog for selection
export const AVAILABLE_INTERESTS: TagItem[] = [
  { id: "1", label: "Music", emoji: "🎵" },
  { id: "2", label: "Photography", emoji: "📷" },
  { id: "3", label: "Coding", emoji: "💻" },
  { id: "4", label: "Coffee", emoji: "☕" },
  { id: "5", label: "Late Night Drives", emoji: "🚗" },
  { id: "6", label: "Badminton", emoji: "🏸" },
  { id: "7", label: "Anime", emoji: "🍙" },
  { id: "8", label: "Gaming", emoji: "🎮" },
  { id: "9", label: "Fitness", emoji: "💪" },
  { id: "10", label: "Reading", emoji: "📚" },
  { id: "11", label: "Travel", emoji: "✈️" },
  { id: "12", label: "UI/UX", emoji: "🎨" },
  { id: "13", label: "Trekking", emoji: "🏔️" },
  { id: "14", label: "Foodie", emoji: "🍕" },
  { id: "15", label: "Cinema", emoji: "🎬" },
  { id: "16", label: "Startups", emoji: "🚀" },
];

// Icebreaker prompt templates
export const ICEBREAKER_PROMPTS: string[] = [
  "My ideal Sunday is...",
  "Best campus hack...",
  "Two truths and a lie...",
  "The quickest way to my heart is...",
  "Let's debate about...",
  "My go-to canteen order is...",
];
