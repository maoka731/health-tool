// 【保留備用】健康集章站的站牌看板（含今天日期與連續天數），目前頁面未使用。
import StationBoard, { BoardCard } from "@/components/StationBoard";
import { addDays, parseKey } from "@/lib/missions";

/** 站牌看板：今天日期、連續天數 */
export default function StampBoard({ todayKey, streak }: { todayKey: string; streak: number }) {
  const d = parseKey(todayKey);
  const week = "日一二三四五六"[d.getDay()];
  const prev = addDays(d, -1);
  const next = addDays(d, 1);
  return (
    <StationBoard
      title="健康集章站"
      subtitle="每天抽一支任務籤，完成就蓋一個章！"
      en="HEALTH STAMP STATION"
      prev={{ label: `${prev.getMonth() + 1}/${prev.getDate()}` }}
      next={{ label: `${next.getMonth() + 1}/${next.getDate()}` }}
      aside={
        <>
          <BoardCard top="TODAY" main={`${d.getMonth() + 1}/${d.getDate()}`} bottom={`星期${week}`} />
          <BoardCard top="STREAK" main={streak} bottom="天連續" tone="mustard" />
        </>
      }
    />
  );
}
