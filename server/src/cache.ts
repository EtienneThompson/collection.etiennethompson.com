import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, "..", "cache.json");

interface CacheEntry {
  data: unknown;
  cachedAt: string; // ISO date string (YYYY-MM-DD)
}

interface CacheStore {
  [key: string]: CacheEntry;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function loadCache(): CacheStore {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading cache:", error);
  }
  return {};
}

function saveCache(cache: CacheStore): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Error saving cache:", error);
  }
}

export function getCached<T>(key: string): T | null {
  const cache = loadCache();
  const entry = cache[key];

  if (!entry) {
    return null;
  }

  // Check if cached today
  if (entry.cachedAt !== getTodayDate()) {
    // Expired, remove from cache
    delete cache[key];
    saveCache(cache);
    return null;
  }

  console.log(`[Cache] HIT: ${key}`);
  return entry.data as T;
}

export function setCache(key: string, data: unknown): void {
  const cache = loadCache();

  // Clean up expired entries while we're at it
  const today = getTodayDate();
  for (const k of Object.keys(cache)) {
    if (cache[k].cachedAt !== today) {
      delete cache[k];
    }
  }

  cache[key] = {
    data,
    cachedAt: today,
  };

  saveCache(cache);
  console.log(`[Cache] SET: ${key}`);
}

export function createCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined)
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${prefix}:${sortedParams}`;
}