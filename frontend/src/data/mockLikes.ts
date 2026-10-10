export interface LikeInterest {
  label: string;
  emoji: string;
}

export interface LikeCardItem {
  id: string;
  initial: string;
  name: string;
  age: number;
  degree: string;
  year: string;
  branch: string;
  photo: string;
  interests: LikeInterest[];
  extraCount: number;
}

export const MOCK_LIKES_RECEIVED: LikeCardItem[] = [
  {
    id: "like-rec-1",
    initial: "R.",
    name: "Riya",
    age: 20,
    degree: "B.Tech",
    year: "2nd Year",
    branch: "CSE",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Gaming", emoji: "🎮" },
      { label: "Coffee", emoji: "☕" },
    ],
    extraCount: 2,
  },
  {
    id: "like-rec-2",
    initial: "A.",
    name: "Ananya",
    age: 21,
    degree: "BBA",
    year: "3rd Year",
    branch: "Finance",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Travel", emoji: "✈️" },
      { label: "Music", emoji: "🎵" },
    ],
    extraCount: 3,
  },
  {
    id: "like-rec-3",
    initial: "S.",
    name: "Shreya",
    age: 20,
    degree: "B.Tech",
    year: "2nd Year",
    branch: "IT",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Books", emoji: "📖" },
      { label: "Gym", emoji: "🏋️" },
    ],
    extraCount: 1,
  },
  {
    id: "like-rec-4",
    initial: "M.",
    name: "Meera",
    age: 22,
    degree: "B.Des",
    year: "3rd Year",
    branch: "Design",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Art", emoji: "🎨" },
      { label: "Photography", emoji: "📷" },
    ],
    extraCount: 2,
  },
  {
    id: "like-rec-5",
    initial: "K.",
    name: "Kriti",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "ECE",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Music", emoji: "🎵" },
      { label: "Shopping", emoji: "🛍️" },
    ],
    extraCount: 3,
  },
  {
    id: "like-rec-6",
    initial: "T.",
    name: "Tanvi",
    age: 20,
    degree: "BCA",
    year: "2nd Year",
    branch: "CS",
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Food", emoji: "🍜" },
      { label: "Nature", emoji: "🌿" },
    ],
    extraCount: 2,
  },
  {
    id: "like-rec-7",
    initial: "P.",
    name: "Pooja",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "AI & DS",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Coding", emoji: "💻" },
      { label: "Badminton", emoji: "🏸" },
    ],
    extraCount: 2,
  },
  {
    id: "like-rec-8",
    initial: "N.",
    name: "Nandini",
    age: 22,
    degree: "B.Arch",
    year: "4th Year",
    branch: "Architecture",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Design", emoji: "🏛️" },
      { label: "Coffee", emoji: "☕" },
    ],
    extraCount: 1,
  },
];

export const MOCK_YOU_LIKED: LikeCardItem[] = [
  {
    id: "you-liked-1",
    initial: "K.",
    name: "Kavya",
    age: 20,
    degree: "B.Tech",
    year: "2nd Year",
    branch: "IT",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Music", emoji: "🎵" },
      { label: "Coffee", emoji: "☕" },
    ],
    extraCount: 3,
  },
  {
    id: "you-liked-2",
    initial: "R.",
    name: "Roshni",
    age: 21,
    degree: "B.Des",
    year: "3rd Year",
    branch: "Design",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Art", emoji: "🎨" },
      { label: "Travel", emoji: "✈️" },
    ],
    extraCount: 2,
  },
  {
    id: "you-liked-3",
    initial: "T.",
    name: "Tara",
    age: 20,
    degree: "B.Tech",
    year: "2nd Year",
    branch: "CSE",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Books", emoji: "📖" },
      { label: "Gym", emoji: "🏋️" },
    ],
    extraCount: 3,
  },
  {
    id: "you-liked-4",
    initial: "A.",
    name: "Aanya",
    age: 22,
    degree: "BBA",
    year: "4th Year",
    branch: "Finance",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Travel", emoji: "✈️" },
      { label: "Photography", emoji: "📷" },
    ],
    extraCount: 2,
  },
  {
    id: "you-liked-5",
    initial: "S.",
    name: "Sneha",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "ECE",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Food", emoji: "🍜" },
      { label: "Music", emoji: "🎵" },
    ],
    extraCount: 1,
  },
  {
    id: "you-liked-6",
    initial: "M.",
    name: "Mansi",
    age: 20,
    degree: "BCA",
    year: "2nd Year",
    branch: "CS",
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Nature", emoji: "🌿" },
      { label: "Shopping", emoji: "🛍️" },
    ],
    extraCount: 2,
  },
  {
    id: "you-liked-7",
    initial: "V.",
    name: "Vani",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "Civil",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Late Drives", emoji: "🚗" },
      { label: "Movies", emoji: "🎬" },
    ],
    extraCount: 2,
  },
  {
    id: "you-liked-8",
    initial: "P.",
    name: "Prerna",
    age: 20,
    degree: "B.Sc",
    year: "2nd Year",
    branch: "Psychology",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    interests: [
      { label: "Reading", emoji: "📚" },
      { label: "Coffee", emoji: "☕" },
    ],
    extraCount: 1,
  },
];
