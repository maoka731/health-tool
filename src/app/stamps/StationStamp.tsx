import { useId } from "react";
import { MISSION_CATEGORIES, type MissionCategory } from "@/lib/missions";

/**
 * 車站紀念章（照任務籤 UI 的集章印章）：粗外圈＋細內圈、上緣站名、中間日期、下方類別。
 * 文字可變，所以用 SVG 畫；以濾鏡做出油墨不均的手蓋質感。
 */
export default function StationStamp({
  category,
  date,
  size = 96,
  rotate = 0,
  className = "",
  animate = false,
  waves = false,
}: {
  category: MissionCategory;
  date: Date;
  size?: number;
  rotate?: number;
  className?: string;
  /** 蓋章動畫 */
  animate?: boolean;
  /** 左側加上郵戳波浪線 */
  waves?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const c = MISSION_CATEGORIES[category];
  const md = `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
  const vbX = waves ? -46 : 0;
  const vbW = waves ? 166 : 120;
  return (
    <svg
      viewBox={`${vbX} 0 ${vbW} 120`}
      width={(size * vbW) / 120}
      height={size}
      className={`${animate ? "stamp-in" : ""} ${className}`}
      role="img"
      aria-label={`${c.station}紀念章 ${md}`}
    >
      <defs>
        <filter id={`ink-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={date.getDate()} result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.8 1.5" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="inked" />
          <feDisplacementMap in="inked" in2="noise" scale="1.4" />
        </filter>
        <path id={`top-${uid}`} d="M 24 62 A 36 36 0 0 1 96 62" />
      </defs>
      <g transform={`rotate(${rotate} 60 60)`} filter={`url(#ink-${uid})`} fill={c.deep} stroke={c.deep}>
        {waves && (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round">
            {[44, 54, 64, 74].map((y) => (
              <path key={y} d={`M-42 ${y} q6 -5 12 0 t12 0 t12 0 t12 0`} />
            ))}
          </g>
        )}
        <circle cx="60" cy="60" r="55" fill="none" strokeWidth="4.5" />
        <circle cx="60" cy="60" r="48" fill="none" strokeWidth="1.6" />
        <text
          fontSize="16"
          letterSpacing="2"
          stroke="none"
          style={{ fontFamily: "var(--font-chiron), var(--font-huninn), sans-serif", fontWeight: 900 }}
        >
          <textPath href={`#top-${uid}`} startOffset="50%" textAnchor="middle">
            {c.station}
          </textPath>
        </text>
        <text
          x="60"
          y="72"
          textAnchor="middle"
          fontSize="21"
          stroke="none"
          style={{ fontFamily: "var(--font-chiron), sans-serif", fontWeight: 900 }}
        >
          {md}
        </text>
        <text x="60" y="92" textAnchor="middle" fontSize="13" fontWeight="700" stroke="none">
          {c.label}
        </text>
        <circle cx="22" cy="78" r="1.6" stroke="none" />
        <circle cx="98" cy="78" r="1.6" stroke="none" />
      </g>
    </svg>
  );
}

/** 依日期給一個固定的小角度，讓章看起來是手蓋的 */
export function stampTilt(key: string) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return (h % 25) - 12;
}
