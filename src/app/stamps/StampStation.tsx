"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import {
  CATEGORY_ORDER,
  EMPTY_BOOK,
  MAX_REDRAWS,
  MISSION_CATEGORIES,
  addDays,
  bookStats,
  dateKey,
  drawMission,
  findMission,
  missionsOf,
  parseKey,
  stampedCategories,
  type DayRecord,
  type Draw,
  type MissionCategory,
  type StampBook,
} from "@/lib/missions";
import { STORAGE_KEYS, useStoredState } from "@/lib/storage";
import FortuneCylinder from "./FortuneCylinder";
import MissionSlip from "./MissionSlip";
import { BadgeShelf, MonthBook } from "./StampPanels";
import { useTodayKey } from "./useToday";

const SHAKE_MS = 900;

export default function StampStation() {
  const todayKey = useTodayKey();
  const [book, setBook] = useStoredState<StampBook>(STORAGE_KEYS.stampBook, EMPTY_BOOK);
  const [shaking, setShaking] = useState<MissionCategory | null>(null);
  const [justStamped, setJustStamped] = useState<MissionCategory | null>(null);

  // 伺服器端與 hydration 前不知道「今天」，先顯示骨架
  if (!todayKey) return <StationSkeleton />;

  const today = parseKey(todayKey);
  const record: DayRecord = book.days[todayKey] ?? {};
  const stats = bookStats(book, today);
  const stampedToday = stampedCategories(record).length;
  const drawnToday = CATEGORY_ORDER.filter((c) => record[c]).length;

  function updateDraw(cat: MissionCategory, patch: (prev: Draw | undefined) => Draw | undefined) {
    setBook((prev) => {
      const day = { ...(prev.days[todayKey!] ?? {}) };
      const next = patch(day[cat]);
      if (next) day[cat] = next;
      else delete day[cat];
      const days = { ...prev.days };
      if (Object.keys(day).length > 0) days[todayKey!] = day;
      else delete days[todayKey!];
      return { days };
    });
  }

  function shakeAndDraw(cat: MissionCategory) {
    if (shaking || record[cat]) return;
    setShaking(cat);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => {
        const m = drawMission(cat);
        updateDraw(cat, () => ({ missionId: m.id, drawnAt: new Date().toISOString(), redraws: 0 }));
        setShaking(null);
      },
      reduced ? 0 : SHAKE_MS,
    );
  }

  function redraw(cat: MissionCategory) {
    const d = record[cat];
    if (!d || d.redraws >= MAX_REDRAWS || d.stampedAt) return;
    const m = drawMission(cat, [d.missionId]);
    updateDraw(cat, (prev) => prev && { ...prev, missionId: m.id, redraws: prev.redraws + 1, drawnAt: new Date().toISOString() });
  }

  function stamp(cat: MissionCategory) {
    setJustStamped(cat);
    updateDraw(cat, (prev) => prev && { ...prev, stampedAt: new Date().toISOString() });
  }

  function unstamp(cat: MissionCategory) {
    setJustStamped(null);
    updateDraw(cat, (prev) => prev && { ...prev, stampedAt: undefined });
  }

  return (
    <div className="mt-6 space-y-10">
      <h1 className="sr-only">健康集章站：每天抽三種任務籤，完成就蓋章</h1>

      {/* ── 今日三籤筒 ── */}
      <section className="retro-card px-4 pt-5 pb-8 sm:px-7" aria-labelledby="draw-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 id="draw-title" className="font-display text-2xl text-brick sm:text-3xl">
                今日任務籤
              </h2>
              <span className="text-[11px] font-bold tracking-[0.25em] text-ink-soft">TODAY&apos;S MISSIONS</span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">飲食、活動、身心三個籤筒，每天各抽一支，完成就蓋章！</p>
          </div>
          <div className="flex items-stretch gap-2">
            <TodayChip label="今日進度" value={`${stampedToday}/3`} sub={stampedToday === 3 ? "★ 完美！" : "個章"} tone={stampedToday === 3 ? "gold" : "paper"} />
            <TodayChip label="連續集章" value={String(stats.streak)} sub="天" tone="brick" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-5">
          {CATEGORY_ORDER.map((cat) => {
            const c = MISSION_CATEGORIES[cat];
            const draw = record[cat];
            const mission = findMission(draw?.missionId);
            const isShaking = shaking === cat;
            return (
              <article key={cat} className="flex flex-col" aria-label={`${c.label}籤筒`}>
                {/* 籤筒標頭 */}
                <div
                  className="flex items-center justify-between rounded-t-xl border-2 border-b-0 border-ink px-3 py-1.5 text-paper-light"
                  style={{ background: c.deep }}
                >
                  <span className="font-[family-name:var(--font-chiron)] text-lg font-black">
                    {c.icon} {c.label}籤
                  </span>
                  <span className="text-[11px] tracking-[0.2em] opacity-80">{c.station}・{c.en}</span>
                </div>
                <div className="flex flex-1 flex-col rounded-b-xl border-2 border-ink p-3" style={{ background: `${c.tint}66` }}>
                  {!mission || !draw ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-2 text-center">
                      <button
                        type="button"
                        onClick={() => shakeAndDraw(cat)}
                        disabled={shaking !== null}
                        aria-label={`搖${c.label}籤筒`}
                        className="w-32 transition hover:-translate-y-1 disabled:hover:translate-y-0 sm:w-36"
                      >
                        <FortuneCylinder
                          shaking={isShaking}
                          drawn={false}
                          color={c.color}
                          deep={c.deep}
                          label={`${c.label}籤`}
                          className="w-full"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => shakeAndDraw(cat)}
                        disabled={shaking !== null}
                        className="mt-3 rounded-full border-2 border-ink px-5 py-2 font-[family-name:var(--font-chiron)] text-base font-black text-paper-light shadow-[0_3px_0_#3e3a35] transition active:translate-y-0.5 active:shadow-[0_1px_0_#3e3a35] disabled:opacity-60"
                        style={{ background: c.deep }}
                      >
                        {isShaking ? "搖呀搖…" : "搖一搖・抽籤 ▶"}
                      </button>
                      <p className="mt-2 text-[11px] text-ink-soft">籤筒裡有 {missionsOf(cat).length} 支籤</p>
                    </div>
                  ) : (
                    <MissionSlip
                      key={draw.missionId}
                      mission={mission}
                      draw={draw}
                      today={today}
                      justStamped={justStamped === cat}
                      onStamp={() => stamp(cat)}
                      onRedraw={() => redraw(cat)}
                      onUnstamp={() => unstamp(cat)}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {drawnToday === 3 && <NextDrawCountdown />}
      </section>

      {/* ── 集章本＋徽章 ── */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <section className="lg:col-span-7" aria-label="集章本">
          <MonthBook key={todayKey.slice(0, 7)} book={book} today={today} />
        </section>
        <section className="retro-card self-start px-4 pt-5 pb-6 sm:px-6 lg:col-span-5" aria-labelledby="badge-title">
          <div className="mb-4 flex items-baseline gap-2">
            <h2 id="badge-title" className="font-display text-2xl text-brick sm:text-3xl">
              徽章收藏
            </h2>
            <span className="text-[11px] font-bold tracking-[0.25em] text-ink-soft">BADGES</span>
          </div>
          <BadgeShelf stats={stats} />
        </section>
      </div>

      <TestTools todayKey={todayKey} setBook={setBook} />
    </div>
  );
}

function TodayChip({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "paper" | "brick" | "gold" }) {
  const style =
    tone === "brick"
      ? "border-ink bg-brick text-paper-light"
      : tone === "gold"
        ? "border-ink bg-mustard text-ink"
        : "border-ink bg-[#fffaf0] text-ink";
  return (
    <div className={`min-w-20 rounded-xl border-2 px-3 py-1.5 text-center shadow-[0_3px_0_rgb(62_58_53/0.25)] ${style}`}>
      <p className="text-[10px] tracking-[0.2em] opacity-75">{label}</p>
      <p className="font-[family-name:var(--font-chiron)] text-2xl leading-tight font-black tabular-nums">{value}</p>
      <p className="text-[11px] opacity-75">{sub}</p>
    </div>
  );
}

// 每秒更新一次的時鐘（只在瀏覽器端）
function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}

/** 三支籤都抽完後：距離明天 0:00 換新籤的倒數 */
function NextDrawCountdown() {
  const now = useSyncExternalStore(
    subscribeClock,
    () => Math.floor(Date.now() / 1000),
    () => 0,
  );
  if (!now) return null;
  const n = new Date(now * 1000);
  const midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime() / 1000;
  const left = Math.max(0, midnight - now);
  const pad = (v: number) => String(v).padStart(2, "0");
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border-2 border-dashed border-ink/30 bg-paper/50 px-4 py-2.5 text-sm text-ink-soft">
      <Image src="/images/lunch-train.png" alt="" width={107} height={88} className="h-7 w-auto" />
      <span className="whitespace-nowrap">今天的籤都抽完了，下一班籤</span>
      <span className="whitespace-nowrap">
        還有
        <span className="mx-1.5 font-[family-name:var(--font-chiron)] text-lg font-black text-brick tabular-nums">
          {pad(Math.floor(left / 3600))}:{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}
        </span>
        進站
      </span>
    </div>
  );
}

/** 測試工具：重設今天、載入示範紀錄、清除全部（之後正式上線可移除） */
function TestTools({
  todayKey,
  setBook,
}: {
  todayKey: string;
  setBook: (b: StampBook | ((prev: StampBook) => StampBook)) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function loadDemo() {
    const today = parseKey(todayKey);
    const days: StampBook["days"] = {};
    for (let i = 1; i <= 26; i++) {
      // 前 5 天連續有完成，之後約 7 成機率有完成
      if (i > 5 && Math.random() > 0.7) continue;
      const d = addDays(today, -i);
      const t = new Date(d);
      t.setHours(12);
      const rec: DayRecord = {};
      for (const cat of CATEGORY_ORDER) {
        const r = Math.random();
        if (r < 0.2) continue; // 沒抽
        const m = drawMission(cat);
        rec[cat] = { missionId: m.id, drawnAt: t.toISOString(), redraws: 0, stampedAt: r < 0.8 ? t.toISOString() : undefined };
      }
      // 確保每天至少一個章
      const first = CATEGORY_ORDER.find((c) => rec[c]) ?? "eat";
      rec[first] = { missionId: rec[first]?.missionId ?? drawMission(first).id, drawnAt: t.toISOString(), redraws: 0, stampedAt: t.toISOString() };
      days[dateKey(d)] = rec;
    }
    // 保留今天的紀錄，只填入過去的日子
    setBook((prev) => ({ days: { ...days, ...(prev.days[todayKey] ? { [todayKey]: prev.days[todayKey] } : {}) } }));
  }

  function resetToday() {
    setBook((prev) => {
      const days = { ...prev.days };
      delete days[todayKey];
      return { days };
    });
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-ink/30 bg-paper/40 px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span className="rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-paper-light">
          測試工具
        </span>
        <button
          type="button"
          onClick={resetToday}
          className="rounded-full border-2 border-ink bg-[#fffaf0] px-4 py-1.5 text-sm font-bold text-ink shadow-[0_2px_0_#3e3a35] transition hover:bg-mustard/30 active:translate-y-0.5 active:shadow-none"
        >
          ↺ Reset 今天的籤
        </button>
        <button
          type="button"
          onClick={loadDemo}
          className="rounded-full border-2 border-ink/40 bg-[#fffaf0] px-4 py-1.5 text-sm font-bold text-ink-soft transition hover:border-ink hover:text-ink"
        >
          載入示範紀錄
        </button>
        {confirming ? (
          <span className="flex items-center gap-2 text-sm text-ink">
            確定要清除所有紀錄？
            <button
              type="button"
              onClick={() => {
                setBook(EMPTY_BOOK);
                setConfirming(false);
              }}
              className="rounded-full border-2 border-brick bg-brick px-3 py-1 text-sm font-bold text-white"
            >
              清除
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="text-sm underline underline-offset-4">
              取消
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-full border-2 border-brick/50 bg-[#fffaf0] px-4 py-1.5 text-sm font-bold text-brick transition hover:border-brick"
          >
            清除全部紀錄
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-ink-soft">
        「Reset 今天的籤」會清掉今天三個籤筒的抽籤與蓋章；過去的紀錄都會保留。集章紀錄只存在這個瀏覽器裡。
      </p>
    </div>
  );
}

function StationSkeleton() {
  return (
    <div className="mt-6 space-y-8" aria-busy="true">
      <div className="h-[28rem] animate-pulse rounded-2xl bg-paper-light" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="h-96 animate-pulse rounded-2xl bg-paper-light lg:col-span-7" />
        <div className="h-96 animate-pulse rounded-2xl bg-paper-light lg:col-span-5" />
      </div>
    </div>
  );
}
