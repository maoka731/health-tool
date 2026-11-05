"use client";

import Image from "next/image";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  EMPTY_BOOK,
  MAX_REDRAWS,
  MISSIONS,
  addDays,
  bookStats,
  dateKey,
  drawMission,
  findMission,
  parseKey,
  type StampBook,
} from "@/lib/missions";
import { STORAGE_KEYS, useStoredState } from "@/lib/storage";
import FortuneCylinder from "./FortuneCylinder";
import MissionSlip from "./MissionSlip";
import { BadgeShelf, LineProgress, MonthBook, StampLog, StatTickets, WeekStrip } from "./StampPanels";
import { useTodayKey } from "./useToday";

const SHAKE_MS = 900;

export default function StampStation() {
  const todayKey = useTodayKey();
  const [book, setBook] = useStoredState<StampBook>(STORAGE_KEYS.stampBook, EMPTY_BOOK);
  const [shaking, setShaking] = useState(false);
  const [justStamped, setJustStamped] = useState(false);

  // 伺服器端與 hydration 前不知道「今天」，先顯示骨架
  if (!todayKey) return <StationSkeleton />;

  const today = parseKey(todayKey);
  const record = book.days[todayKey];
  const mission = findMission(record?.missionId);
  const stats = bookStats(book, today);

  function updateToday(patch: (prev: StampBook["days"][string] | undefined) => StampBook["days"][string] | undefined) {
    setBook((prev) => {
      const next = patch(prev.days[todayKey!]);
      const days = { ...prev.days };
      if (next) days[todayKey!] = next;
      else delete days[todayKey!];
      return { days };
    });
  }

  function shakeAndDraw() {
    if (shaking || record) return;
    setShaking(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => {
        const m = drawMission();
        updateToday(() => ({ missionId: m.id, drawnAt: new Date().toISOString(), redraws: 0 }));
        setShaking(false);
      },
      reduced ? 0 : SHAKE_MS,
    );
  }

  function redraw() {
    if (!record || record.redraws >= MAX_REDRAWS || record.stampedAt) return;
    const m = drawMission([record.missionId]);
    updateToday((prev) => prev && { ...prev, missionId: m.id, redraws: prev.redraws + 1, drawnAt: new Date().toISOString() });
  }

  function stamp() {
    setJustStamped(true);
    updateToday((prev) => prev && { ...prev, stampedAt: new Date().toISOString() });
  }

  function unstamp() {
    setJustStamped(false);
    updateToday((prev) => prev && { ...prev, stampedAt: undefined });
  }

  return (
    <div className="mt-6 space-y-10">
      <h1 className="sr-only">健康集章站：每天抽一支任務籤，完成就蓋一個章</h1>

      {/* ── 今日任務籤＋本週集章 ── */}
      <div className="grid gap-8 lg:grid-cols-12">
        <section className="retro-card px-4 pt-5 pb-8 sm:px-7 lg:col-span-7" aria-labelledby="draw-title">
          <SectionTitle id="draw-title" en="TODAY'S MISSION" title="今日任務籤" />

          {!mission ? (
            <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
              <button
                type="button"
                onClick={shakeAndDraw}
                disabled={shaking}
                aria-label="搖籤筒，抽今天的任務"
                className="group w-44 shrink-0 cursor-pointer transition hover:-translate-y-1 sm:w-52"
              >
                <FortuneCylinder shaking={shaking} drawn={false} className="w-full" />
              </button>
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <p className="font-display text-2xl text-ink">今天的任務是什麼呢？</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  搖一搖籤筒，抽出一個小小的健康任務。
                  <br />
                  完成後蓋上車站紀念章，集滿解鎖徽章！
                </p>
                <button
                  type="button"
                  onClick={shakeAndDraw}
                  disabled={shaking}
                  className="mt-4 flex items-center gap-2 rounded-full border-2 border-ink bg-brick px-6 py-3 font-[family-name:var(--font-chiron)] text-xl font-black text-paper-light shadow-[0_4px_0_#3e3a35] outline-[1.5px] outline-offset-[-7px] outline-paper-light/70 outline-dashed transition active:translate-y-0.5 active:shadow-[0_2px_0_#3e3a35] disabled:opacity-70"
                >
                  {shaking ? "搖呀搖…" : "搖一搖・抽任務籤 ▶"}
                </button>
                <p className="mt-2 text-xs text-ink-soft">籤池共有 {MISSIONS.length} 支籤，每天抽一次</p>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid items-start gap-4 md:grid-cols-[150px_1fr] md:gap-6">
              <div className="hidden md:block">
                <FortuneCylinder shaking={false} drawn className="w-full" />
              </div>
              <div>
                <MissionSlip
                  key={record!.missionId}
                  mission={mission}
                  record={record!}
                  today={today}
                  justStamped={justStamped}
                  onStamp={stamp}
                  onRedraw={redraw}
                  onUnstamp={unstamp}
                />
                {record?.stampedAt && <NextDrawCountdown />}
              </div>
            </div>
          )}
        </section>

        <section className="retro-card px-4 pt-5 pb-6 sm:px-6 lg:col-span-5" aria-labelledby="week-title">
          <SectionTitle id="week-title" en="THIS WEEK" title="本週集章" />
          <WeekStrip book={book} today={today} />
          <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-4">
            <p className="mb-3 text-sm font-bold tracking-widest text-ink">四條路線進度</p>
            <LineProgress stats={stats} />
          </div>
        </section>
      </div>

      {/* ── 統計車票 ── */}
      <StatTickets stats={stats} />

      {/* ── 集章本＋徽章 ── */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <section className="lg:col-span-7" aria-label="集章本">
          <MonthBook key={todayKey.slice(0, 7)} book={book} today={today} />
        </section>
        <div className="space-y-8 lg:col-span-5">
          <section className="retro-card px-4 pt-5 pb-6 sm:px-6" aria-labelledby="badge-title">
            <SectionTitle id="badge-title" en="BADGES" title="徽章收藏" />
            <BadgeShelf stats={stats} />
          </section>
          <section className="retro-card px-4 pt-5 pb-4 sm:px-6" aria-labelledby="log-title">
            <SectionTitle id="log-title" en="LOG" title="集章紀錄" />
            <StampLog book={book} />
          </section>
        </div>
      </div>

      <DemoTools todayKey={todayKey} setBook={setBook} />
    </div>
  );
}

function SectionTitle({ id, en, title }: { id: string; en: string; title: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline gap-2">
      <h2 id={id} className="font-display text-2xl text-brick sm:text-3xl">
        {title}
      </h2>
      <span className="text-[11px] font-bold tracking-[0.25em] text-ink-soft">{en}</span>
    </div>
  );
}

// 每秒更新一次的時鐘（只在瀏覽器端）
function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}

