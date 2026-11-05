"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
      <div className="notebook px-3 pt-12 pb-5 sm:px-6">
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

        <div className="note-box p-2 sm:p-3">
          <div className="mb-1 grid grid-cols-7 text-center text-xs font-bold text-ink-soft">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <ol className="grid grid-cols-7 gap-1">
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
                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 transition ${
                      isSelected
                        ? "border-ink bg-[#fffaf0] shadow-[0_2px_0_#3e3a35]"
                        : "border-transparent hover:border-ink/30"
                    } ${status === "perfect" ? "bg-mustard/25" : status === "done" ? "bg-[#fffaf0]" : ""} disabled:cursor-default disabled:opacity-35`}
                  >
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] sm:text-xs ${
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
                          className="-mt-2 h-auto w-[62%] max-w-12"
                          style={{
                            transform: `rotate(${((d.getDate() * 37) % 24) - 12}deg)`,
                          }}
                        />
                        {/* 當天蓋了哪幾種章 */}
                        <span className="absolute bottom-1 flex gap-0.5">
                          {cats.map((c) => (
                            <span
                              key={c}
                              className="h-1.5 w-1.5 rounded-full"
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

export function BadgeShelf({ stats }: { stats: BookStats }) {
  const unlocked = BADGES.filter((b) => b.value(stats) >= b.goal).length;
  return (
    <>
      <p className="-mt-2 mb-4 text-sm text-ink-soft">
        已解鎖 <b className="text-ink">{unlocked}</b> / {BADGES.length} 枚・累積{" "}
        <b className="text-ink">{stats.total}</b> 個章
      </p>
      <ul className="grid grid-cols-3 gap-x-2 gap-y-5">
        {BADGES.map((b) => {
          const v = Math.min(b.value(stats), b.goal);
          const on = v >= b.goal;
          const p = v / b.goal;
          const R = 34;
          const C = 2 * Math.PI * R;
          return (
            <li
              key={b.id}
              className="flex flex-col items-center text-center"
              title={b.desc}
            >
              <span className="relative block h-20 w-20">
                <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
                  <circle
                    cx="40"
                    cy="40"
                    r={R}
                    fill="none"
                    stroke="rgb(62 58 53 / 0.12)"
                    strokeWidth="5"
                  />
                  {!on && p > 0 && (
                    <circle
                      cx="40"
                      cy="40"
                      r={R}
                      fill="none"
                      stroke={b.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${C * p} ${C}`}
                      transform="rotate(-90 40 40)"
                      opacity="0.7"
                    />
                  )}
                  <circle
                    cx="40"
                    cy="40"
                    r="27"
                    fill={on ? b.color : "#e6dccb"}
                    stroke="#3e3a35"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="21"
                    fill="none"
                    stroke={on ? "#fbf3e2" : "#cfc3ae"}
                    strokeWidth="1.5"
                    strokeDasharray="2 3"
                  />
                  <text
                    x="40"
                    y="47"
                    textAnchor="middle"
                    fontSize={b.mark.length > 1 ? 18 : 22}
                    fill={on ? "#fbf3e2" : "#a99c86"}
                    style={{
                      fontFamily: "var(--font-chiron), sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    {b.mark}
                  </text>
                  <path
                    d="M28 64 l-4 13 l8 -4 l4 6 l3 -13z M52 64 l4 13 l-8 -4 l-4 6 l-3 -13z"
                    fill={on ? b.color : "#d6ccb9"}
                    stroke="#3e3a35"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span
                className={`mt-1 text-sm font-bold ${on ? "text-ink" : "text-ink-soft"}`}
              >
                {b.name}
              </span>
              <span className="text-[11px] leading-snug text-ink-soft">
                {b.desc}
              </span>
              <span
                className={`mt-0.5 rounded-full px-2 text-[11px] font-bold tabular-nums ${
                  on ? "bg-leaf/20 text-leaf" : "bg-ink/5 text-ink-soft"
                }`}
              >
                {on ? "已解鎖！" : `${v} / ${b.goal} ${b.unit}`}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
