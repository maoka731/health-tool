/**
 * 籤筒：竹筒＋一把籤。shaking 時整筒搖晃，drawn 時中間那支籤往上彈出。
 * 純 SVG，之後可整個換成 UI 參考圖的插畫。
 */
const STICKS = [
  { x: 62, h: 70, r: -9, c: "#e9c98f" },
  { x: 74, h: 82, r: -5, c: "#f1d6a3" },
  { x: 86, h: 74, r: -2, c: "#e3bf82" },
  { x: 100, h: 92, r: 0, c: "#b5452b", hero: true },
  { x: 112, h: 76, r: 3, c: "#ecd09a" },
  { x: 124, h: 84, r: 6, c: "#e2bd80" },
  { x: 136, h: 68, r: 9, c: "#f0d5a0" },
];

export default function FortuneCylinder({
  shaking,
  drawn,
  className = "",
}: {
  shaking: boolean;
  drawn: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 250" className={`overflow-visible ${className}`} aria-hidden>
      {/* 地面陰影 */}
      <ellipse cx="100" cy="238" rx="62" ry="9" fill="rgb(62 58 53 / 0.18)" />
      <g className={shaking ? "cylinder-shake" : ""} style={{ transformOrigin: "100px 236px" }}>
        {/* 籤 */}
        {STICKS.map((s) => (
          <g
            key={s.x}
            transform={`rotate(${s.r} ${s.x} 150)`}
            className={s.hero && drawn ? "stick-rise" : ""}
          >
            <rect x={s.x - 4} y={150 - s.h - 40} width="8" height={s.h + 60} rx="3" fill={s.c} stroke="#3e3a35" strokeWidth="2" />
            {s.hero && (
              <>
                <rect x={s.x - 4} y={150 - s.h - 40} width="8" height="18" rx="3" fill="#8f2f1e" stroke="#3e3a35" strokeWidth="2" />
                <circle cx={s.x} cy={150 - s.h - 22} r="2" fill="#fbf3e2" />
              </>
            )}
          </g>
        ))}
        {/* 竹筒 */}
        <path d="M48 112 h104 l-8 120 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 z" fill="#c9773a" stroke="#3e3a35" strokeWidth="3" strokeLinejoin="round" />
        <path d="M48 112 h104 l-1.6 24 h-100.8 z" fill="#a85f2a" stroke="#3e3a35" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="100" cy="112" rx="52" ry="9" fill="#5a3a22" stroke="#3e3a35" strokeWidth="3" />
        {/* 竹節與木紋 */}
        <path d="M54 190 h92" stroke="#3e3a35" strokeWidth="2.5" />
        <path d="M66 146 v36 M84 150 v30 M118 148 v34 M134 146 v38" stroke="#a85f2a" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        {/* 紅色籤標 */}
        <rect x="76" y="150" width="48" height="32" rx="4" fill="#fbf3e2" stroke="#3e3a35" strokeWidth="2.5" />
        <text
          x="100"
          y="172"
          textAnchor="middle"
          fontSize="17"
          fill="#b5452b"
          style={{ fontFamily: "var(--font-chiron), sans-serif", fontWeight: 900 }}
        >
          任務籤
        </text>
        <path d="M70 206 h60" stroke="#fbf3e2" strokeWidth="2" strokeDasharray="4 5" opacity="0.6" />
      </g>
    </svg>
  );
}
