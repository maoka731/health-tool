"use client";

import Image from "next/image";
import { optionImage, type WheelOption } from "@/lib/meals";

/**
 * 抽籤舞台：以 lunch_ui 參考圖當場景，只把轉盤盤面換成可旋轉的 SVG。
 * 所有座標都以場景原圖像素為準（1548×688），再換算成百分比定位。
 *
 * 圖層（由下到上）：場景底圖 → 盤面 SVG（旋轉）→ 轉盤外圈＋指針 → 中央列車徽章 → 燈泡光暈
 * 桌機顯示完整場景（右側告示牌疊上真正的按鈕）；手機只裁出轉盤那一段。
 */
const SCENE = { w: 1548, h: 688 };
const WHEEL = { cx: 539.3, cy: 311.8, r: 277 };
const RING = { x: 231, y: 0, w: 617, h: 620 };
const MEDAL = { x: 465, y: 200, w: 156, h: 186 };
/** 告示牌上原本畫好的按鈕位置 */
const SIGN_BUTTON = { x: 925, y: 395, w: 445, h: 100 };
/** 抽中結果放在桌面上（蓋住原圖的筆記本位置） */
const DESK_TICKET = { x: 975, y: 522, w: 425, h: 140 };
/** 外圈燈泡（角度、半徑） */
const BULBS: [number, number][] = [
  [13.2, 292.2], [35.1, 293.6], [48.7, 291.2], [62.6, 294.1], [79.6, 291.8], [96.4, 293.9], [113.7, 293],
  [129.7, 288.5], [147.6, 284.6], [166.3, 283.8], [185.7, 284], [203.6, 286.7], [220.6, 290.1], [243, 297.5],
  [259.8, 297.3], [277.2, 296.5], [295.7, 297.1], [313.2, 296.3], [331.4, 289.9], [350, 289.7],
];

/** 盤面配色（轉盤設定圖：底色黃、暖粉、鵝黃、淺綠、檸綠） */
const SLICE_COLORS = ["#F8E6C6", "#F9C9C0", "#FFE19A", "#D6E6C3", "#D7E3AA"];

export const SPIN_MS = 4200;

/** 四捨五入到小數 2 位：伺服器與瀏覽器的三角函數末位可能不同，避免 hydration 不一致 */
const r2 = (v: number) => Math.round(v * 100) / 100;
const pctX = (v: number) => `${(v / SCENE.w) * 100}%`;
const pctY = (v: number) => `${(v / SCENE.h) * 100}%`;
const box = (b: { x: number; y: number; w: number; h: number }) => ({
  left: pctX(b.x),
  top: pctY(b.y),
  width: pctX(b.w),
  height: pctY(b.h),
});

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: r2(r * Math.sin(a)), y: r2(-r * Math.cos(a)) };
}

function sliceColor(i: number, n: number) {
  const c = SLICE_COLORS[i % SLICE_COLORS.length];
  if (i === n - 1 && n > 1 && c === SLICE_COLORS[0]) return SLICE_COLORS[2];
  return c;
}

function slicePath(i: number, n: number) {
  const s = 360 / n;
  const p1 = polar(WHEEL.r, i * s);
  const p2 = polar(WHEEL.r, (i + 1) * s);
  return `M0 0 L${p1.x} ${p1.y} A${WHEEL.r} ${WHEEL.r} 0 0 1 ${p2.x} ${p2.y} Z`;
}

/**
 * 一格的名稱：沿著半徑排成一行；停在畫面左半邊的格子翻轉 180°，讓字保持正向。
 * 字級依可用長度與格寬自動縮放；太長就截斷。
 */
const LABEL_OUTER = WHEEL.r - 26;
const LABEL_INNER = 96; // 避開中央列車徽章
/** 估算字寬：中日文 1、英數半形約 0.6、空白 0.35（以字級為單位） */
const charUnit = (ch: string) => (/\s/.test(ch) ? 0.35 : /[\u0000-\u00ff]/.test(ch) ? (/[A-Z0-9]/.test(ch) ? 0.68 : 0.58) : 1);
const widthOf = (list: string[]) => list.reduce((sum, ch) => sum + charUnit(ch), 0);

