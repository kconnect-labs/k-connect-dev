import { get, set } from 'idb-keyval';

export interface ProfileMediaCache {
  banner_url: string | null;
  avatar_url: string | null;
  photos: any[]; // array of photo objects/strings
  videos: any[]; // array of video objects/strings
  equipped_items: any[]; // array of items
}

const cacheKey = (username: string) => `profileMedia_${username}`;

export const getProfileMediaCache = async (
  username: string
): Promise<ProfileMediaCache | null> => {
  if (!username) return null;
  try {
    return (await get(cacheKey(username))) as ProfileMediaCache | null;
  } catch (err) {
    console.error('IndexedDB get error', err);
    return null;
  }
};

export const setProfileMediaCache = async (
  username: string,
  data: ProfileMediaCache
) => {
  if (!username) return;
  try {
    await set(cacheKey(username), data);
  } catch (err) {
    console.error('IndexedDB set error', err);
  }
};
