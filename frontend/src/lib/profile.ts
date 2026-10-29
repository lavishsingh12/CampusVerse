import { apiRequest } from "./api";
import type { IcebreakerItem, TagItem } from "../types/profile";

export interface ProfileLifestyleData {
  height: string;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  zodiac: string;
  lookingFor: string;
}

export type ProfilePhotoSelection =
  | { kind: "existing"; photoId: number; url: string }
  | { kind: "url"; url: string }
  | { kind: "upload"; file: File; previewUrl: string };

export interface BackendPhoto {
  id: number;
  profile_id: number;
  url: string;
  position: number;
}

export interface BackendProfile {
  id: number;
  user_id: number;
  display_name: string;
  age: number;
  degree: string;
  year: string;
  branch: string;
  bio?: string | null;
  is_verified: boolean;
  is_active: boolean;
  email?: string | null;
  user_name?: string | null;
  is_premium?: boolean;
  university: string | null;
  campus: string | null;
  lifestyle: ProfileLifestyleData | null;
  interests: TagItem[] | null;
  icebreakers: IcebreakerItem[] | null;
  photos: BackendPhoto[];
}

export interface ProfileUpdatePayload {
  display_name?: string;
  age?: number;
  degree?: string;
  year?: string;
  branch?: string;
  bio?: string | null;
  university?: string | null;
  campus?: string | null;
  lifestyle?: ProfileLifestyleData | null;
  interests?: TagItem[] | null;
  icebreakers?: IcebreakerItem[] | null;
}

export interface PhotoOrderItem {
  photo_id: number;
  position: number;
}

export async function getMyProfile(token: string): Promise<BackendProfile> {
  return apiRequest<BackendProfile>("/profiles/me", { method: "GET" }, token);
}

export async function updateProfile(
  profileId: number,
  payload: ProfileUpdatePayload,
  token: string
): Promise<BackendProfile> {
  return apiRequest<BackendProfile>(
    `/profiles/${profileId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function addProfilePhoto(
  profileId: number,
  url: string,
  position: number,
  token: string
): Promise<BackendPhoto> {
  return apiRequest<BackendPhoto>(
    `/profiles/${profileId}/photos`,
    {
      method: "POST",
      body: JSON.stringify({ url, position }),
    },
    token
  );
}

export async function deleteProfilePhoto(
  profileId: number,
  photoId: number,
  token: string
): Promise<void> {
  return apiRequest<void>(
    `/profiles/${profileId}/photos/${photoId}`,
    {
      method: "DELETE",
    },
    token
  );
}

export async function reorderProfilePhotos(
  profileId: number,
  photos: PhotoOrderItem[],
  token: string
): Promise<BackendPhoto[]> {
  return apiRequest<BackendPhoto[]>(
    `/profiles/${profileId}/photos/reorder`,
    {
      method: "PUT",
      body: JSON.stringify({ photos }),
    },
    token
  );
}

export async function syncProfilePhotos(
  profileId: number,
  photos: ProfilePhotoSelection[],
  token: string
): Promise<BackendPhoto[]> {
  const formData = new FormData();
  let fileIndex = 0;
  const manifest = photos.map((photo) => {
    if (photo.kind === "upload") {
      formData.append("files", photo.file);
      return { kind: photo.kind, file_index: fileIndex++ };
    }
    if (photo.kind === "existing") {
      return { kind: photo.kind, photo_id: photo.photoId };
    }
    return { kind: photo.kind, url: photo.url };
  });

  formData.append("manifest", JSON.stringify(manifest));

  return apiRequest<BackendPhoto[]>(
    `/profiles/${profileId}/photos/sync`,
    { method: "PUT", body: formData },
    token
  );
}
