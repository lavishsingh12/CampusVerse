import { Profile } from "../types/profile";

// ─── Explore Category Definitions ───────────────────────────────────────────

export interface ExploreCategory {
  id: string;
  title: string;
  tagline: string;
  memberCount: number;
  /** Background image for the landing card */
  bgImage: string;
  /** Gradient overlay tint for the visual theme */
  gradientFrom: string;
  gradientTo: string;
}

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  // Row 1: Romantic | Garba Partner
  {
    id: "romantic",
    title: "Romantic",
    tagline: "Find someone special on campus",
    memberCount: 56,
    bgImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#9D174D",
    gradientTo: "#BE185D",
  },
  {
    id: "garba",
    title: "Garba Partner",
    tagline: "Find a garba partner for upcoming events",
    memberCount: 38,
    bgImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#6D28D9",
    gradientTo: "#BE185D",
  },

  // Row 2: Foodies | Short-Term Fun
  {
    id: "foodies",
    title: "Foodies",
    tagline: "Find food partners and explore cafés",
    memberCount: 73,
    bgImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#9A3412",
    gradientTo: "#B45309",
  },
  {
    id: "shortterm",
    title: "Short-Term Fun",
    tagline: "Meet, hangout and make memories",
    memberCount: 47,
    bgImage: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#581C87",
    gradientTo: "#7E22CE",
  },

  // Row 3: Coffee Date | Gym Lovers
  {
    id: "coffee",
    title: "Coffee Date",
    tagline: "Cafés, food and good conversations",
    memberCount: 62,
    bgImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#78350F",
    gradientTo: "#A16207",
  },
  {
    id: "gym",
    title: "Gym Lovers",
    tagline: "Workout buddies and fitness friends",
    memberCount: 29,
    bgImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#064E3B",
    gradientTo: "#0F766E",
  },

  // Row 4: Bike Lovers | Long-Term Partners
  {
    id: "bikelovers",
    title: "Bike Lovers",
    tagline: "Rides, road trips and bike buddies",
    memberCount: 45,
    bgImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#1E3A8A",
    gradientTo: "#3B82F6",
  },
  {
    id: "longterm",
    title: "Long-Term Partners",
    tagline: "Looking for something meaningful",
    memberCount: 68,
    bgImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#831843",
    gradientTo: "#9D174D",
  },

  // Row 5: Blind Date | Hackathon Friends
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
    memberCount: 88,
    bgImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    gradientFrom: "#0F172A",
    gradientTo: "#334155",
  },
];

// ─── Category-specific Profile Pools ────────────────────────────────────────

