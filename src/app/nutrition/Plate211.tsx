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

const MEALS = 3;

/** 211 餐盤：蔬菜 2、蛋白質 1、全穀 1。四格顯示「一餐」份量，底部顯示一天總量 */
export default function Plate211({ result }: { result: NutritionResult }) {
  const { macros, exchange, tdee } = result;
  const veg = vegetableServings(tdee);
  const meal = (n: number) => n / MEALS;

  return (
    <div className="retro-card px-3 pt-5 pb-5 min-[400px]:px-4 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-baseline gap-2 font-display text-2xl text-brick sm:text-3xl">
          你的 211 餐盤
          <span className="chip -translate-y-1 border-ink/70 bg-mustard/40 font-sans text-sm text-ink">每一餐</span>
        </h2>
        <span className="text-xs text-ink-soft sm:text-sm">
          醣類 {MACRO_RATIO.carbs * 100}%・蛋白質 {MACRO_RATIO.protein * 100}%・脂肪 {MACRO_RATIO.fat * 100}%
        </span>
      </div>

      <div className="mt-4 grid items-center gap-5 md:grid-cols-[220px_1fr] xl:grid-cols-[250px_1fr]">
        <PlateGraphic />

        <ul className="grid grid-cols-2 gap-2 min-[400px]:gap-2.5 sm:gap-3">
          <FoodTile
            color={COLORS.veg.strong}
            tint={COLORS.veg.fill}
            image="/images/food-veg.jpg"
            name="蔬菜"
            ratio="2"
            amount={`${half(meal(veg))}+`}
            unit="份"
            detail={`煮熟約 ${half(meal(veg) / 2)} 碗以上`}
            note="裝滿半個盤子，多吃不設限"
          />
          <FoodTile
            color={COLORS.protein.strong}
            tint={COLORS.protein.fill}
            image="/images/food-protein.jpg"
            name="豆魚蛋肉"
            ratio="1"
            amount={half(meal(exchange.drumsticks))}
            unit="片雞腿排"
            detail={`蛋白質 ${fmt(meal(macros.protein.grams))} 克`}
            note={`也可以換算成 ${half(meal(exchange.eggs))} 顆蛋`}
          />
          <FoodTile
            color={COLORS.grain.strong}
            tint={COLORS.grain.fill}
            image="/images/food-grain.jpg"
            name="全穀雜糧"
            ratio="1"
            amount={half(meal(exchange.riceBowls))}
            unit="碗飯"
            detail={`醣類 ${fmt(meal(macros.carbs.grams))} 克`}
            note="1 碗 ≈ 60 克；蔬果奶也含醣"
          />
          <FoodTile
            color={COLORS.oil.strong}
            tint="#cfe7e3"
            name="油脂"
            ratio="＋"
            amount={half(meal(exchange.oilTeaspoons))}
            unit="茶匙油"
            detail={`脂肪 ${fmt(meal(macros.fat.grams))} 克`}
            note="肉和蛋也含油，烹調可少用"
          />
        </ul>
      </div>

      {/* 一天總量 */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border-2 border-dashed border-ink/30 bg-paper/50 px-3 py-2.5">
        <span className="chip shrink-0 border-ink/70 bg-sea-light/60">一天總共</span>
        <MealItem image="/images/food-veg.jpg" text={`蔬菜 ${half(veg / 2)} 碗以上`} />
        <MealItem image="/images/food-protein.jpg" text={`蛋白質 ${half(exchange.eggs)} 份`} />
        <MealItem image="/images/food-grain.jpg" text={`飯 ${half(exchange.riceBowls)} 碗`} />
        <MealItem text={`油 ${half(exchange.oilTeaspoons)} 茶匙`} />
        <span className="text-xs text-ink-soft">（以一天三餐計算）</span>
      </div>
    </div>
  );
}

function FoodTile({
  color,
  tint,
  image,
  name,
  ratio,
  amount,
  unit,
  detail,
  note,
}: {
  color: string;
  tint: string;
  image?: string;
  name: string;
  ratio: string;
  amount: string;
  unit: string;
  detail: string;
  note: string;
}) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-[#fffaf0] shadow-[2px_3px_0_rgb(62_58_53/0.15)]">
      <div className="flex items-center gap-1.5 border-b-2 border-dashed border-ink/25 px-2 py-1.5 sm:gap-2 sm:px-2.5" style={{ backgroundColor: tint }}>
        {image ? (
          <span className="relative block h-6 w-6 shrink-0 overflow-hidden rounded-full border-2 border-ink sm:h-7 sm:w-7">
            <Image src={image} alt="" fill sizes="28px" className="object-cover" />
          </span>
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mustard/80 font-display text-xs sm:h-7 sm:w-7 sm:text-sm">
            油
          </span>
        )}
        <span className="text-[13px] font-bold whitespace-nowrap sm:text-sm">{name}</span>
        <span
          className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-display text-xs text-white"
          style={{ backgroundColor: color }}
          title={`211 比例：${ratio}`}
        >
          {ratio}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2 pt-1.5 pb-2 sm:px-2.5">
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-xs text-ink-soft">約</span>
          <span className="font-display text-[1.7rem] leading-none min-[400px]:text-3xl sm:text-4xl" style={{ color }}>
            {amount}
          </span>
          <span className="text-[13px] font-bold min-[400px]:text-sm">{unit}</span>
        </div>
        <div className="mt-1 text-xs font-medium text-ink">{detail}</div>
        <div className="mt-0.5 text-[11px] leading-snug text-ink-soft">{note}</div>
      </div>
    </li>
  );
}

function MealItem({ image, text }: { image?: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium">
      {image ? (
        <span className="relative block h-6 w-6 shrink-0 overflow-hidden rounded-full border-[1.5px] border-ink">
          <Image src={image} alt="" fill sizes="24px" className="object-cover" />
        </span>
      ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-mustard/80 font-display text-xs">
          油
        </span>
      )}
      {text}
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
      className="mx-auto w-full max-w-[260px]"
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
