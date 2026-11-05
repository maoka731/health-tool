"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  BADGES,
  CATEGORY_ORDER,
  MISSION_CATEGORIES,
  WEEKDAY_LABELS,
  dateKey,
  dayStatus,
  doneStampImage,
  findMission,
  formatTime,
  luckOf,
  monthGrid,
  parseKey,
  stampedCategories,
  type BookStats,
  type StampBook,
} from "@/lib/missions";
import NotebookRings from "@/components/NotebookRings";
import { STORAGE_KEYS, useStoredState } from "@/lib/storage";
import StationStamp, { stampTilt } from "./StationStamp";

// ─────────────────────────────────────────────
// 集章本：月曆＋點日期看細節
// ─────────────────────────────────────────────

export function MonthBook({ book, today }: { book: StampBook; today: Date }) {
  const todayKey = dateKey(today);
  const [cursor, setCursor] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
  }));
  // 點日期才跳出當天細節
  const [selected, setSelected] = useState<string | null>(null);
  const cells = monthGrid(cursor.y, cursor.m);
  const shift = (n: number) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const isCurrent =
    cursor.y === today.getFullYear() && cursor.m === today.getMonth();
  const monthDays = cells.filter((d): d is Date => d !== null);
  const doneCount = monthDays.filter(
    (d) => dayStatus(book.days[dateKey(d)]) !== "none",
  ).length;
  const perfectCount = monthDays.filter(
    (d) => dayStatus(book.days[dateKey(d)]) === "perfect",
  ).length;

  return (
    <div className="relative">
      <div className="notebook-back" aria-hidden />
      <div className="notebook px-2 pt-12 pb-4 sm:px-6 sm:pb-5">
        <NotebookRings compact />
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brick">
            <span className="text-mustard">★</span>我的集章本
            <span className="text-mustard">★</span>
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="上個月"
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink/30 bg-[#fffaf0] text-ink hover:border-ink"
            >
              ‹
            </button>
            <span className="min-w-28 text-center font-display text-lg text-ink">
              {cursor.y} 年 {cursor.m + 1} 月
            </span>
            <button
              type="button"
              onClick={() => shift(1)}
              disabled={isCurrent}
              aria-label="下個月"
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink/30 bg-[#fffaf0] text-ink hover:border-ink disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-sm text-ink-soft">
          <span>
            這個月完成 <b className="text-ink">{doneCount}</b> 天・完美{" "}
            <b className="text-ink">{perfectCount}</b> 天
          </span>
        </div>

        <div className="note-box p-1! sm:p-3!">
          <div className="mb-1 grid grid-cols-7 pt-1 text-center text-xs font-bold text-ink-soft sm:pt-0">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <ol className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {cells.map((d, i) => {
              if (!d) return <li key={`pad-${i}`} aria-hidden />;
              const key = dateKey(d);
              const rec = book.days[key];
              const status = dayStatus(rec);
              const cats = stampedCategories(rec);
              const isToday = key === todayKey;
              const future = key > todayKey;
              const isSelected = key === selected;
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={future}
                    onClick={() => setSelected(key)}
                    aria-haspopup="dialog"
                    aria-pressed={isSelected}
                    aria-label={`${d.getMonth() + 1} 月 ${d.getDate()} 日${status === "perfect" ? "，完美" : status === "done" ? "，完成" : ""}`}
                    className={`relative flex aspect-[4/5] w-full flex-col items-center justify-center rounded-lg sm:aspect-square border-2 transition ${
                      isSelected
                        ? "border-ink bg-[#fffaf0] shadow-[0_2px_0_#3e3a35]"
                        : "border-transparent hover:border-ink/30"
                    } ${status === "perfect" ? "bg-mustard/25" : status === "done" ? "bg-[#fffaf0]" : ""} disabled:cursor-default disabled:opacity-35`}
                  >
                    <span
                      className={`absolute top-0.5 left-1 z-10 text-[11px] leading-tight font-bold sm:text-xs sm:font-normal ${
                        isToday
                          ? "rounded-full bg-brick px-1 font-bold text-white"
                          : "text-ink-soft"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {status !== "none" && (
                      <>
                        <Image
                          src={doneStampImage(cats.length)}
                          alt=""
                          width={240}
                          height={239}
                          className="mt-2 h-auto w-[82%] sm:-mt-2 sm:w-[62%] sm:max-w-14"
                          style={{
                            transform: `rotate(${((d.getDate() * 37) % 24) - 12}deg)`,
                          }}
                        />
                        {/* 當天蓋了哪幾種章 */}
                        <span className="absolute bottom-0.5 flex gap-0.5 sm:bottom-1">
                          {cats.map((c) => (
                            <span
                              key={c}
                              className="h-1 w-1 rounded-full ring-1 ring-[#fffaf0] sm:h-1.5 sm:w-1.5 sm:ring-0"
                              style={{
                                background: MISSION_CATEGORIES[c].color,
                              }}
                            />
                          ))}
                        </span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {selected && (
          <DayDetail
            book={book}
            dayKey={selected}
            todayKey={todayKey}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

/** 點選日期後顯示：那天三種籤筒各抽到什麼、幾點蓋章 */
function DayDetail({
  book,
  dayKey,
  todayKey,
  onClose,
}: {
  book: StampBook;
  dayKey: string;
  todayKey: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const d = parseKey(dayKey);
  const rec = book.days[dayKey];
  const status = dayStatus(rec);
  const isToday = dayKey === todayKey;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${d.getMonth() + 1} 月 ${d.getDate()} 日的集章紀錄`}
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative w-full max-w-md rounded-2xl border-2 border-ink bg-[#fffaf0] px-4 pt-3 pb-4 shadow-[4px_5px_0_rgb(62_58_53/0.3)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          autoFocus
          className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper-light text-lg text-ink shadow-[0_2px_0_#3e3a35] hover:bg-mustard/40"
        >
          ×
        </button>
        <div className="mb-2 flex items-center justify-between gap-2 pr-4">
          <p className="font-display text-lg text-ink">
            {d.getMonth() + 1} 月 {d.getDate()} 日{isToday && "（今天）"}
          </p>
          {status !== "none" && (
            <span className="flex items-center gap-1.5">
              <Image
                src={doneStampImage(stampedCategories(rec).length)}
                alt=""
                width={240}
                height={239}
                className="h-9 w-9 -rotate-12"
              />
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${status === "perfect" ? "bg-[#d98f1c]" : "bg-brick"}`}
              >
                {status === "perfect" ? "★ 完美" : "完成"}
              </span>
            </span>
          )}
        </div>
        <ul className="divide-y-2 divide-dashed divide-ink/15">
          {CATEGORY_ORDER.map((cat) => {
            const c = MISSION_CATEGORIES[cat];
            const draw = rec?.[cat];
            const m = findMission(draw?.missionId);
            return (
              <li key={cat} className="flex items-center gap-3 py-2">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                  {draw?.stampedAt && m ? (
                    <StationStamp
                      category={cat}
                      date={d}
                      size={48}
                      rotate={stampTilt(dayKey + cat)}
                    />
                  ) : (
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed"
                      style={{ borderColor: c.color }}
                      aria-hidden
                    >
                      <Image
                        src={c.iconImg}
                        alt=""
                        width={68}
                        height={66}
                        className="h-6 w-auto opacity-70"
                      />
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold" style={{ color: c.deep }}>
                    {c.label}籤
                    {m && (
                      <span className="ml-1.5 font-normal text-ink-soft">
                        第 {m.no} 首・{luckOf(m)}
                      </span>
                    )}
                  </p>
                  <p className="truncate font-bold text-ink">
                    {m ? m.title : isToday ? "今天還沒抽" : "這天沒有抽"}
                  </p>
                </div>
                <span className="shrink-0 text-right text-xs text-ink-soft">
                  {draw?.stampedAt ? (
                    <>
                      <span className="block font-bold text-leaf">已蓋章</span>
                      {formatTime(draw.stampedAt)}
                    </>
                  ) : draw ? (
                    <>
                      <span className="block">未完成</span>
                      抽於 {formatTime(draw.drawnAt)}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 徽章牆：歷史以來的成就，附進度數字
// ─────────────────────────────────────────────

let pendingSeen: number | undefined;

export function BadgeShelf({ stats }: { stats: BookStats }) {
  const [seen, setSeen] = useStoredState<string[]>(STORAGE_KEYS.badgesSeen, []);
  const unlocked = BADGES.filter((b) => b.value(stats) >= b.goal).length;
  // NEW 標籤在這次瀏覽期間保留，離開頁面時才記為已看過（下次進來就不再顯示）
  const unlockedIds = BADGES.filter((b) => b.value(stats) >= b.goal).map((b) => b.id);
  const latest = useRef(unlockedIds);
  useEffect(() => {
    latest.current = unlockedIds;
  });
  useEffect(() => {
    // 開發模式的 StrictMode 會「掛載→卸載→再掛載」，延後寫入並在重新掛載時取消
    window.clearTimeout(pendingSeen);
    const markSeen = () =>
      setSeen((prev) => {
        const add = latest.current.filter((id) => !prev.includes(id));
        return add.length ? [...prev, ...add] : prev;
      });
    window.addEventListener("pagehide", markSeen);
    return () => {
      window.removeEventListener("pagehide", markSeen);
      pendingSeen = window.setTimeout(markSeen, 0);
    };
  }, [setSeen]);
  return (
    <>
      <p className="-mt-2 mb-5 text-sm text-ink-soft">
        已獲得 <b className="text-ink">{unlocked}</b> / {BADGES.length} 枚・累積{" "}
        <b className="text-ink">{stats.total}</b> 個章
      </p>
      <ul className="mx-auto flex max-w-xl flex-wrap justify-center gap-y-5">
        {BADGES.map((b) => {
          const v = Math.min(b.value(stats), b.goal);
          const on = v >= b.goal;
          const isNew = on && !seen.includes(b.id);
          return (
            <li key={b.id} className="flex w-1/3 flex-col items-center px-1 text-center">
              <span
                role="img"
                aria-label={`${b.name}徽章${isNew ? "，新解鎖" : on ? "，已獲得" : "，未獲得"}`}
                className={`relative flex aspect-square w-20 items-center justify-center min-[360px]:w-24 sm:w-28 lg:w-32 ${isNew ? "badge-new" : ""}`}
              >
                <Image
                  src={b.image}
                  alt=""
                  width={180}
                  height={180}
                  className={`relative max-h-full w-auto object-contain ${
                    on
                      ? "drop-shadow-[1px_2px_0_rgb(62_58_53/0.18)]"
                      : "opacity-60 grayscale-[0.9] sepia-[0.15]"
                  }`}
                />
                {!on && <LockMark />}
                {isNew && (
                  <span className="absolute -top-1 -left-2 rotate-[-10deg] rounded-full border-2 border-ink bg-mustard px-2 py-0.5 font-[family-name:var(--font-chiron)] text-[11px] font-black text-ink shadow-[0_2px_0_#3e3a35]">
                    NEW!
                  </span>
                )}
              </span>
              <span
                className={`mt-2 text-[11px] leading-snug sm:text-xs ${on ? "text-ink" : "text-ink-soft"}`}
              >
                {b.desc}
              </span>
              {on ? (
                <span className="mt-1 rounded-full bg-leaf/20 px-2 text-[11px] font-bold text-leaf">
                  ✔ 已獲得
                </span>
              ) : (
                <span className="mt-1.5 flex w-24 flex-col items-center gap-1">
                  <span className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <span
                      className="block h-full rounded-full bg-brick/70"
                      style={{ width: `${(v / b.goal) * 100}%` }}
                    />
                  </span>
                  <span className="text-[11px] font-bold text-ink-soft tabular-nums">
                    {v} / {b.goal} {b.unit}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** 未獲得：右下角的小鎖頭 */
function LockMark() {
  return (
    <svg
      viewBox="0 0 32 36"
      className="absolute -bottom-1 left-1/2 h-7 w-auto -translate-x-1/2 drop-shadow-[0_1px_1px_rgb(62_58_53/0.25)] sm:h-8"
      aria-hidden
    >
      <path
        d="M9 15 V11 a7 7 0 0 1 14 0 V15"
        fill="none"
        stroke="#5e574e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="4" y="14" width="24" height="19" rx="4" fill="#6f675d" stroke="#fffaf0" strokeWidth="2" paintOrder="stroke" />
      <circle cx="16" cy="22" r="2.6" fill="#e6dccb" />
      <rect x="15" y="23" width="2" height="5" rx="1" fill="#e6dccb" />
    </svg>
  );
}
