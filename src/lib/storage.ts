"use client";

// 瀏覽器本機儲存（localStorage）
// 目前沒有後端，所有使用者資料都存在使用者自己的瀏覽器。
// 之後若改接資料庫，只要替換這個檔案的讀寫實作，元件端的 hook 介面不用變。

import { useCallback, useSyncExternalStore } from "react";

/** 所有儲存鍵集中管理；結構有破壞性變更時把版本號 +1 */
export const STORAGE_KEYS = {
  /** 營養計算頁送出的身體資料（午餐推薦會讀這份） */
  healthProfile: "hbe:health-profile:v1",
  /** 午餐抽籤轉盤上的候選餐點 */
  wheelOptions: "hbe:wheel-options:v2",
  /** 健康集章站：每日任務籤與蓋章紀錄 */
  stampBook: "hbe:stamp-book:v2",
  /** （預留）餐食紀錄：使用者每天吃了什麼 */
  mealLog: "hbe:meal-log:v1",
  /** （預留）餐食圖鑑：使用者收藏、自建的餐點 */
  mealBook: "hbe:meal-book:v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

const CHANGE_EVENT = "hbe:storage-change";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // 無痕模式或儲存空間被封鎖時，資料只保留在這次瀏覽
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** 直接讀取（非 React 環境用） */
export function readStored<T>(key: StorageKey): T | null {
  if (typeof window === "undefined") return null;
  const raw = safeGet(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** 直接寫入（非 React 環境用） */
export function writeStored<T>(key: StorageKey, value: T | null) {
  safeSet(key, value === null ? null : JSON.stringify(value));
}

// 以原始字串做快取，避免 useSyncExternalStore 每次拿到不同物件而無限重繪
const parseCache = new Map<string, { raw: string | null; value: unknown }>();

/**
 * 讀寫本機儲存的 React hook。
 * 伺服器端與第一次 hydration 會拿到 `fallback`，之後自動換成儲存的值；
 * 同一頁或其他分頁寫入時都會即時同步。
 */
export function useStoredState<T>(key: StorageKey, fallback: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => safeGet(key),
    () => null,
  );

  let value: T = fallback;
  if (raw !== null) {
    const cached = parseCache.get(key);
    if (cached && cached.raw === raw) {
      value = cached.value as T;
    } else {
      try {
        value = JSON.parse(raw) as T;
        parseCache.set(key, { raw, value });
      } catch {
        value = fallback;
      }
    }
  }

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStored<T>(key) ?? fallback;
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeStored(key, resolved);
    },
    // fallback 只在沒有儲存值時使用，不需要讓 setter 跟著變動
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue, raw !== null] as const;
}