const ALL_EXPLORE_PROFILES: Profile[] = [
  // ── Romantic profiles ──
  {
    id: "ex-romantic-1",
    name: "A.",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "Computer Science",
    isVerified: true,
    matchPercentage: 96,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Music", emoji: "🎵" },
      { id: "2", label: "Coffee Dates", emoji: "☕" },
      { id: "3", label: "Long Walks", emoji: "🌇" },
      { id: "4", label: "Sunsets", emoji: "🌅" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "My ideal evening is stargazing with good company and chai." }],
  },
  {
    id: "ex-romantic-2",
    name: "R.",
    age: 22,
    degree: "B.Des",
    year: "4th Year",
    branch: "Design",
    isVerified: true,
    matchPercentage: 91,
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Art Galleries", emoji: "🎨" },
      { id: "2", label: "Poetry", emoji: "✍️" },
      { id: "3", label: "Vintage Cafés", emoji: "☕" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "What's the most romantic thing you've done on campus?" }],
  },
  {
    id: "ex-romantic-3",
    name: "K.",
    age: 20,
    degree: "B.A. Literature",
    year: "2nd Year",
    branch: "Humanities",
    isVerified: true,
    matchPercentage: 88,
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Romantic Novels", emoji: "📖" },
      { id: "2", label: "Acoustic", emoji: "🎸" },
      { id: "3", label: "Stargazing", emoji: "✨" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Recommend me a song that feels like falling in love." }],
  },

  // ── Garba Partner profiles ──
  {
    id: "ex-garba-1",
    name: "D.",
    age: 21,
    degree: "B.Com",
    year: "3rd Year",
    branch: "Finance",
    isVerified: true,
    matchPercentage: 94,
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Garba & Dandiya", emoji: "💃" },
      { id: "2", label: "Traditional Attire", emoji: "👗" },
      { id: "3", label: "Festivals", emoji: "✨" },
      { id: "4", label: "Folk Dance", emoji: "🪕" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "9 nights of Navratri is my entire personality in October." }],
  },
  {
    id: "ex-garba-2",
    name: "M.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "Mechanical",
    isVerified: true,
    matchPercentage: 89,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Garba Steps", emoji: "🕺" },
      { id: "2", label: "Dhol Beats", emoji: "🥁" },
      { id: "3", label: "Navratri Nights", emoji: "🌙" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Need a partner who won't get tired after 3 rounds of dodhiya." }],
  },
  {
    id: "ex-garba-3",
    name: "T.",
    age: 20,
    degree: "BBA",
    year: "2nd Year",
    branch: "Marketing",
    isVerified: true,
    matchPercentage: 85,
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Garba Enthusiast", emoji: "💃" },
      { id: "2", label: "Chaniya Choli", emoji: "👘" },
      { id: "3", label: "Garba Playlist", emoji: "🎶" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Let's coordinate outfits for the campus Garba night!" }],
  },

  // ── Foodies profiles ──
  {
    id: "ex-food-1",
    name: "P.",
    age: 21,
    degree: "BHM",
    year: "3rd Year",
    branch: "Hotel Management",
    isVerified: true,
    matchPercentage: 95,
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Street Food", emoji: "🍜" },
      { id: "2", label: "Café Hopping", emoji: "🍰" },
      { id: "3", label: "Biryani Lover", emoji: "🍛" },
      { id: "4", label: "Dessert Hunting", emoji: "🍨" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "I have a ranked list of the 10 best momo spots near campus." }],
  },
  {
    id: "ex-food-2",
    name: "Y.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "Civil",
    isVerified: true,
    matchPercentage: 90,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Midnight Cravings", emoji: "🍕" },
      { id: "2", label: "Food Photography", emoji: "📸" },
      { id: "3", label: "Cook & Share", emoji: "👨‍🍳" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "2 AM Maggi at Maggie Point or 11 PM Shawarma run?" }],
  },
  {
    id: "ex-food-3",
    name: "S.",
    age: 20,
    degree: "B.Sc",
    year: "2nd Year",
    branch: "Food Technology",
    isVerified: true,
    matchPercentage: 86,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Artisan Bakery", emoji: "🥐" },
      { id: "2", label: "Ramen", emoji: "🍜" },
      { id: "3", label: "Spicy Food", emoji: "🌶️" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Food tastes 10x better when shared with great company." }],
  },

  // ── Short-Term Fun profiles ──
  {
    id: "ex-fun-1",
    name: "V.",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "IT",
    isVerified: true,
    matchPercentage: 93,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Campus Hangouts", emoji: "🎉" },
      { id: "2", label: "Concerts", emoji: "🎸" },
      { id: "3", label: "Board Games", emoji: "🎲" },
      { id: "4", label: "Weekend Trips", emoji: "🏕️" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Spontaneous plans always turn into the best campus stories." }],
  },
  {
    id: "ex-fun-2",
    name: "Z.",
    age: 20,
    degree: "B.Des",
    year: "2nd Year",
    branch: "Fashion",
    isVerified: true,
    matchPercentage: 88,
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "House Parties", emoji: "🥳" },
      { id: "2", label: "Live Gigs", emoji: "🎤" },
      { id: "3", label: "Bowling", emoji: "🎳" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Here for good vibes, new friends, and unforgettable memories." }],
  },

  // ── Coffee Date profiles ──
  {
    id: "ex-coffee-1",
    name: "S.",
    age: 21,
    degree: "B.A. English",
    year: "3rd Year",
    branch: "Literature",
    isVerified: true,
    matchPercentage: 92,
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Pour Over Coffee", emoji: "☕" },
      { id: "2", label: "Quiet Corners", emoji: "🌿" },
      { id: "3", label: "Deep Conversations", emoji: "💬" },
      { id: "4", label: "Reading", emoji: "📚" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Tell me your favorite coffee spot near campus and we'll go." }],
  },
  {
    id: "ex-coffee-2",
    name: "R.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "ECE",
    isVerified: true,
    matchPercentage: 87,
    photos: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Espresso", emoji: "☕" },
      { id: "2", label: "Indie Cafés", emoji: "🥐" },
      { id: "3", label: "Study Sessions", emoji: "💻" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Looking for someone who appreciates a good brew as much as I do." }],
  },
  {
    id: "ex-coffee-3",
    name: "L.",
    age: 19,
    degree: "B.Sc",
    year: "1st Year",
    branch: "Psychology",
    isVerified: true,
    matchPercentage: 84,
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Iced Latte", emoji: "🧊" },
      { id: "2", label: "Croissants", emoji: "🥐" },
      { id: "3", label: "Podcast Listening", emoji: "🎧" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Coffee first, then let's solve all the world's problems." }],
  },

  // ── Gym Lovers profiles ──
  {
    id: "ex-gym-1",
    name: "A.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "Mechanical",
    isVerified: true,
    matchPercentage: 94,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Weightlifting", emoji: "🏋️‍♂️" },
      { id: "2", label: "Calisthenics", emoji: "🤸" },
      { id: "3", label: "High Protein", emoji: "🥩" },
      { id: "4", label: "Morning Workouts", emoji: "🌅" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Need a gym buddy who won't skip leg day." }],
  },
  {
    id: "ex-gym-2",
    name: "T.",
    age: 21,
    degree: "B.Sc",
    year: "3rd Year",
    branch: "Sports Science",
    isVerified: true,
    matchPercentage: 90,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Crossfit", emoji: "💪" },
      { id: "2", label: "Yoga & Mobility", emoji: "🧘" },
      { id: "3", label: "Running", emoji: "🏃‍♀️" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "6 AM campus gym sessions hit different." }],
  },
  {
    id: "ex-gym-3",
    name: "K.",
    age: 20,
    degree: "BBA",
    year: "2nd Year",
    branch: "Management",
    isVerified: true,
    matchPercentage: 85,
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Fitness", emoji: "🏋️" },
      { id: "2", label: "Diet & Nutrition", emoji: "🥗" },
      { id: "3", label: "Push-Pull-Legs", emoji: "⚡" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Spot me on bench press and I'll buy you a protein smoothie." }],
  },

  // ── Bike Lovers profiles ──
  {
    id: "ex-bike-1",
    name: "R.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "Automobile",
    isVerified: true,
    matchPercentage: 95,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Superbikes", emoji: "🏍️" },
      { id: "2", label: "Weekend Rides", emoji: "🛣️" },
      { id: "3", label: "Highway Cruising", emoji: "🌄" },
      { id: "4", label: "Night Rides", emoji: "🌙" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Know all the scenic ghat roads around here. Hop on!" }],
  },
  {
    id: "ex-bike-2",
    name: "J.",
    age: 21,
    degree: "B.Des",
    year: "3rd Year",
    branch: "Product Design",
    isVerified: true,
    matchPercentage: 88,
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Motorcycles", emoji: "🏍️" },
      { id: "2", label: "Café Racers", emoji: "☕" },
      { id: "3", label: "Helmet Comms", emoji: "🎧" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Two wheels move the soul. Let's plan a weekend ride." }],
  },
  {
    id: "ex-bike-3",
    name: "H.",
    age: 23,
    degree: "MBA",
    year: "1st Year",
    branch: "Operations",
    isVerified: true,
    matchPercentage: 83,
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Royal Enfield", emoji: "🏍️" },
      { id: "2", label: "Road Trips", emoji: "🛣️" },
      { id: "3", label: "Long Rides", emoji: "🌅" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "The best therapy is a long night ride." }],
  },

  // ── Long-Term Partners profiles ──
  {
    id: "ex-long-1",
    name: "M.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "Computer Science",
    isVerified: true,
    matchPercentage: 96,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Deep Conversations", emoji: "💬" },
      { id: "2", label: "Loyalty", emoji: "🤝" },
      { id: "3", label: "Future Goals", emoji: "🌱" },
      { id: "4", label: "Quality Time", emoji: "⏳" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Looking for something real and lasting, not just campus casual." }],
  },
  {
    id: "ex-long-2",
    name: "D.",
    age: 23,
    degree: "M.Tech",
    year: "1st Year",
    branch: "Data Science",
    isVerified: true,
    matchPercentage: 91,
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Mutual Growth", emoji: "📈" },
      { id: "2", label: "Shared Values", emoji: "✨" },
      { id: "3", label: "Weekend Cookouts", emoji: "🍳" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Someone to build dreams and conquer college goals together." }],
  },
  {
    id: "ex-long-3",
    name: "A.",
    age: 21,
    degree: "B.A. Economics",
    year: "3rd Year",
    branch: "Economics",
    isVerified: true,
    matchPercentage: 89,
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Meaningful Connection", emoji: "💖" },
      { id: "2", label: "Honesty", emoji: "🕊️" },
      { id: "3", label: "Family & Future", emoji: "🏡" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Valuing emotional connection and growing together over anything else." }],
  },

  // ── Blind Date profiles ──
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

  // ── Hackathon Friends profiles ──
  {
    id: "ex-hack-1",
    name: "N.",
    age: 22,
    degree: "B.Tech",
    year: "4th Year",
    branch: "AI & ML",
    isVerified: true,
    matchPercentage: 97,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Hackathons", emoji: "💡" },
      { id: "2", label: "AI/ML", emoji: "🤖" },
      { id: "3", label: "Coding", emoji: "💻" },
      { id: "4", label: "Startups", emoji: "🚀" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Won 3 hackathons. Looking for a teammate for the next one." }],
  },
  {
    id: "ex-hack-2",
    name: "P.",
    age: 21,
    degree: "B.Tech",
    year: "3rd Year",
    branch: "Software Engineering",
    isVerified: true,
    matchPercentage: 93,
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Programming", emoji: "💻" },
      { id: "2", label: "Open Source", emoji: "🌐" },
      { id: "3", label: "Dev Community", emoji: "👩‍💻" },
      { id: "4", label: "Tech Projects", emoji: "🔧" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "Let's ship something this weekend." }],
  },
  {
    id: "ex-hack-3",
    name: "S.",
    age: 20,
    degree: "BCA",
    year: "2nd Year",
    branch: "Computer Applications",
    isVerified: true,
    matchPercentage: 87,
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    ],
    tags: [
      { id: "1", label: "Coding", emoji: "💻" },
      { id: "2", label: "Hackathons", emoji: "💡" },
      { id: "3", label: "Problem Solving", emoji: "🧩" },
    ],
    icebreakers: [{ prompt: "ICEBREAKER", text: "48-hour hackathon? Tell me the theme and I'm in." }],
  },
];

// ─── Category → Profiles mapping ────────────────────────────────────────────

const CATEGORY_PROFILE_MAP: Record<string, string[]> = {
  romantic:   ["ex-romantic-1", "ex-romantic-2", "ex-romantic-3"],
  garba:      ["ex-garba-1", "ex-garba-2", "ex-garba-3"],
  foodies:    ["ex-food-1", "ex-food-2", "ex-food-3"],
  shortterm:  ["ex-fun-1", "ex-fun-2"],
  coffee:     ["ex-coffee-1", "ex-coffee-2", "ex-coffee-3"],
  gym:        ["ex-gym-1", "ex-gym-2", "ex-gym-3"],
  bikelovers: ["ex-bike-1", "ex-bike-2", "ex-bike-3"],
  longterm:   ["ex-long-1", "ex-long-2", "ex-long-3"],
  blinddate:  ["ex-blind-1", "ex-blind-2", "ex-blind-3"],
  hackathon:  ["ex-hack-1", "ex-hack-2", "ex-hack-3"],
};

export function getProfilesForCategory(categoryId: string): Profile[] {
  const ids = CATEGORY_PROFILE_MAP[categoryId] ?? [];
  return ALL_EXPLORE_PROFILES.filter((p) => ids.includes(p.id));
}
