import { useId } from "react";
import { MISSION_CATEGORIES, type MissionCategory } from "@/lib/missions";

/**
 * 車站紀念章：雙圈外框、上緣站名、下緣英文、中間日期與類別圖示。
 * 以 SVG 濾鏡做出油墨不均的手蓋質感。
 */
export default function StationStamp({
  category,
  date,
  size = 96,
  rotate = 0,
  className = "",
  animate = false,
}: {
  category: MissionCategory;
  date: Date;
  size?: number;
  rotate?: number;
  className?: string;
  /** 蓋章動畫 */
  animate?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const c = MISSION_CATEGORIES[category];
  const md = `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`${animate ? "stamp-in" : ""} ${className}`}
      role="img"
      aria-label={`${c.station}紀念章 ${md}`}
    >
      <defs>
        <filter id={`ink-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={date.getDate()}
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.9 1.55"
            result="mask"
          />
          <feComposite
            in="SourceGraphic"
            in2="mask"
            operator="in"
            result="inked"
          />
          <feDisplacementMap in="inked" in2="noise" scale="1.6" />
        </filter>
        <path id={`top-${uid}`} d="M 22 60 A 38 38 0 0 1 98 60" />
        <path id={`bottom-${uid}`} d="M 18 60 A 42 42 0 0 0 102 60" />
      </defs>
      {/* 旋轉放在 SVG 內部，避免和蓋章動畫的 CSS transform 互相覆蓋 */}
      <g transform={`rotate(${rotate} 60 60)`}>
        <g filter={`url(#ink-${uid})`} fill={c.color} stroke={c.color}>
          <circle cx="60" cy="60" r="56" fill="none" strokeWidth="4" />
          <circle cx="60" cy="60" r="49" fill="none" strokeWidth="1.6" />
          <circle cx="60" cy="60" r="28" fill="none" strokeWidth="1.6" />
          <text
            fontSize="13"
            fontWeight="900"
            letterSpacing="3"
            stroke="none"
            style={{
              fontFamily: "var(--font-chiron), var(--font-huninn), sans-serif",
            }}
          >
            <textPath
              href={`#top-${uid}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {c.station}
            </textPath>
          </text>
          <text
            fontSize="6.5"
            fontWeight="700"
            letterSpacing="1.4"
            stroke="none"
            style={{ fontFamily: "var(--font-noto-sans-tc), sans-serif" }}
          >
            <textPath
              href={`#bottom-${uid}`}
              startOffset="50%"
              textAnchor="middle"
              dominantBaseline="hanging"
            >
              HEALTHY BENTO EXPRESS
            </textPath>
          </text>
          <text
            x="60"
            y="58"
            textAnchor="middle"
            fontSize="15"
            stroke="none"
            style={{
              fontFamily: "var(--font-chiron), sans-serif",
              fontWeight: 900,
            }}
          >
            {md}
          </text>
          <text
            x="60"
            y="74"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            stroke="none"
            style={{ fontFamily: "var(--font-noto-sans-tc), sans-serif" }}
          >
            {c.label}
          </text>
          {/* 兩側的星星裝飾 */}
          <path
            d="M14 60l2.5-1.6L19 60l-2.5 1.6z M101 60l2.5-1.6L106 60l-2.5 1.6z"
            stroke="none"
          />
        </g>
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
