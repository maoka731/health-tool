import type { Metadata } from "next";
import StampStation from "./StampStation";

export const metadata: Metadata = {
  title: "健康集章站｜健康便當列車",
  description: "每天抽一支健康任務籤，完成就蓋一個車站紀念章，集滿解鎖徽章。",
};

export default function StampsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <StampStation />
    </div>
  );
}
