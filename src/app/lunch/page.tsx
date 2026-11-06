import type { Metadata } from "next";
import LunchPicker from "./LunchPicker";

export const metadata: Metadata = {
  title: "午餐大轉盤｜健康列車",
  description: "輸入想吃的餐點，轉動抽籤轉盤，讓小主廚幫你決定今天午餐吃什麼。",
};

export default function LunchPage() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <LunchPicker />
    </div>
  );
}