/** 把名稱拆成兩行：優先在「／、・ 空白」等分隔處斷開，否則從字寬中間斷 */
function splitTwoLines(chars: string[]): [string[], string[]] {
  const total = widthOf(chars);
  let best = Math.ceil(chars.length / 2);
  let bestScore = Infinity;
  for (let k = 1; k < chars.length; k++) {
    const left = widthOf(chars.slice(0, k));
    const balance = Math.abs(total / 2 - left);
    // 斷在分隔符號後面比較自然
    const bonus = /[／/、・·,，\s]/.test(chars[k - 1]) ? -1.6 : 0;
    const score = balance + bonus;
    if (score < bestScore) {
      bestScore = score;
      best = k;
    }
  }
  const a = chars.slice(0, best);
  const b = chars.slice(best);
  // 斷在空白時，把行首／行尾的空白去掉
  while (a.length && /\s/.test(a[a.length - 1])) a.pop();
  while (b.length && /\s/.test(b[0])) b.shift();
  return [a, b];
}

/**
 * 轉盤格子上的名稱：沿半徑方向排字。
 * 一行放得下就用一行；字太多時先換成兩行，兩行還是太擠才縮小字級、最後才加「…」。
 */
function SliceLabel({ name, i, n, rotation }: { name: string; i: number; n: number; rotation: number }) {
  const s = 360 / n;
  const mid = (i + 0.5) * s;
  const length = LABEL_OUTER - LABEL_INNER;
  // 字高（或兩行的總高）不能超過最窄處（內緣）的格寬
  const innerChord = 2 * LABEL_INNER * Math.sin(((Math.min(s, 90) / 2) * Math.PI) / 180);
  const maxSize = Math.min(36, innerChord * 0.78);
  const maxSize2 = Math.min(32, (innerChord * 0.82) / 2.15);
  const minSize = 17;
  /** 單行時文字還能維持這個大小，就不換行 */
  const comfortable = 26;

  const chars = [...name];
  const single = Math.min(maxSize, (length * 0.94) / widthOf(chars));

  let lines: string[][] = [chars];
  let fontSize = single;
  if (single < comfortable && chars.length >= 4 && maxSize2 >= minSize) {
    const two = splitTwoLines(chars);
    const size2 = Math.min(maxSize2, (length * 0.94) / Math.max(widthOf(two[0]), widthOf(two[1])));
    if (size2 > single) {
      lines = two;
      fontSize = size2;
    }
  }
  // 還是太擠：每一行最多放到最小字級的長度，超過的用「…」收尾
  if (fontSize < minSize) {
    fontSize = minSize;
    lines = lines.map((line, li) => {
      if (widthOf(line) * minSize <= length) return line;
      const cut: string[] = [];
      for (const ch of line) {
        if ((widthOf(cut) + charUnit(ch) + 1) * minSize > length) break;
        cut.push(ch);
      }
      return li === lines.length - 1 || lines.length === 1 ? [...cut, "…"] : cut;
    });
  }
  fontSize = r2(fontSize);

  const rc = (LABEL_OUTER + LABEL_INNER) / 2;
  const p = polar(rc, mid);
  // 依「停下來時」的實際角度決定要不要翻轉，讓轉完後的字都是正的
  const screen = (((mid + rotation) % 360) + 360) % 360;
  const theta = r2(screen <= 180 ? mid - 90 : mid + 90);
  const lineGap = 1.08; // 行距（em）
  return (
    <text
      transform={`translate(${p.x} ${p.y}) rotate(${theta})`}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fill="#3e3a35"
      stroke="#fff8e8"
      strokeWidth={r2(fontSize * 0.22)}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ fontFamily: "var(--font-chiron), var(--font-huninn), sans-serif", fontWeight: 900 }}
    >
      {lines.length === 1
        ? lines[0].join("")
        : lines.map((line, li) => (
            <tspan key={li} x={0} y={r2((li - (lines.length - 1) / 2) * lineGap * fontSize)}>
              {line.join("")}
            </tspan>
          ))}
    </text>
  );
}

