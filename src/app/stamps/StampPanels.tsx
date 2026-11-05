"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BADGES,
  MISSION_CATEGORIES,
  WEEKDAY_LABELS,
  dateKey,
  findMission,
  monthGrid,
  stampedEntries,
  weekDays,
  type BookStats,
  type MissionCategory,
  type StampBook,
} from "@/lib/missions";
import NotebookRings from "@/components/NotebookRings";
import StationStamp, { stampTilt } from "./StationStamp";

// ─────────────────────────────────────────────
// 站牌看板：統計車票
// ─────────────────────────────────────────────

export function StatTickets({ stats }: { stats: BookStats }) {
  const items = [
    { label: "連續集章", value: stats.streak, unit: "天", accent: "#b5452b" },
    { label: "最長紀錄", value: stats.longest, unit: "天", accent: "#e76b3c" },
    { label: "本月蓋章", value: stats.thisMonth, unit: "個", accent: "#2c8f86" },
    { label: "累積集章", value: stats.total, unit: "個", accent: "#d98f1c" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <li key={it.label} className="ticket flex flex-col items-center px-4 py-3">
          <span className="text-xs tracking-[0.2em] text-ink-soft">{it.label}</span>
          <span className="mt-0.5 flex items-baseline gap-1">
            <span className="font-[family-name:var(--font-chiron)] text-4xl leading-none font-black" style={{ color: it.accent }}>
              {it.value}
            </span>
            <span className="text-sm font-bold text-ink">{it.unit}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────
// 本週集章：七格車票存根
// ─────────────────────────────────────────────

export function WeekStrip({ book, today }: { book: StampBook; today: Date }) {
  const todayKey = dateKey(today);
  return (
    <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {weekDays(today).map((d, i) => {
        const key = dateKey(d);
        const rec = book.days[key];
        const mission = findMission(rec?.missionId);
        const stamped = Boolean(rec?.stampedAt && mission);
        const isToday = key === todayKey;
        const future = key > todayKey;
        return (
          <li
            key={key}
            className={`relative flex flex-col items-center rounded-lg border-2 px-0.5 pt-1.5 pb-1 ${
              isToday ? "border-brick bg-[#fffaf0] shadow-[0_3px_0_rgb(181_69_43/0.35)]" : "border-ink/20 bg-[#fffaf0]/70"
            } ${future ? "opacity-50" : ""}`}
          >
            <span className={`text-[11px] font-bold sm:text-xs ${isToday ? "text-brick" : "text-ink-soft"}`}>
              {isToday ? "今天" : `週${WEEKDAY_LABELS[i]}`}
            </span>
            <span className="font-display text-sm text-ink sm:text-base">{d.getDate()}</span>
            <span className="mt-0.5 flex aspect-square w-full items-center justify-center">
              {stamped ? (
                <StationStamp category={mission!.category} date={d} size={56} rotate={stampTilt(key)} className="h-auto w-full max-w-14" />
              ) : (
                <span
                  className={`aspect-square w-[78%] max-w-12 rounded-full border-2 border-dashed ${
                    isToday ? "border-brick/50" : "border-ink/20"
                  }`}
                />
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ─────────────────────────────────────────────
// 路線進度：四種任務類別各蓋了幾個章
// ─────────────────────────────────────────────

export function LineProgress({ stats }: { stats: BookStats }) {
  const max = Math.max(5, ...Object.values(stats.byCategory));
  return (
    <ul className="space-y-2.5">
      {(Object.keys(MISSION_CATEGORIES) as MissionCategory[]).map((k) => {
        const c = MISSION_CATEGORIES[k];
        const n = stats.byCategory[k];
        return (
          <li key={k} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm font-bold" style={{ color: c.color }}>
              {c.icon} {c.label}
            </span>
            {/* 鐵軌樣式進度條 */}
            <span className="relative h-3 flex-1 overflow-hidden rounded-full border-2 border-ink/70 bg-[#fffaf0]">
              <span
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
                style={{
                  width: `${(n / max) * 100}%`,
                  background: `repeating-linear-gradient(90deg, ${c.color} 0 8px, ${c.tint} 8px 11px)`,
                }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-sm font-bold text-ink">{n} 章</span>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────────────────────────
// 集章本：月曆
// ─────────────────────────────────────────────

export function MonthBook({ book, today }: { book: StampBook; today: Date }) {
  const [cursor, setCursor] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const todayKey = dateKey(today);
  const cells = monthGrid(cursor.y, cursor.m);
  const shift = (n: number) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const isCurrent = cursor.y === today.getFullYear() && cursor.m === today.getMonth();
  const monthCount = cells.filter((d) => d && book.days[dateKey(d)]?.stampedAt).length;

  return (
    <div className="relative">
      <div className="notebook-back" aria-hidden />
      <div className="notebook px-4 pt-12 pb-5 sm:px-6">
        <NotebookRings compact />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-2xl text-brick">
            <span className="text-mustard">★</span>我的集章本<span className="text-mustard">★</span>
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
        <p className="mb-3 text-sm text-ink-soft">這個月已經蓋了 {monthCount} 個章</p>

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
              const mission = findMission(rec?.missionId);
              const stamped = Boolean(rec?.stampedAt && mission);
              const isToday = key === todayKey;
              return (
                <li
                  key={key}
                  title={stamped ? `${d.getMonth() + 1}/${d.getDate()}：${mission!.title}` : undefined}
                  className={`relative flex aspect-square items-center justify-center rounded-md ${
                    isToday ? "bg-brick/10 ring-2 ring-brick/60" : ""
                  } ${key > todayKey ? "opacity-40" : ""}`}
                >
                  <span className={`absolute top-0.5 left-1 text-[10px] sm:text-xs ${isToday ? "font-bold text-brick" : "text-ink-soft"}`}>
                    {d.getDate()}
                  </span>
                  {stamped && (
                    <StationStamp
                      category={mission!.category}
                      date={d}
                      size={64}
                      rotate={stampTilt(key)}
                      className="h-auto w-[86%]"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 徽章架
// ─────────────────────────────────────────────

export function BadgeShelf({ stats }: { stats: BookStats }) {
  return (
    <ul className="grid grid-cols-3 gap-x-2 gap-y-4">
      {BADGES.map((b) => {
        const on = b.unlocked(stats);
        const p = b.progress(stats);
        const R = 34;
        const C = 2 * Math.PI * R;
        return (
          <li key={b.id} className="flex flex-col items-center text-center" title={b.desc}>
            <span className="relative block h-20 w-20">
              <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden>
                {/* 進度環 */}
                <circle cx="40" cy="40" r={R} fill="none" stroke="rgb(62 58 53 / 0.12)" strokeWidth="5" />
                {!on && (
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
                    opacity="0.6"
                  />
                )}
                {/* 琺瑯徽章 */}
                <circle cx="40" cy="40" r="27" fill={on ? b.color : "#e6dccb"} stroke="#3e3a35" strokeWidth="2.5" />
                <circle cx="40" cy="40" r="21" fill="none" stroke={on ? "#fbf3e2" : "#cfc3ae"} strokeWidth="1.5" strokeDasharray="2 3" />
                <text
                  x="40"
                  y="47"
                  textAnchor="middle"
                  fontSize={b.mark.length > 1 ? 18 : 22}
                  fill={on ? "#fbf3e2" : "#a99c86"}
                  style={{ fontFamily: "var(--font-chiron), sans-serif", fontWeight: 900 }}
                >
                  {on ? b.mark : "?"}
                </text>
                {/* 緞帶 */}
                <path d="M28 64 l-4 13 l8 -4 l4 6 l3 -13z M52 64 l4 13 l-8 -4 l-4 6 l-3 -13z" fill={on ? b.color : "#d6ccb9"} stroke="#3e3a35" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={`mt-1 text-sm font-bold ${on ? "text-ink" : "text-ink-soft"}`}>{b.name}</span>
            <span className="text-[11px] leading-snug text-ink-soft">{on ? "已解鎖！" : b.desc}</span>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────────────────────────
// 集章紀錄：最近完成的任務
// ─────────────────────────────────────────────

export function StampLog({ book }: { book: StampBook }) {
  const entries = stampedEntries(book).slice(0, 8);
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-ink-soft">
        <Image src="/images/mascot-face-thinking.png" alt="" width={67} height={62} className="h-12 w-auto" />
        還沒有集章紀錄，先抽今天的任務籤吧！
      </div>
    );
  }
  return (
    <ol className="divide-y-2 divide-dashed divide-ink/15">
      {entries.map(([key, rec]) => {
        const m = findMission(rec.missionId);
        if (!m) return null;
        const c = MISSION_CATEGORIES[m.category];
        const d = new Date(key.replace(/-/g, "/"));
        return (
          <li key={key} className="flex items-center gap-3 py-2.5">
            <StationStamp category={m.category} date={d} size={48} rotate={stampTilt(key)} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{m.title}</p>
              <p className="text-xs text-ink-soft">
                {d.getMonth() + 1} 月 {d.getDate()} 日・
                <span style={{ color: c.color }}>{c.label}</span>・{m.luck}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
