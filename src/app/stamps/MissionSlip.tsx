import Image from "next/image";
import { MAX_REDRAWS, MISSION_CATEGORIES, type DayRecord, type Mission } from "@/lib/missions";
import StationStamp from "./StationStamp";

/** 籤紙：抽到的今日任務。完成後蓋上車站紀念章。 */
export default function MissionSlip({
  mission,
  record,
  today,
  justStamped,
  onStamp,
  onRedraw,
  onUnstamp,
}: {
  mission: Mission;
  record: DayRecord;
  today: Date;
  justStamped: boolean;
  onStamp: () => void;
  onRedraw: () => void;
  onUnstamp: () => void;
}) {
  const c = MISSION_CATEGORIES[mission.category];
  const done = Boolean(record.stampedAt);
  const redrawsLeft = MAX_REDRAWS - record.redraws;

  return (
    <div className="slip-unfold relative">
      {/* 籤紙本體：上下鋸齒、直式籤號 */}
      <div
        className="relative overflow-hidden border-x-2 border-ink bg-[#fbf3e2] shadow-[4px_5px_0_rgb(62_58_53/0.18)]"
        style={{
          WebkitMask:
            "radial-gradient(circle 6px at 50% 0, #0000 98%, #000) top / 16px 51% repeat-x, radial-gradient(circle 6px at 50% 100%, #0000 98%, #000) bottom / 16px 51% repeat-x",
          mask: "radial-gradient(circle 6px at 50% 0, #0000 98%, #000) top / 16px 51% repeat-x, radial-gradient(circle 6px at 50% 100%, #0000 98%, #000) bottom / 16px 51% repeat-x",
        }}
      >
        <div className="flex">
          {/* 左側直書：籤等 */}
          <div className="flex w-14 shrink-0 flex-col items-center gap-2 bg-brick px-2 py-6 text-paper-light sm:w-16">
            <span className="text-[10px] tracking-[0.3em]">第</span>
            <span className="font-[family-name:var(--font-chiron)] text-xl leading-none font-black [writing-mode:vertical-rl]">
              {mission.luck}
            </span>
            <span className="text-[10px] tracking-[0.3em] [writing-mode:vertical-rl]">今日任務籤</span>
          </div>

          <div className="relative min-w-0 flex-1 px-5 pt-6 pb-5 sm:px-6">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-xs font-bold"
              style={{ borderColor: c.color, color: c.color, background: c.tint }}
            >
              <span aria-hidden>{c.icon}</span>
              {c.label}・{c.station}
            </span>
            <h3 className="poster-title mt-2 rotate-0! text-[1.7rem] leading-tight sm:text-3xl">{mission.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">{mission.detail}</p>
            <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-dashed border-ink/25 bg-paper/60 px-3 py-2">
              <Image src="/images/mascot-face-happy.png" alt="" width={69} height={64} className="h-8 w-auto shrink-0" />
              <p className="text-sm text-ink-soft">{mission.tip}</p>
            </div>

            {/* 動作 */}
            <div className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 ${done ? "pr-20 sm:pr-28" : ""}`}>
              {!done ? (
                <>
                  <button
                    type="button"
                    onClick={onStamp}
                    className="flex items-center gap-2 rounded-full border-2 border-ink bg-brick px-5 py-2.5 font-[family-name:var(--font-chiron)] text-lg font-black text-paper-light shadow-[0_4px_0_#3e3a35] outline-[1.5px] outline-offset-[-6px] outline-paper-light/70 outline-dashed transition active:translate-y-0.5 active:shadow-[0_2px_0_#3e3a35]"
                  >
                    完成任務・蓋章！
                  </button>
                  <button
                    type="button"
                    onClick={onRedraw}
                    disabled={redrawsLeft <= 0}
                    className="text-sm text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick disabled:no-underline disabled:opacity-50"
                  >
                    {redrawsLeft > 0 ? `換一支籤（今天還能換 ${redrawsLeft} 次）` : "今天已經換過籤囉"}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display text-base whitespace-nowrap text-leaf sm:text-lg">任務達成！已蓋章 ✓</p>
                  <button
                    type="button"
                    onClick={onUnstamp}
                    className="text-xs text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick"
                  >
                    不小心按到？取消蓋章
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 蓋上的章 */}
      {done && (
        <div className="pointer-events-none absolute -right-2 -bottom-4 sm:-right-4">
          <StationStamp category={mission.category} date={today} size={112} rotate={-14} animate={justStamped} className="h-auto w-24 sm:w-28" />
        </div>
      )}
    </div>
  );
}
