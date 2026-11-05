// 【保留備用】站牌看板元件，目前各分頁都未使用；集章站版本見 src/app/stamps/StampBoard.tsx。
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** 站牌上一站／下一站的一端：可以是連結（相鄰車站）或純文字（例如日期） */
export interface BoardEnd {
  label: string;
  href?: string;
}

/**
 * 站牌看板：每個分頁的頁首標題。
 * 上排是「◀ 上一站／英文站名／下一站 ▶」，中間是小主廚＋站名＋說明，右側可放日期卡、月台號等資訊。
 */
export default function StationBoard({
  title,
  subtitle,
  en,
  prev,
  next,
  mascot = { src: "/images/mascot.png", w: 162, h: 168 },
  aside,
}: {
  title: string;
  subtitle: ReactNode;
  en: string;
  prev?: BoardEnd;
  next?: BoardEnd;
  mascot?: { src: string; w: number; h: number };
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-ink bg-[#2c5f5a] px-4 py-5 text-paper-light shadow-[5px_6px_0_rgb(62_58_53/0.2)] sm:px-8 sm:py-6">
      {/* 站牌：上一站／本站／下一站 */}
      <div className="flex items-center justify-between gap-3 text-xs text-paper-light/70 sm:text-sm">
        <End end={prev} side="prev" />
        <span className="hidden tracking-[0.3em] min-[420px]:inline">{en}</span>
        <End end={next} side="next" />
      </div>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src={mascot.src}
            alt=""
            width={mascot.w}
            height={mascot.h}
            className="h-16 w-auto shrink-0 sm:h-20"
            priority
          />
          <div>
            <h1 className="font-[family-name:var(--font-chiron)] text-3xl font-black tracking-wider sm:text-4xl">{title}</h1>
            <p className="mt-0.5 text-sm text-paper-light/80">{subtitle}</p>
          </div>
        </div>
        {aside && <div className="flex items-stretch gap-2">{aside}</div>}
      </div>
      {/* 站牌底部的軌道線 */}
      <div className="mt-4 h-1.5 rounded-full bg-[repeating-linear-gradient(90deg,#fbf3e2_0_18px,transparent_18px_26px)] opacity-60" />
    </section>
  );
}

function End({ end, side }: { end?: BoardEnd; side: "prev" | "next" }) {
  if (!end) return <span />;
  const text = side === "prev" ? `◀ ${end.label}` : `${end.label} ▶`;
  return end.href ? (
    <Link href={end.href} className="whitespace-nowrap transition hover:text-paper-light hover:underline underline-offset-4">
      {text}
    </Link>
  ) : (
    <span className="whitespace-nowrap">{text}</span>
  );
}

/** 右側資訊卡（例如 TODAY 日期、月台號） */
export function BoardCard({
  top,
  main,
  bottom,
  tone = "paper",
}: {
  top: string;
  main: ReactNode;
  bottom: string;
  tone?: "paper" | "mustard";
}) {
  const paper = tone === "paper";
  return (
    <div
      className={`rounded-xl border-2 px-4 py-2 text-center text-ink ${
        paper ? "border-paper-light/60 bg-paper-light" : "border-mustard bg-mustard"
      }`}
    >
      <p className={`text-[10px] tracking-[0.25em] ${paper ? "text-ink-soft" : "text-ink/70"}`}>{top}</p>
      <p className="font-[family-name:var(--font-chiron)] text-2xl leading-tight font-black">{main}</p>
      <p className={`text-xs ${paper ? "text-ink-soft" : "text-ink/70"}`}>{bottom}</p>
    </div>
  );
}
