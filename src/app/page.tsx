import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ParallaxScope, Reveal } from "@/components/Parallax";
import NutritionCalculatorClassic from "@/components/widgets/NutritionCalculatorClassic";
import { px } from "@/lib/parallax";
import { AboutTrain, ConductorAndFaq, SectionTitle, Timetable, TrainStory } from "./HomeStory";

// ─────────────────────────────────────────────
// 首頁 Landing：健康列車
// 主視覺 Banner → 三大分頁入口 → 這是一班什麼樣的列車 → 路線導覽圖（小火車沿軌道前進）
// → 時刻表 → 列車小故事 → 列車長的話＋乘車須知
// ─────────────────────────────────────────────

interface Stop {
  no: number;
  title: string;
  station: string;
  en: string;
  href: string;
  color: string;
  deep: string;
  illust: { src: string; w: number; h: number };
  lead: [string, string];
  desc: string;
  points: string[];
}

const STOPS: Stop[] = [
  {
    no: 1,
    title: "營養計算",
    station: "營養計算站",
    en: "NUTRITION",
    href: "/nutrition",
    color: "#6ba367",
    deep: "#4c7f49",
    illust: { src: "/images/landing/ill-nutrition.png", w: 154, h: 160 },
    lead: ["算出身體所需", "掌握每日份量"],
    desc: "輸入身高、體重和活動量，算出 BMI、每日熱量，再換成看得懂的份量：幾碗飯、幾份蛋白質、幾份蔬菜。",
    points: ["BMI 與每日熱量（TDEE）", "211 餐盤：一餐怎麼配", "換算成飯碗、掌心、拳頭"],
  },
  {
    no: 2,
    title: "午餐大轉盤",
    station: "午餐大轉盤",
    en: "LUNCH WHEEL",
    href: "/lunch",
    color: "#e76b3c",
    deep: "#b5452b",
    illust: { src: "/images/landing/ill-lunch.png", w: 147, h: 161 },
    lead: ["選擇困難？", "轉盤幫你決定"],
    desc: "把想吃的便當、小吃、速食放上轉盤，轉一下就有答案。還有常見午餐可以一鍵加入，每次來都有新組合。",
    points: ["自訂轉盤選項與圖片", "便當・小吃・速食・異國快速加入", "抽出結果做成午餐車票"],
  },
  {
    no: 3,
    title: "每日任務籤",
    station: "每日任務籤",
    en: "DAILY MISSIONS",
    href: "/stamps",
    color: "#2c8f86",
    deep: "#1f6b64",
    illust: { src: "/images/landing/ill-stamps.png", w: 98, h: 151 },
    lead: ["抽取健康任務", "養成好習慣"],
    desc: "飲食、活動、身心三個籤筒，每天各抽一支小任務。完成就蓋上車站紀念章，集滿月曆、解鎖成就徽章。",
    points: ["每天三支任務籤：大吉到凶", "蓋章集滿月曆", "10 枚成就徽章等你收集"],
  },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <Entrances />
      <AboutTrain />
      <Route />
      <Timetable />
      <TrainStory />
      <ConductorAndFaq />
    </div>
  );
}

// ─── 主視覺 Banner（照 UI 設定圖 v2） ─────────

function Hero() {
  return (
    <ParallaxScope as="section" ariaLabel="健康列車" className="w-full">
      <div className="relative aspect-[2/1] overflow-hidden border-b-2 border-ink shadow-[0_3px_0_rgb(62_58_53/0.12)] sm:aspect-[2172/724]">
        {/* 圖片比外框高一點，捲動時慢慢位移產生視差 */}
        <div className="px absolute inset-x-0 -top-[3%] -bottom-[3%]" style={px(-28)}>
          <Image
            src="/images/landing/hero-banner-v4.jpg"
            alt="健康列車：搭上營養列車，展開你的健康生活！小主廚捧著便當在月台迎接列車"
            fill
            priority
            sizes="100vw"
            className="object-cover object-left sm:object-center"
          />
        </div>
      </div>
      <a
        href="#entrances"
        className="cue-bob mx-auto mt-4 flex w-fit items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-brick"
      >
        往下滑，列車出發囉 <span aria-hidden>↓</span>
      </a>
    </ParallaxScope>
  );
}

// ─── 三大分頁入口 ─────────────────────────────

