import { InstagramUser, ParseResult } from './types';

/**
 * Strips '@', whitespace, path segments, and query parameters from a raw input or Instagram URL.
 */
export function cleanUsername(raw: string): string {
  if (!raw) return '';

  let cleaned = raw.trim();

  // Remove leading/trailing quotes if pasted from CSV or code
  cleaned = cleaned.replace(/^["']+|["']+$/g, '').trim();

  // Strip protocol and domain if it's a URL
  // e.g. https://www.instagram.com/blastoff.movies/?igsh=...
  // or instagram.com/blastoff.movies
  const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
  if (urlMatch && urlMatch[1]) {
    cleaned = urlMatch[1];
  } else {
    // If it starts with / or has query string
    cleaned = cleaned.split('?')[0].split('#')[0];
    // If there are spaces, take the first token (e.g. "z_.suraj free movie" -> "z_.suraj")
    cleaned = cleaned.split(/\s+/)[0] || '';
    // Remove leading '@'
    cleaned = cleaned.replace(/^@+/, '');
    // Remove trailing slashes
    cleaned = cleaned.replace(/\/+$/, '');
  }

  // Instagram usernames are case-insensitive and conventionally stored lowercase
  return cleaned.trim().toLowerCase();
}

/**
 * Validates Instagram username syntax.
 * Rules:
 * - 1 to 30 characters
 * - Only letters (a-z), numbers (0-9), periods (.), and underscores (_)
 * - Cannot start or end with a period
 * - Cannot have consecutive periods
 */
export function validateUsername(username: string): { isValid: boolean; reason?: string } {
  if (!username || username.length === 0) {
    return { isValid: false, reason: 'Username is empty' };
  }

  if (username.length > 30) {
    return { isValid: false, reason: 'Exceeds 30 characters' };
  }

  // Check valid characters
  const validCharsRegex = /^[a-z0-9._]+$/;
  if (!validCharsRegex.test(username)) {
    return { isValid: false, reason: 'Contains invalid characters (only a-z, 0-9, ., _ allowed)' };
  }

  // Cannot start or end with a period
  if (username.startsWith('.') || username.endsWith('.')) {
    return { isValid: false, reason: 'Cannot start or end with a period' };
  }

  // Cannot contain consecutive periods
  if (username.includes('..')) {
    return { isValid: false, reason: 'Cannot contain consecutive periods' };
  }

  // Reserved non-user paths on instagram.com
  const reservedWords = [
    'about', 'developer', 'explore', 'direct', 'reels', 'accounts',
    'legal', 'help', 'privacy', 'terms', 'stories', 'p', 'tv'
  ];
  if (reservedWords.includes(username)) {
    return { isValid: false, reason: `"${username}" is a reserved Instagram system route` };
  }

  return { isValid: true };
}

/**
 * Generates the official Instagram profile URL for a given username.
 */
export function generateInstagramURL(username: string): string {
  const clean = cleanUsername(username);
  return `https://www.instagram.com/${clean}/`;
}

/**
 * Generates the direct Instagram message URL for web desktop.
 * Directly opens the conversation thread without loading profile.
 */
export function generateInstagramDMURL(username: string): string {
  const clean = cleanUsername(username);
  return `https://www.instagram.com/direct/t/${clean}/`;
}

/**
 * Parses raw text containing usernames separated by newlines, commas, or spaces.
 * Performs normalization, validation, and deduplication.
 */
export function parseRawUsernames(rawInput: string, existingUsernames: string[] = []): ParseResult {
  if (!rawInput || rawInput.trim().length === 0) {
    return { users: [], duplicatesCount: 0, invalidCount: 0 };
  }

  // Split by newlines, commas, semicolons, or tabs
  const tokens = rawInput
    .split(/[\n,;\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const seen = new Set<string>(existingUsernames.map((u) => u.toLowerCase()));
  const users: InstagramUser[] = [];
  let duplicatesCount = 0;
  let invalidCount = 0;

  for (const token of tokens) {
    const username = cleanUsername(token);

    if (!username) continue;

    if (seen.has(username)) {
      duplicatesCount++;
      continue;
    }

    seen.add(username);

    const validation = validateUsername(username);
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (!validation.isValid) {
      invalidCount++;
      users.push({
        id,
        username,
        originalInput: token,
        profileUrl: generateInstagramURL(username),
        directMessageUrl: generateInstagramDMURL(username),
        status: 'invalid',
        errorReason: validation.reason,
      });
    } else {
      users.push({
        id,
        username,
        originalInput: token,
        profileUrl: generateInstagramURL(username),
        directMessageUrl: generateInstagramDMURL(username),
        status: 'pending',
      });
    }
  }

  return {
    users,
    duplicatesCount,
    invalidCount,
  };
}
