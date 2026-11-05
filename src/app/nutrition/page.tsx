import type { Metadata } from "next";
import NutritionCalculator from "./NutritionCalculator";

export const metadata: Metadata = {
  title: "每日營養計算｜健康便當列車",
  description: "輸入身高體重，算出 BMI、TDEE 與三大營養素建議攝取量，並用 211 餐盤換算成幾碗飯、幾顆蛋。",
};

export default function NutritionPage() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <h1 className="sr-only">營養計算站：輸入身高體重，算出每天該吃多少</h1>
      <NutritionCalculator />
    </div>
  );
}
