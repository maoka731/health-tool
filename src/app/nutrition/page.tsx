import type { Metadata } from "next";
import Image from "next/image";
import NutritionCalculator from "./NutritionCalculator";

export const metadata: Metadata = {
  title: "每日營養計算｜健康便當列車",
  description: "輸入身高體重，算出 BMI、TDEE 與三大營養素建議攝取量，並用 211 餐盤換算成幾碗飯、幾顆蛋。",
};

const STEPS = ["輸入身高體重", "算出 BMI 與熱量", "換成幾碗飯、幾片雞腿排"];

export default function NutritionPage() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <NutritionBanner />
      <NutritionCalculator />
    </div>
  );
}

/** 精簡版主視覺：純色紙卡＋標題＋三步驟，右側便當圖示（吉祥物留給下方表單） */
function NutritionBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-ink bg-paper px-5 py-5 shadow-[4px_5px_0_rgb(62_58_53/0.15)] sm:px-8 sm:py-6">
      {/* 右側淡淡的海景色塊 */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 sm:block"
        style={{ background: "linear-gradient(100deg, transparent 0%, rgb(191 227 220 / 0.55) 35%, rgb(191 227 220 / 0.8) 100%)" }}
        aria-hidden
      />
      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <span className="chip text-xs text-sea sm:text-sm">本站：每日營養補給站</span>
          <h1 className="mt-2 font-display text-[1.7rem] leading-tight text-brick sm:text-4xl">
            今天該吃多少？
            <br className="sm:hidden" />
            算給你看！
          </h1>
          <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-ink">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i > 0 && <span className="hidden text-ink/40 sm:inline" aria-hidden>→</span>}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brick font-display text-xs text-paper-light">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <Image
          src="/images/icon-bento.png"
          alt=""
          width={93}
          height={63}
          priority
          className="mr-2 hidden h-auto w-32 shrink-0 -rotate-6 drop-shadow-[2px_3px_0_rgb(62_58_53/0.15)] sm:block md:w-40"
        />
      </div>
    </section>
  );
}
