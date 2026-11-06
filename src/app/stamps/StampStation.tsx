"use client";

import Image from "next/image";
import { Children, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  CATEGORY_ORDER,
  EMPTY_BOOK,
  MAX_REDRAWS,
  addDays,
  bookStats,
  dateKey,
  drawMission,
  findMission,
  parseKey,
  stampedCategories,
  type DayRecord,
  type Draw,
  type MissionCategory,
  type StampBook,
} from "@/lib/missions";
import { STORAGE_KEYS, useStoredState, writeStored } from "@/lib/storage";
import MissionCard, { CylinderBody, SlipBody } from "./MissionCard";
import { BadgeShelf, MonthBook } from "./StampPanels";
import { useTodayKey } from "./useToday";

const SHAKE_MS = 800;
const POP_MS = 550;

export default function StampStation() {
  const todayKey = useTodayKey();
  const [book, setBook] = useStoredState<StampBook>(STORAGE_KEYS.stampBook, EMPTY_BOOK);
  // 抽籤動畫：先搖晃籤筒，再彈出一支籤，最後展開籤詩
  const [anim, setAnim] = useState<{ cat: MissionCategory; phase: "shake" | "pop" } | null>(null);
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
    if (anim || record[cat]) return;
    const commit = () => {
      const m = drawMission(cat);
      updateDraw(cat, () => ({ missionId: m.id, drawnAt: new Date().toISOString(), redraws: 0 }));
      setAnim(null);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return commit();
    setAnim({ cat, phase: "shake" });
    window.setTimeout(() => setAnim({ cat, phase: "pop" }), SHAKE_MS);
    window.setTimeout(commit, SHAKE_MS + POP_MS);
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
      <h1 className="sr-only">每日任務籤：每天抽三種任務籤，完成就蓋章</h1>

      {/* ── 今日三籤筒 ── */}
      <section
        className="retro-card relative overflow-hidden px-4 pt-5 pb-0 sm:px-7"
        aria-labelledby="draw-title"
      >
        {/* 標頭：小火車＋標題＋郵戳；右側進度與連續天數 */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/stamps/postmark.png"
              alt=""
              width={128}
              height={86}
              className="h-14 w-auto shrink-0 -rotate-6 sm:h-[4.5rem]"
              priority
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 id="draw-title" className="font-[family-name:var(--font-chiron)] text-3xl font-black text-brick sm:text-4xl">
                  今日任務籤
                </h2>
                <span className="text-xs font-bold tracking-[0.25em] text-ink-soft">TODAY&apos;S MISSIONS</span>
              </div>
              <p className="mt-0.5 text-sm text-ink">飲食・活動・身心三個籤筒，每天各抽一支，完成就蓋章！</p>
            </div>
          </div>
          <div className="flex items-stretch gap-2.5 pt-2">
            <BinderChip
              label="今日進度"
              value={`${stampedToday}/3`}
              sub={stampedToday === 3 ? "★ 完美！" : `還差 ${3 - stampedToday} 個章`}
              tone="gold"
            />
            <BinderChip label="連續集章" value={String(stats.streak)} sub="天" tone="brick" />
          </div>
        </div>

        {/* 三張任務卡：手機版橫向滑動切換，平板以上三欄並排 */}
        <CardCarousel>
          {CATEGORY_ORDER.map((cat) => {
            const draw = record[cat];
            const mission = findMission(draw?.missionId);
            return (
              <MissionCard key={cat} category={cat}>
                {!mission || !draw ? (
                  <CylinderBody
                    category={cat}
                    phase={anim?.cat === cat ? anim.phase : "idle"}
                    disabled={anim !== null}
                    onDraw={() => shakeAndDraw(cat)}
                  />
                ) : (
                  <SlipBody
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
              </MissionCard>
            );
          })}
        </CardCarousel>

        {/* 底部：探頭的小主廚、倒數或提示、草叢 */}
        <div className="relative mt-5 flex min-h-20 items-end justify-center">
          <Image src="/images/stamps/cloud.png" alt="" width={129} height={65} className="pointer-events-none absolute right-36 bottom-12 hidden h-7 w-auto opacity-80 lg:block" />
          <Image src="/images/stamps/bush.png" alt="" width={214} height={68} className="pointer-events-none absolute -right-2 bottom-0 hidden h-12 w-auto sm:block" />
          <div className="relative z-10 mb-5 w-full max-w-xl">
            {drawnToday > 0 ? <NextDrawCountdown left={3 - drawnToday} /> : <DrawHint left={3} />}
          </div>
        </div>
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

/** 活頁夾環扣的小卡（今日進度、連續集章） */
function BinderChip({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "gold" | "brick" }) {
  const gold = tone === "gold";
  return (
    <div
      className={`relative min-w-[5.5rem] rounded-lg border-2 border-ink px-3 pt-2.5 pb-1.5 text-center shadow-[2px_3px_0_rgb(62_58_53/0.3)] ${
        gold ? "bg-mustard text-ink" : "bg-brick text-paper-light"
      }`}
    >
      {/* 上方兩個環扣 */}
      <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-6" aria-hidden>
        <span className="h-5 w-2.5 rounded-full border-2 border-ink bg-[#d9d2c4]" />
        <span className="h-5 w-2.5 rounded-full border-2 border-ink bg-[#d9d2c4]" />
      </span>
      <p className="text-[11px] font-bold tracking-[0.15em] opacity-85">{label}</p>
      <p className="font-[family-name:var(--font-chiron)] text-3xl leading-tight font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-bold opacity-85">{sub}</p>
    </div>
  );
}

function DrawHint({ left }: { left: number }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/30 bg-[#fffaf0]/90 px-4 py-2.5 text-sm text-ink sm:rounded-full">
      <Image src="/images/stamps/train.png" alt="" width={104} height={101} className="h-7 w-auto shrink-0" />
      <span>
        還有 <b className="text-brick">{left}</b> 個籤筒等你抽，搖一搖看看今天的任務吧！
      </span>
    </div>
  );
}

// 每秒更新一次的時鐘（只在瀏覽器端）
function subscribeClock(cb: () => void) {
  const id = window.setInterval(cb, 1000);
  return () => window.clearInterval(id);
}

/** 抽了第一支籤之後：距離明天 0:00 換新籤的倒數（還有沒抽的籤筒會一併提醒） */
function NextDrawCountdown({ left: cylindersLeft }: { left: number }) {
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
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border-2 border-dashed border-ink/30 bg-[#fffaf0]/90 px-4 py-2.5 text-sm text-ink">
      <Image src="/images/stamps/train.png" alt="" width={104} height={101} className="h-7 w-auto" />
      <span className="whitespace-nowrap">
        {cylindersLeft > 0 ? (
          <>
            今天還能抽 <b className="text-brick">{cylindersLeft}</b> 個籤筒・下一班籤
          </>
        ) : (
          "今天的籤都抽完了，下一班籤"
        )}
      </span>
      <span className="whitespace-nowrap">
        還有
        <span className="mx-1.5 font-[family-name:var(--font-chiron)] text-lg font-black text-brick tabular-nums">
          {pad(Math.floor(left / 3600))}:{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}
        </span>
        進站！
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
                writeStored(STORAGE_KEYS.badgesSeen, null);
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

const CAROUSEL_LABELS = ["飲食籤", "活動籤", "身心籤"];

/** 手機：一次顯示一張，可左右滑動（scroll-snap）或用箭頭、圓點切換；md 以上改為三欄並排 */
function CardCarousel({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function goTo(i: number) {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const card = c as HTMLElement;
      const d = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setIndex(best);
  }

  return (
    <div className="relative mt-4">
      <div
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div key={i} className="flex w-full shrink-0 snap-center snap-always flex-col md:w-auto" aria-roledescription="slide">
            {child}
          </div>
        ))}
      </div>

      {/* 手機版控制列 */}
      <div className="mt-3 flex items-center justify-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          aria-label="上一個籤筒"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-[#fffaf0] text-lg text-ink shadow-[0_2px_0_#3e3a35] disabled:opacity-30"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`切換到${CAROUSEL_LABELS[i]}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full border border-ink/50 transition-all ${i === index ? "w-6 bg-brick" : "w-2.5 bg-[#fffaf0]"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(Math.min(items.length - 1, index + 1))}
          disabled={index === items.length - 1}
          aria-label="下一個籤筒"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-[#fffaf0] text-lg text-ink shadow-[0_2px_0_#3e3a35] disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
}
