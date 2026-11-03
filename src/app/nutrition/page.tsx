import type { Metadata } from "next";
import StationHero from "@/components/StationHero";
import NutritionCalculator from "./NutritionCalculator";

export const metadata: Metadata = {
  title: "每日營養計算｜健康便當列車",
  description: "輸入身高體重，算出 BMI、TDEE 與三大營養素建議攝取量，並用 211 餐盤換算成幾碗飯、幾顆蛋。",
};

export default function NutritionPage() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <StationHero
        tag="本站：每日營養補給站"
        title={
          <>
            今天該吃多少？
            <br />
            算給你看！
          </>
        }
        subtitle={
          <>
            輸入身高體重，算出 BMI、每日消耗熱量，
            <br className="hidden sm:inline" />
            再用 211 餐盤換成「幾碗飯、幾顆蛋」。
          </>
        }
      />

      <NutritionCalculator />
    </div>
  );
}