function WheelFace({
  options,
  rotation,
  spinning,
  onSpinEnd,
}: {
  options: WheelOption[];
  rotation: number;
  spinning: boolean;
  onSpinEnd: () => void;
}) {
  const n = options.length;
  const R = WHEEL.r;
  return (
    <div
      className="absolute"
      style={{ left: pctX(WHEEL.cx - R), top: pctY(WHEEL.cy - R), width: pctX(R * 2), height: pctY(R * 2) }}
    >
      <svg
        viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`}
        className="h-full w-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.2, 0.75, 0.12, 1)` : "none",
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "transform") onSpinEnd();
        }}
        aria-hidden
      >
        <defs>
          <radialGradient id="face-shade">
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#8a5a2b" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        {n < 2 ? (
          <circle r={R} fill={SLICE_COLORS[0]} />
        ) : (
          options.map((o, i) => (
            <path key={o.id} d={slicePath(i, n)} fill={sliceColor(i, n)} stroke="#a0552a" strokeWidth="2.2" />
          ))
        )}
        <circle r={R} fill="url(#face-shade)" />
        {n >= 2 && options.map((o, i) => <SliceLabel key={o.id} name={o.name} i={i} n={n} rotation={rotation} />)}
      </svg>
      {/* 空轉盤提示：放在旋轉層外面，永遠保持正向 */}
      {n < 2 && (
        <svg viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <g
            textAnchor="middle"
            fill="#b5452b"
            style={{ fontFamily: "var(--font-chiron), var(--font-huninn), sans-serif", fontWeight: 900 }}
          >
            <text y={-168} fontSize="30">至少要有兩個選項</text>
            <text y={-126} fontSize="30">才能抽籤</text>
          </g>
        </svg>
      )}
    </div>
  );
}