function Entrances() {
  return (
    <section id="entrances" className="mx-auto mt-14 max-w-6xl scroll-mt-28 px-4 sm:px-6" aria-labelledby="entrances-title">
      <Reveal>
        <SectionTitle en="THREE STATIONS" sub="三個小工具，陪你把健康變成日常">
          <span id="entrances-title">選一站，上車吧！</span>
        </SectionTitle>
      </Reveal>
      <div className="mx-auto mt-8 grid max-w-xl gap-5 lg:max-w-none lg:grid-cols-3 lg:gap-6">
        {STOPS.map((s, i) => (
          <Reveal key={s.href} delay={i * 120}>
            <EntranceTicket stop={s} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function EntranceTicket({ stop: s }: { stop: Stop }) {
  return (
    <Link
      href={s.href}
      className="group relative block h-full rounded-2xl border-2 bg-[#fbf3e2] p-2 shadow-[3px_4px_0_rgb(62_58_53/0.16)] transition hover:-translate-y-1 hover:shadow-[4px_8px_0_rgb(62_58_53/0.18)]"
      style={{ borderColor: s.color }}
    >
      {/* 車票兩側缺口 */}
      <span className="absolute top-1/2 -left-[9px] h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-background" style={{ borderColor: s.color, clipPath: "inset(0 0 0 50%)" }} aria-hidden />
      <span className="absolute top-1/2 -right-[9px] h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-background" style={{ borderColor: s.color, clipPath: "inset(0 50% 0 0)" }} aria-hidden />
      <div
        className="relative flex h-full items-center gap-3 rounded-xl border-2 border-dashed px-3 py-4 pr-4 sm:gap-4 sm:px-4"
        style={{ borderColor: `${s.color}99` }}
      >
        <Image
          src={s.illust.src}
          alt=""
          width={s.illust.w}
          height={s.illust.h}
          className="h-24 w-auto shrink-0 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 lg:h-28"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.2em]" style={{ color: s.color }}>
            STATION {String(s.no).padStart(2, "0")}
          </p>
          <h3 className="font-[family-name:var(--font-chiron)] text-2xl font-black whitespace-nowrap text-ink">{s.title}</h3>
          <div className="my-2 h-px w-full" style={{ background: `${s.color}66` }} />
          <p className="text-sm leading-relaxed text-ink-soft">
            {s.lead[0]}
            <br />
            {s.lead[1]}
          </p>
        </div>
        <span
          className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full text-lg text-white transition-transform group-hover:translate-x-1"
          style={{ background: s.color }}
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}

// ─── 路線導覽圖：小火車沿軌道往下開 ───────────

function Route() {
  return (
    <section id="route" className="mx-auto mt-24 max-w-6xl scroll-mt-28 px-4 sm:px-6" aria-labelledby="route-title">
      <Reveal>
        <SectionTitle en="ROUTE MAP" sub="一路往下滑，小火車會帶你逛完每一站">
          <span id="route-title">路線導覽圖</span>
        </SectionTitle>
      </Reveal>

      <ParallaxScope className="relative mt-12">
        {/* 軌道：手機在左側、平板以上在中間 */}
        <div className="rail-track absolute top-0 bottom-0 left-4 w-6 rounded-full lg:left-1/2 lg:-translate-x-1/2" aria-hidden />
        {/* 小火車：依捲動進度沿軌道前進 */}
        <div
          className="pointer-events-none absolute left-4 z-20 w-6 lg:left-1/2 lg:-translate-x-1/2"
          style={{ top: "calc(var(--progress, 0) * (100% - 3.5rem))" }}
          aria-hidden
        >
          <div className="absolute left-1/2 w-14 -translate-x-1/2">
            <Image
              src="/images/stamps/train.png"
              alt=""
              width={104}
              height={101}
              className="chug h-auto w-full drop-shadow-[0_4px_3px_rgb(62_58_53/0.3)]"
            />
          </div>
        </div>

        <ol className="space-y-20 lg:space-y-28">
          {STOPS.map((s, i) => (
            <RouteStop key={s.href} stop={s} flip={i % 2 === 1} next={STOPS[i + 1]?.station} prev={STOPS[i - 1]?.station}>
              {s.no === 1 && <NutritionQuick />}
              {s.no === 2 && <LunchArt />}
              {s.no === 3 && <MissionArt />}
            </RouteStop>
          ))}
        </ol>
      </ParallaxScope>
    </section>
  );
}

function RouteStop({
  stop: s,
  flip,
  prev,
  next,
  children,
}: {
  stop: Stop;
  flip: boolean;
  prev?: string;
  next?: string;
  children: ReactNode;
}) {
  return (
    <ParallaxScope as="li" className="relative grid gap-8 pl-14 sm:pl-16 lg:grid-cols-2 lg:items-stretch lg:gap-20 lg:pl-0">
      {/* 站點圓點 */}
      <span
        className="absolute top-6 left-4 z-10 flex h-9 w-9 -translate-x-1.5 items-center justify-center rounded-full border-[3px] border-ink bg-paper-light font-[family-name:var(--font-chiron)] text-base font-black lg:top-1/2 lg:left-1/2 lg:h-11 lg:w-11 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:text-lg"
        style={{ color: s.deep }}
        aria-hidden
      >
        {s.no}
      </span>

      {/* 站點說明 */}
      <div className={`flex flex-col justify-center ${flip ? "lg:order-2" : ""}`}>
        <Reveal>
          <StationSign stop={s} prev={prev} next={next} />
          <p className="mt-5 text-base leading-relaxed text-ink">{s.desc}</p>
          <ul className="mt-4 space-y-2">
            {s.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-bold text-ink sm:text-base">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] text-white" style={{ background: s.color }} aria-hidden>
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* 另一側：互動元件或示意圖 */}
      <div className={`relative flex flex-col justify-center ${flip ? "lg:order-1" : ""}`}>{children}</div>
    </ParallaxScope>
  );
}

/** 台鐵風站名牌：中間站名、下方英文、左右前後站 */
function StationSign({ stop: s, prev, next }: { stop: Stop; prev?: string; next?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-ink bg-[#fffdf7] shadow-[3px_4px_0_rgb(62_58_53/0.16)]">
      <div className="px-4 pt-3 pb-2 text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-ink-soft">第 {s.no} 站</p>
        <p className="font-[family-name:var(--font-chiron)] text-3xl font-black tracking-[0.15em] text-ink sm:text-4xl">{s.station}</p>
        <p className="text-xs font-bold tracking-[0.3em] text-ink-soft">{s.en}</p>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-bold text-white sm:text-sm" style={{ background: s.deep }}>
        <span>{prev ? `◀ ${prev}` : "◀ 起站"}</span>
        <span>{next ? `${next} ▶` : "終點站 ▶"}</span>
      </div>
    </div>
  );
}

/** 第 1 站：首頁快捷計算機，填完按「前往」帶著資料跳到營養計算頁 */
function NutritionQuick() {
  return (
    <div className="mx-auto w-full max-w-md pt-8 lg:h-full lg:max-w-none lg:pt-0">
      <NutritionCalculatorClassic variant="quick" />
    </div>
  );
}

/** 第 2 站：轉盤組合示意圖＋幾道餐點 */
function LunchArt() {
  // 餐點放在盤面上，位置以轉盤圖的百分比計（盤面中心約在 53.5%, 47%）
  const meals = [
    { src: "/images/meal-salmon-bento.png", w: 189, h: 150, x: 37, y: 31, r: -8 },
    { src: "/images/meal-beef-noodle.png", w: 189, h: 150, x: 70, y: 31, r: 6 },
    { src: "/images/meal-sushi.png", w: 360, h: 270, x: 37, y: 64, r: 6 },
    { src: "/images/meal-burger-set.png", w: 177, h: 148, x: 70, y: 64, r: -6 },
  ];
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center lg:max-w-[22rem]">
      <Link href="/lunch" aria-label="前往午餐大轉盤" className="group block w-full">
      <div className="px relative" style={px(-30)}>
        <Image src="/images/landing/lunch-wheel-full.png" alt="" width={447} height={461} className="h-auto w-full transition-transform duration-500 group-hover:-rotate-2" />
        {meals.map((m, i) => (
          <Image
            key={m.src}
            src={m.src}
            alt=""
            width={m.w}
            height={m.h}
            className="px absolute w-[19%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_3px_2px_rgb(62_58_53/0.25)]"
            style={{ left: `${m.x}%`, top: `${m.y}%`, rotate: `${m.r}deg`, ...px(20 + i * 14) }}
          />
        ))}
      </div>
      </Link>
      <Link
        href="/lunch"
        className="relative z-10 -mt-2 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[#b5452b] px-7 py-2.5 font-[family-name:var(--font-chiron)] text-xl font-black text-paper-light shadow-[0_3px_0_#3e3a35] outline-[1.5px] outline-offset-[-5px] outline-paper-light/70 outline-dashed transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
      >
        轉轉看 <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

/** 第 3 站：今日任務籤 Banner（任務籤筒素材左上角），「去抽籤」按鈕蓋在圖中按鈕的位置 */
function MissionArt() {
  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-none">
      <div className="px relative rotate-1" style={px(-24)}>
        <Image
          src="/images/landing/mission-scene.png"
          alt="小主廚和今日任務籤筒：抽一支籤，開啟今天的健康任務吧！"
          width={718}
          height={442}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-auto w-full rounded-2xl border-2 border-ink shadow-[4px_6px_0_rgb(62_58_53/0.18)]"
        />
        <Link
          href="/stamps"
          className="absolute top-[86.5%] left-[29.5%] flex h-[13%] w-[45.5%] items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-[#1f6b64] font-[family-name:var(--font-chiron)] text-base font-black text-paper-light shadow-[0_3px_0_#3e3a35] outline-[1.5px] outline-offset-[-5px] outline-paper-light/70 outline-dashed transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none sm:text-xl"
        >
          去抽籤 <span aria-hidden>▶</span>
        </Link>
      </div>
    </div>
  );
}
