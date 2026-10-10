export interface TagItem {
  id: string;
  label: string;
  emoji: string;
}

export interface IcebreakerItem {
  prompt: string;
  text: string;
}

export interface Profile {
  id: string;
  userId?: number;
  name: string; // First initial like "A."
  displayName?: string; // Full display name
  age: number;
  degree: string; // e.g. "B.Tech"
  year: string; // e.g. "3rd Year"
  branch: string; // e.g. "Computer Science"
  isVerified: boolean;
  matchPercentage: number; // e.g. 94
  photos: string[];
  tags: TagItem[]; // Combined interests and hobbies for clean chips
  icebreakers: IcebreakerItem[];
}