function Bulbs({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${SCENE.w} ${SCENE.h}`}
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
      aria-hidden
    >
      <defs>
        <radialGradient id="bulb-glow">
          <stop offset="0" stopColor="#fffbe8" stopOpacity="1" />
          <stop offset="0.45" stopColor="#ffe08a" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffb52e" stopOpacity="0" />
        </radialGradient>
      </defs>
      {BULBS.map(([deg, r], i) => {
        const p = polar(r, deg);
        return (
          <circle
            key={deg}
            cx={r2(WHEEL.cx + p.x)}
            cy={r2(WHEEL.cy + p.y)}
            r={19}
            fill="url(#bulb-glow)"
            className={spinning ? "bulb-chase" : "bulb-idle"}
            style={{ animationDelay: spinning ? `${(i % 3) * 120}ms` : `${(i % 2) * 1200}ms` }}
          />
        );
      })}
    </svg>
  );
}

export default function LunchStage({
  options,
  rotation,
  spinning,
  canSpin,
  result,
  onSpin,
  onSpinEnd,
}: {
  options: WheelOption[];
  rotation: number;
  spinning: boolean;
  canSpin: boolean;
  result: WheelOption | null;
  onSpin: () => void;
  onSpinEnd: () => void;
}) {
  const buttonLabel = spinning ? "轉呀轉…" : result ? "再抽一次" : "立即轉盤抽便當";

  return (
    <section
      aria-label="午餐大轉盤"
      className="relative overflow-hidden rounded-2xl border-2 border-ink shadow-[5px_6px_0_rgb(62_58_53/0.2)] aspect-[670/688] max-lg:mx-auto max-lg:max-w-[520px] lg:aspect-[1548/688]"
    >
      {/* 手機只露出轉盤那段（x 205–875）；桌機完整場景 */}
      <div className="@container absolute inset-y-0 left-[-30.6%] w-[231.04%] lg:left-0 lg:w-full">
        <Image
          src="/images/lunch-scene.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1104px, 240vw"
          className="object-cover"
        />
        <WheelFace options={options} rotation={rotation} spinning={spinning} onSpinEnd={onSpinEnd} />
        <Image
          src="/images/lunch-wheel-ring.png"
          alt=""
          width={RING.w}
          height={RING.h}
          priority
          className="pointer-events-none absolute"
          style={box(RING)}
        />
        <Image
          src="/images/lunch-wheel-center.png"
          alt=""
          width={MEDAL.w}
          height={MEDAL.h}
          className="pointer-events-none absolute"
          style={box(MEDAL)}
        />
        <Bulbs spinning={spinning} />

        {/* 桌面上的抽中車票（桌機） */}
        <div className="absolute hidden lg:block" style={box(DESK_TICKET)} aria-live="polite">
          {result && !spinning && <DeskTicket key={result.id + rotation} result={result} />}
        </div>

        {/* 告示牌上的按鈕（桌機）：蓋在原圖畫好的按鈕上 */}
        <button
          type="button"
          onClick={onSpin}
          disabled={!canSpin}
          className="absolute hidden items-center justify-center gap-[1cqw] rounded-full border-[0.25cqw] border-ink bg-brick font-[family-name:var(--font-chiron)] text-[2.5cqw] font-black text-paper-light shadow-[0_0.35cqw_0_#3e3a35] outline-[0.15cqw] outline-offset-[-0.9cqw] outline-paper-light/70 outline-dashed transition hover:brightness-110 active:translate-y-[0.2cqw] active:shadow-[0_0.15cqw_0_#3e3a35] disabled:cursor-not-allowed disabled:brightness-90 disabled:saturate-50 lg:flex"
          style={box(SIGN_BUTTON)}
        >
          {buttonLabel}
          {!spinning && <span className="text-[1.8cqw]">▶</span>}
        </button>
      </div>
    </section>
  );
}

/** 車票上餐點名稱的字級（cqw）：字少就大，字多就縮小、最多兩行 */
function ticketNameSize(len: number) {
  if (len <= 3) return 2.8;
  if (len <= 4) return 2.4;
  if (len <= 6) return 2;
  return 1.7;
}

/** 放在桌上的車票：餐點圖＋名稱＋紅色「抽中」印章，單位用容器寬（cqw）隨場景縮放 */
function DeskTicket({ result }: { result: WheelOption }) {
  return (
    <div className="ticket-drop h-full w-full">
      <div className="relative flex h-full w-full -rotate-[4deg] items-stretch overflow-visible rounded-[0.9cqw] border-[0.18cqw] border-ink bg-[#fbf3e2] shadow-[0.3cqw_0.45cqw_0_rgb(62_58_53/0.35)]">
        {/* 左側存根 */}
        <div className="flex w-[21%] shrink-0 flex-col items-center justify-center gap-[0.35cqw] border-r-[0.15cqw] border-dashed border-ink/40 bg-brick text-paper-light">
          <span className="text-[1.05cqw] font-bold tracking-[0.18em]">TODAY</span>
          <span className="font-[family-name:var(--font-chiron)] text-[2.2cqw] leading-none font-black">午餐</span>
          <span className="text-[1cqw] font-bold tracking-widest opacity-85">No.{String(new Date().getDate()).padStart(2, "0")}</span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-[0.7cqw] px-[0.8cqw]">
          <Image
            src={optionImage(result)}
            alt=""
            width={180}
            height={150}
            className="h-auto w-[5.6cqw] shrink-0 object-contain drop-shadow-[0_0.15cqw_0.15cqw_rgb(62_58_53/0.3)]"
          />
          <div className="min-w-0 flex-1 pr-[2.2cqw]">
            <p className="text-[1.15cqw] font-bold tracking-[0.12em] whitespace-nowrap text-ink-soft">今天午餐就吃</p>
            <p
              className="poster-title rotate-0! mt-[0.2cqw] line-clamp-2 leading-[1.12] break-all"
              style={{ fontSize: `${ticketNameSize([...result.name].length)}cqw` }}
            >
              {result.name}
            </p>
          </div>
        </div>
        {/* 小主廚從車票右下角探出頭 */}
        <Image
          src="/images/mascot-cheer.png"
          alt=""
          width={103}
          height={93}
          className="pointer-events-none absolute -right-[1.6cqw] -bottom-[1.2cqw] h-auto w-[5.4cqw] -rotate-6 drop-shadow-[0_0.15cqw_0_rgb(62_58_53/0.25)]"
        />
        {/* 抽中印章 */}
        <span className="stamp-in absolute -top-[1.4cqw] -right-[1.2cqw] flex h-[4.4cqw] w-[4.4cqw] rotate-12 items-center justify-center rounded-full border-[0.22cqw] border-brick bg-[#fbf3e2]/85 font-[family-name:var(--font-chiron)] text-[1.45cqw] tracking-[0.1em] font-black text-brick shadow-[inset_0_0_0_0.25cqw_#fbf3e2,inset_0_0_0_0.4cqw_#b5452b]">
          抽中
        </span>
      </div>
    </div>
  );
}
