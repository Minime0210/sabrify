/**
 * Daily Content Rotation System
 * 
 * Provides deterministic, offline-safe content rotation based on user's local timezone.
 * Content refreshes at local midnight, avoiding repeats within a configurable window.
 */

import { ayat, duas, adhkar, Ayah, Dua, Dhikr } from '@/data/islamicContent';

/**
 * Get the current day number based on user's local timezone.
 * This ensures content refreshes at local midnight.
 */
export const getLocalDayNumber = (): number => {
  const now = new Date();
  const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = localDate.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

/**
 * Get a date key based on user's local timezone for storage purposes.
 */
export const getLocalDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a stored date key is from today (local timezone).
 */
export const isToday = (dateKey: string): boolean => {
  return dateKey === getLocalDateKey();
};

/**
 * Get the time until next local midnight in milliseconds.
 */
export const getTimeUntilMidnight = (): number => {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime() - now.getTime();
};

/**
 * Deterministic selection based on day number - ensures same content for same day.
 * Uses modular arithmetic with prime offset to avoid patterns.
 */
const getDeterministicIndex = (dayNumber: number, arrayLength: number, offset: number = 0): number => {
  // Use prime multiplier to create more varied distribution
  const prime = 7919;
  const hash = (dayNumber * prime + offset) % arrayLength;
  return Math.abs(hash);
};

/**
 * Get recently used content IDs from localStorage.
 */
const getRecentlyUsed = (key: string, windowSize: number = 5): string[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.slice(0, windowSize) : [];
  } catch {
    return [];
  }
};

/**
 * Track used content ID in localStorage.
 */
const trackUsedContent = (key: string, id: string, windowSize: number = 5): void => {
  try {
    const recent = getRecentlyUsed(key, windowSize - 1);
    const updated = [id, ...recent.filter(r => r !== id)].slice(0, windowSize);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Silent fail for storage issues
  }
};

/**
 * Select content avoiding recently used items when possible.
 */
const selectWithAvoidance = <T extends { id: string }>(
  items: T[],
  dayNumber: number,
  recentKey: string,
  offset: number = 0
): T => {
  const recent = getRecentlyUsed(recentKey);
  const available = items.filter(item => !recent.includes(item.id));
  
  // If all items were recently used, just pick deterministically from all
  const pool = available.length > 0 ? available : items;
  const index = getDeterministicIndex(dayNumber, pool.length, offset);
  const selected = pool[index];
  
  trackUsedContent(recentKey, selected.id);
  return selected;
};

/**
 * Get the daily ayah based on local timezone with rotation logic.
 */
export const getDailyAyah = (category?: Ayah['category']): Ayah => {
  const dayNumber = getLocalDayNumber();
  const filtered = category ? ayat.filter(a => a.category === category) : ayat;
  return selectWithAvoidance(filtered, dayNumber, 'sakina-recent-ayat', category ? category.charCodeAt(0) : 0);
};

/**
 * Get the daily dua based on local timezone with rotation logic.
 */
export const getDailyDua = (category?: Dua['category']): Dua => {
  const dayNumber = getLocalDayNumber();
  const filtered = category ? duas.filter(d => d.category === category) : duas;
  return selectWithAvoidance(filtered, dayNumber, 'sakina-recent-duas', category ? category.charCodeAt(0) : 0);
};

/**
 * Get the daily dhikr based on local timezone with rotation logic.
 */
export const getDailyDhikr = (): Dhikr => {
  const dayNumber = getLocalDayNumber();
  return selectWithAvoidance(adhkar, dayNumber, 'sakina-recent-adhkar');
};

/**
 * Get content for a specific mood, avoiding recent repetition.
 */
export const getMoodContent = (mood: string, moodAyat: Ayah[], moodDuas: Dua[]) => {
  const dayNumber = getLocalDayNumber();
  const moodOffset = mood.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const ayah = selectWithAvoidance(
    moodAyat, 
    dayNumber, 
    `sakina-recent-mood-ayat-${mood}`, 
    moodOffset
  );
  
  const dua = selectWithAvoidance(
    moodDuas, 
    dayNumber, 
    `sakina-recent-mood-duas-${mood}`, 
    moodOffset + 1000
  );
  
  return { ayah, dua };
};

/**
 * Sabr Tracker daily prompts - different wording each day, same meaning.
 */
export const sabrPrompts = [
  "You showed patience today by…",
  "A moment where you chose peace over reaction…",
  "Today, you trusted Allah's timing when…",
  "You remained calm in the face of…",
  "An act of quiet strength you're grateful for…",
  "Where did you hold back and choose patience?",
  "You preserved your inner peace when…",
  "A test you navigated with sabr…",
  "Today, patience looked like…",
  "You surrendered control and trusted by…",
  "A moment of stillness amid difficulty…",
  "You chose restraint over reaction when…",
  "Today, you persevered through…",
  "An instance where you embodied patience…",
];

/**
 * Get the daily Sabr prompt based on local timezone.
 */
export const getDailySabrPrompt = (): string => {
  const dayNumber = getLocalDayNumber();
  const index = getDeterministicIndex(dayNumber, sabrPrompts.length, 42);
  return sabrPrompts[index];
};

/**
 * Check if daily usage should reset (based on local timezone).
 */
export const shouldResetDailyUsage = (storedDateKey: string): boolean => {
  return !isToday(storedDateKey);
};

/**
 * Get or reset daily AI usage count.
 */
export const getDailyAIUsage = (): { count: number; dateKey: string } => {
  try {
    const stored = localStorage.getItem('sakina-ai-usage');
    if (!stored) {
      return { count: 0, dateKey: getLocalDateKey() };
    }
    
    const parsed = JSON.parse(stored);
    const storedDate = parsed.date || parsed.dateKey;
    
    if (shouldResetDailyUsage(storedDate)) {
      const newState = { count: 0, dateKey: getLocalDateKey() };
      localStorage.setItem('sakina-ai-usage', JSON.stringify(newState));
      return newState;
    }
    
    return { count: parsed.count || 0, dateKey: storedDate };
  } catch {
    return { count: 0, dateKey: getLocalDateKey() };
  }
};

/**
 * Increment and save daily AI usage.
 */
export const incrementAIUsage = (currentCount: number): number => {
  const newCount = currentCount + 1;
  localStorage.setItem('sakina-ai-usage', JSON.stringify({
    count: newCount,
    dateKey: getLocalDateKey()
  }));
  return newCount;
};
