import type { Metadata } from "next";
import { getImageProps } from "next/image";
import NutritionCalculator from "./NutritionCalculator";

export const metadata: Metadata = {
  title: "每日營養計算｜健康便當列車",
  description: "輸入身高體重，算出 BMI、TDEE 與三大營養素建議攝取量，並用 211 餐盤換算成幾碗飯、幾顆蛋。",
};

const BANNER_ALT =
  "今天該吃多少？算給你看！輸入身高體重，算出 BMI、每日消耗熱量，再用 211 餐盤換成幾碗飯、幾顆蛋。";

export default function NutritionPage() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <h1 className="sr-only">今天該吃多少？算給你看！</h1>
      <NutritionBanner />
      <NutritionCalculator />
    </div>
  );
}

/**
 * 主視覺 banner（文字已在圖內）
 * 平板與桌機顯示完整 3:1 橫幅；手機只顯示左半部（標題＋說明＋吉祥物），避免字太小
 */
function NutritionBanner() {
  const common = { alt: BANNER_ALT, sizes: "(min-width: 1152px) 1104px, 100vw" };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/images/nutrition-banner.jpg", width: 2172, height: 724 });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    src: "/images/nutrition-banner-mobile.jpg",
    width: 1340,
    height: 724,
    priority: true,
  });

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-ink shadow-[5px_6px_0_rgb(62_58_53/0.2)]">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop} />
        <source srcSet={mobile} />
        <img {...rest} alt={BANNER_ALT} className="block h-auto w-full" />
      </picture>
    </section>
  );
}
