import { LUCK_HINT, MAX_REDRAWS, MISSION_CATEGORIES, luckOf, type Draw, type Mission } from "@/lib/missions";
import StationStamp from "./StationStamp";

/**
 * 籤紙：抽到的任務。左側直書「第 n 首」＋籤等，仿照廟宇籤詩的版型。
 * 完成後蓋上該籤筒的車站紀念章。
 */
export default function MissionSlip({
  mission,
  draw,
  today,
  justStamped,
  onStamp,
  onRedraw,
  onUnstamp,
}: {
  mission: Mission;
  draw: Draw;
  today: Date;
  justStamped: boolean;
  onStamp: () => void;
  onRedraw: () => void;
  onUnstamp: () => void;
}) {
  const c = MISSION_CATEGORIES[mission.category];
  const luck = luckOf(mission);
  const done = Boolean(draw.stampedAt);
  const redrawsLeft = MAX_REDRAWS - draw.redraws;

  return (
    <div className="slip-unfold relative">
      <div
        className="relative overflow-hidden border-x-2 border-ink bg-[#fbf3e2] shadow-[4px_5px_0_rgb(62_58_53/0.18)]"
        style={{
          WebkitMask:
            "radial-gradient(circle 6px at 50% 0, #0000 98%, #000) top / 16px 51% repeat-x, radial-gradient(circle 6px at 50% 100%, #0000 98%, #000) bottom / 16px 51% repeat-x",
          mask: "radial-gradient(circle 6px at 50% 0, #0000 98%, #000) top / 16px 51% repeat-x, radial-gradient(circle 6px at 50% 100%, #0000 98%, #000) bottom / 16px 51% repeat-x",
        }}
      >
        <div className="flex">
          {/* 左側直書：第 n 首＋籤等 */}
          <div
            className="flex w-14 shrink-0 flex-col items-center gap-2 px-1.5 py-6 text-paper-light"
            style={{ background: luck === "凶" ? "#3e3a35" : c.deep }}
          >
            <span className="flex flex-col items-center text-xs leading-tight font-bold tracking-widest">
              <span>第</span>
              <span className="my-0.5 font-[family-name:var(--font-chiron)] text-xl leading-none font-black tabular-nums">
                {mission.no}
              </span>
              <span>首</span>
            </span>
            <span className="h-px w-6 bg-paper-light/50" />
            <span className="font-[family-name:var(--font-chiron)] text-2xl leading-none font-black [writing-mode:vertical-rl]">
              {luck}
            </span>
          </div>

          <div className="relative min-w-0 flex-1 px-4 pt-6 pb-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-xs font-bold"
                style={{ borderColor: c.color, color: c.deep, background: c.tint }}
              >
                <span aria-hidden>{c.icon}</span>
                {c.label}籤
              </span>
              <span className="text-[11px] text-ink-soft">{LUCK_HINT[luck]}</span>
            </div>
            <h3 className="poster-title mt-2 rotate-0! text-2xl leading-tight">{mission.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{mission.detail}</p>
            <p className="mt-2 rounded-lg border-2 border-dashed border-ink/20 bg-paper/60 px-2.5 py-1.5 text-xs text-ink-soft">
              🧑‍🍳 {mission.tip}
            </p>

            <div className={`mt-3 flex flex-col items-start gap-1.5 ${done ? "pr-20" : ""}`}>
              {!done ? (
                <>
                  <button
                    type="button"
                    onClick={onStamp}
                    className="rounded-full border-2 border-ink px-4 py-2 font-[family-name:var(--font-chiron)] text-base font-black text-paper-light shadow-[0_3px_0_#3e3a35] outline-[1.5px] outline-offset-[-5px] outline-paper-light/70 outline-dashed transition active:translate-y-0.5 active:shadow-[0_1px_0_#3e3a35]"
                    style={{ background: c.deep }}
                  >
                    完成任務・蓋章！
                  </button>
                  <button
                    type="button"
                    onClick={onRedraw}
                    disabled={redrawsLeft <= 0}
                    className="text-xs text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick disabled:no-underline disabled:opacity-50"
                  >
                    {redrawsLeft > 0 ? `換一支籤（還能換 ${redrawsLeft} 次）` : "今天已經換過籤囉"}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display text-base whitespace-nowrap" style={{ color: c.deep }}>
                    任務達成！✓
                  </p>
                  <button
                    type="button"
                    onClick={onUnstamp}
                    className="text-xs text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick"
                  >
                    取消蓋章
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className="pointer-events-none absolute -right-2 -bottom-3">
          <StationStamp
            category={mission.category}
            date={today}
            size={100}
            rotate={-14}
            animate={justStamped}
            className="h-auto w-24"
          />
        </div>
      )}
    </div>
  );
}
