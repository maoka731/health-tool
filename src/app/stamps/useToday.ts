"use client";

import { useSyncExternalStore } from "react";
import { dateKey } from "@/lib/missions";

// 「今天」只在瀏覽器端決定（伺服器時區可能不同），並在跨過午夜時自動更新
function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 30_000);
  window.addEventListener("focus", callback);
  return () => {
    window.clearInterval(id);
    window.removeEventListener("focus", callback);
  };
}

/** 回傳今天的 YYYY-MM-DD；伺服器端與 hydration 前為 null */
export function useTodayKey(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => dateKey(new Date()),
    () => null,
  );
}
