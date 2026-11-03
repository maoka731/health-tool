import type { ReactNode } from "react";
import { MACRO_RATIO, roundHalf, vegetableServings, type NutritionResult } from "@/lib/nutrition";
import Image from "next/image";

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const half = (n: number) => {
  const r = roundHalf(n);
  return fmt(r, r % 1 ? 1 : 0);
};

const COLORS = {
  veg: { fill: "#d6e8c4", strong: "#6ba367" },
  grain: { fill: "#fde4ab", strong: "#d98f1c" },
  protein: { fill: "#f9cdb5", strong: "#e76b3c" },
  oil: { strong: "#2c8f86" },
};

/** 211 餐盤：蔬菜 2、蛋白質 1、全穀 1 */
export default function Plate211({ result }: { result: NutritionResult }) {
  const { macros, exchange, tdee } = result;
  const veg = vegetableServings(tdee);

  return (
    <div className="retro-card px-5 pt-6 pb-6 sm:px-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl text-brick sm:text-3xl">你的每日 211 餐盤</h2>
        <span className="text-sm text-ink-soft">
          醣類 {MACRO_RATIO.carbs * 100}%・蛋白質 {MACRO_RATIO.protein * 100}%・脂肪 {MACRO_RATIO.fat * 100}%
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-soft">每餐依「蔬菜 2：蛋白質 1：全穀 1」裝盤，一天吃下來大約是：</p>

      <div className="mt-6 grid items-center gap-8 xl:grid-cols-[minmax(0,300px)_1fr]">
        <PlateGraphic />

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Row
            color={COLORS.veg.strong}
            icon={<FoodThumb src="/images/food-veg.jpg" />}
            name="蔬菜"
            ratio="2"
            main={
              <>
                至少 <Big color={COLORS.veg.strong}>{veg}</Big> 份
                <span className="text-ink-soft">（煮熟約 {half(veg / 2)} 碗），多吃不設限</span>
              </>
            }
            sub="1 份 ≈ 生重 100 克 ≈ 煮熟半碗，深色蔬菜佔一半以上更好"
          />
          <Row
            color={COLORS.protein.strong}
            icon={<FoodThumb src="/images/food-protein.jpg" />}
            name="豆魚蛋肉"
            ratio="1"
            main={
              <>
                蛋白質 <Big color={COLORS.protein.strong}>{fmt(macros.protein.grams)}</Big> 克 ≈{" "}
                <strong>{half(exchange.eggs)}</strong> 顆蛋
              </>
            }
            sub={
              <>或約 {half(exchange.drumsticks)} 片手掌大雞腿排（1 片約 105 克）</>
            }
          />
          <Row
            color={COLORS.grain.strong}
            icon={<FoodThumb src="/images/food-grain.jpg" />}
            name="全穀雜糧"
            ratio="1"
            main={
              <>
                醣類 <Big color={COLORS.grain.strong}>{fmt(macros.carbs.grams)}</Big> 克 ≈{" "}
                <strong>{half(exchange.riceBowls)}</strong> 碗飯
              </>
            }
            sub="1 碗飯 ≈ 醣類 60 克；蔬果奶類也有醣類，實際飯量可再少一點"
          />
          <Row
            color={COLORS.oil.strong}
            icon={<OilBadge />}
            name="油脂"
            ratio="＋"
            main={
              <>
                脂肪 <Big color={COLORS.oil.strong}>{fmt(macros.fat.grams)}</Big> 克 ≈{" "}
                <strong>{half(exchange.oilTeaspoons)}</strong> 茶匙油
              </>
            }
            sub="1 茶匙油 ≈ 5 克 ≈ 5 粒杏仁果；肉類和蛋也含油，烹調用油可少一些"
          />
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-ink/25 pt-4 text-sm">
        <span className="chip border-ink/60 bg-mustard/25">一餐約</span>
        <span>
          蔬菜裝滿半盤・飯約 {half(exchange.riceBowls / 3)} 碗・蛋白質約 {half(exchange.eggs / 3)} 份（≈ {half(exchange.eggs / 3)} 顆蛋的量）
        </span>
        <span className="text-ink-soft">（以一天三餐平均）</span>
      </div>
    </div>
  );
}

function Big({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="font-display text-2xl" style={{ color }}>
      {children}
    </span>
  );
}