/** 完成後：距離下一支籤（明天 0:00）的倒數 */
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
      <span className="whitespace-nowrap">下一班任務籤</span>
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

/** 示範工具：方便預覽集章本的樣子（之後正式上線可移除） */
function DemoTools({
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
    for (let i = 1; i <= 24; i++) {
      // 前 5 天連續完成，之後約 7 成機率完成
      if (i > 5 && Math.random() > 0.7) continue;
      const d = addDays(today, -i);
      const m = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
      const t = new Date(d);
      t.setHours(12);
      days[dateKey(d)] = { missionId: m.id, drawnAt: t.toISOString(), redraws: 0, stampedAt: t.toISOString() };
    }
    // 保留今天的抽籤與蓋章，只填入過去的日子
    setBook((prev) => ({ days: { ...days, ...(prev.days[todayKey] ? { [todayKey]: prev.days[todayKey] } : {}) } }));
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-soft">
      <span>集章紀錄只存在這個瀏覽器裡</span>
      <button type="button" onClick={loadDemo} className="underline decoration-dotted underline-offset-4 hover:text-brick">
        載入示範紀錄（預覽用）
      </button>
      {confirming ? (
        <span className="flex items-center gap-2">
          確定要清除所有紀錄？
          <button
            type="button"
            onClick={() => {
              setBook(EMPTY_BOOK);
              setConfirming(false);
            }}
            className="font-bold text-brick underline underline-offset-4"
          >
            清除
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="underline underline-offset-4">
            取消
          </button>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="underline decoration-dotted underline-offset-4 hover:text-brick">
          清除全部紀錄
        </button>
      )}
    </div>
  );
}

function StationSkeleton() {
  return (
    <div className="mt-6 space-y-8" aria-busy="true">
      <div className="h-36 animate-pulse rounded-2xl bg-[#2c5f5a]/70" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="h-80 animate-pulse rounded-2xl bg-paper-light lg:col-span-7" />
        <div className="h-80 animate-pulse rounded-2xl bg-paper-light lg:col-span-5" />
      </div>
    </div>
  );
}