function Row({
  color,
  icon,
  name,
  ratio,
  main,
  sub,
}: {
  color: string;
  icon: ReactNode;
  name: string;
  ratio: string;
  main: ReactNode;
  sub: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border-2 border-ink/15 bg-white/50 px-3 py-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full font-display text-sm text-white"
            style={{ backgroundColor: color }}
          >
            {ratio}
          </span>
          <span className="font-bold">{name}</span>
        </div>
        <div className="mt-0.5 leading-snug">{main}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-ink-soft">{sub}</div>
      </div>
    </li>
  );
}

function FoodThumb({ src }: { src: string }) {
  return (
    <span className="relative block h-14 w-14 overflow-hidden rounded-full border-2 border-ink shadow-[2px_2px_0_rgb(62_58_53/0.2)]">
      <Image src={src} alt="" fill sizes="56px" className="object-cover" />
    </span>
  );
}

function OilBadge() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-mustard/70 font-display text-xl text-ink shadow-[2px_2px_0_rgb(62_58_53/0.2)]">
      油
    </span>
  );
}

/** 餐盤：下半蔬菜、左上全穀、右上蛋白質，各區塊填入便當插畫中的食物 */
function PlateGraphic() {
  const c = 150;
  const r = 120;
  const ink = "#3e3a35";
  const veg = `M${c - r} ${c} A${r} ${r} 0 0 0 ${c + r} ${c} Z`;
  const grain = `M${c} ${c} H${c - r} A${r} ${r} 0 0 1 ${c} ${c - r} Z`;
  const protein = `M${c} ${c} V${c - r} A${r} ${r} 0 0 1 ${c + r} ${c} Z`;
  return (
    <svg
      viewBox="0 0 300 300"
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="211 餐盤：一半蔬菜、四分之一蛋白質、四分之一全穀"
    >
      <defs>
        <radialGradient id="plate-shine" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#efe4cf" />
        </radialGradient>
        <clipPath id="clip-veg"><path d={veg} /></clipPath>
        <clipPath id="clip-grain"><path d={grain} /></clipPath>
        <clipPath id="clip-protein"><path d={protein} /></clipPath>
      </defs>

      {/* 盤子 */}
      <circle cx={c} cy={c + 7} r="146" fill="rgb(62 58 53 / 0.18)" />
      <circle cx={c} cy={c} r="146" fill="url(#plate-shine)" stroke={ink} strokeWidth="3" />
      <circle cx={c} cy={c} r="135" fill="none" stroke="#2c8f86" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />

      {/* 三區塊：直接以便當插畫中的食物填滿 */}
      <rect x={c - r} y={c} width={r * 2} height={r} fill={COLORS.veg.fill} clipPath="url(#clip-veg)" />
      <image href="/images/food-veg-wide.jpg" x={c - r} y={c} width={r * 2} height={r} preserveAspectRatio="xMidYMid slice" clipPath="url(#clip-veg)" />
      <image href="/images/food-grain.jpg" x={c - r} y={c - r} width={r} height={r} preserveAspectRatio="xMidYMid slice" clipPath="url(#clip-grain)" />
      <image href="/images/food-protein.jpg" x={c} y={c - r} width={r} height={r} preserveAspectRatio="xMidYMid slice" clipPath="url(#clip-protein)" />

      {/* 分隔線 */}
      <g fill="none" stroke={ink} strokeWidth="3.5" strokeLinejoin="round">
        <circle cx={c} cy={c} r={r} />
        <path d={`M${c - r} ${c} H${c + r} M${c} ${c} V${c - r}`} />
      </g>

      <Label x={c} y={c + 62} text="蔬菜 2" color={COLORS.veg.strong} />
      <Label x={c - 54} y={c - 46} text="全穀 1" color={COLORS.grain.strong} />
      <Label x={c + 56} y={c - 46} text="蛋白質 1" color={COLORS.protein.strong} />
    </svg>
  );
}

function Label({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const w = text.length * 13 + 16;
  return (
    <g>
      <rect x={x - w / 2 + 1.5} y={y - 10} width={w} height="24" rx="12" fill="rgb(62 58 53 / 0.35)" />
      <rect x={x - w / 2} y={y - 13} width={w} height="24" rx="12" fill={color} stroke="#3e3a35" strokeWidth="2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fill="#fff" style={{ fontFamily: "var(--font-display)" }}>
        {text}
      </text>
    </g>
  );
}
