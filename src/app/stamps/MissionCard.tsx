import Image from "next/image";
import type { ReactNode } from "react";
import {
  LUCK_HINT,
  MAX_REDRAWS,
  MISSION_CATEGORIES,
  luckOf,
  missionsOf,
  type Draw,
  type Mission,
  type MissionCategory,
} from "@/lib/missions";
import StationStamp from "./StationStamp";

/**
 * 任務卡（照任務籤 UI）：圖釘＋類別色帶標頭＋紙卡本體。
 * 本體依狀態顯示「籤筒（還沒抽）」或「籤詩（已抽）」。
 */
export default function MissionCard({
  category,
  children,
}: {
  category: MissionCategory;
  children: ReactNode;
}) {
  const c = MISSION_CATEGORIES[category];
  return (
    <article
      className="relative flex flex-col pt-4"
      aria-label={`${c.label}籤筒`}
    >
      <Pin />
      <div className="stamp-outline flex flex-1 flex-col">
        <div className="stamp-paper flex flex-1 flex-col bg-[#fbf3e2] pt-2 pb-3">
          {/* 色帶標頭 */}
          <div
            className="relative mx-2 mt-3 flex items-center justify-between gap-2 px-3 py-2 text-paper-light"
            style={{ background: c.deep }}
          >
            <span className="flex items-center gap-1.5">
              <Image
                src={c.iconImg}
                alt=""
                width={68}
                height={66}
                className="h-7 w-auto drop-shadow-[0_1px_0_rgb(0_0_0/0.25)]"
              />
              <span className="font-[family-name:var(--font-chiron)] text-xl font-black tracking-wide">
                {c.label}籤
              </span>
            </span>
            <span className="text-[11px] tracking-[0.12em] whitespace-nowrap opacity-90 sm:text-xs">
              {c.station}・{c.en}
            </span>
          </div>
          <div className="flex flex-1 flex-col px-3 pt-4 pb-2">{children}</div>
        </div>
      </div>
    </article>
  );
}

/** 黃銅圖釘 */
function Pin() {
  return (
    <svg
      viewBox="0 0 40 46"
      className="absolute top-0 left-1/2 z-10 h-10 w-auto -translate-x-1/2 rotate-[24deg]"
      aria-hidden
    >
      <rect
        x="11"
        y="2"
        width="18"
        height="40"
        rx="9"
        fill="#c9965c"
        stroke="#3e3a35"
        strokeWidth="2.5"
      />
      <rect
        x="15"
        y="10"
        width="5"
        height="26"
        rx="2.5"
        fill="#e8c38f"
        opacity="0.8"
      />
      <circle
        cx="20"
        cy="11"
        r="4.2"
        fill="#fbf3e2"
        stroke="#3e3a35"
        strokeWidth="2"
      />
      <circle cx="20" cy="34" r="2.6" fill="#7a5a3a" />
    </svg>
  );
}

/** 還沒抽：籤筒＋搖籤按鈕；抽籤中會搖晃並彈出一支籤 */
export function CylinderBody({
  category,
  phase,
  disabled,
  onDraw,
}: {
  category: MissionCategory;
  phase: "idle" | "shake" | "pop";
  disabled: boolean;
  onDraw: () => void;
}) {
  const c = MISSION_CATEGORIES[category];
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <button
        type="button"
        onClick={onDraw}
        disabled={disabled}
        aria-label={`搖${c.label}籤筒`}
        className="relative mt-10 w-28 transition hover:-translate-y-1 disabled:hover:translate-y-0 sm:w-32"
      >
        {phase === "pop" && (
          <Image
            src={c.stick}
            alt=""
            width={62}
            height={209}
            className="stick-pop absolute -top-16 left-1/2 z-10 h-auto w-11 -translate-x-1/2 drop-shadow-[0_3px_2px_rgb(62_58_53/0.3)]"
          />
        )}
        <Image
          src={c.cylinder}
          alt=""
          width={208}
          height={389}
          className={`h-auto w-full ${phase === "shake" ? "cylinder-shake" : ""}`}
          style={{ transformOrigin: "50% 95%" }}
        />
      </button>
      <button
        type="button"
        onClick={onDraw}
        disabled={disabled}
        className="mt-4 rounded-full border-2 border-ink px-5 py-2 font-[family-name:var(--font-chiron)] text-base font-black text-paper-light shadow-[0_3px_0_#3e3a35] outline-[1.5px] outline-offset-[-5px] outline-paper-light/70 outline-dashed transition active:translate-y-0.5 active:shadow-[0_1px_0_#3e3a35] disabled:opacity-60"
        style={{ background: c.deep }}
      >
        {phase !== "idle" ? "搖呀搖…" : "搖一搖・抽籤 ▶"}
      </button>
      <p className="mt-2 text-[11px] text-ink-soft">
        籤筒裡有 {missionsOf(category).length} 支籤
      </p>
    </div>
  );
}

/** 已抽：籤詩內容（第 n 首＋籤等、任務、提示、狀態與紀念章） */
export function SlipBody({
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
    <div className="slip-unfold flex flex-1 flex-col">
      <div className="flex gap-3">
        {/* 左側直書籤條：第 n 首／籤等，下緣燕尾 */}
        <div
          className="flex w-11 shrink-0 flex-col items-center gap-1.5 pt-2 pb-5 text-paper-light"
          style={{
            background: luck === "凶" ? "#3e3a35" : c.deep,
            clipPath:
              "polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 10px), 0 100%)",
          }}
        >
          <span className="flex flex-col items-center text-xs leading-tight font-bold">
            <span>第</span>
            <span className="my-0.5 font-[family-name:var(--font-chiron)] text-xl leading-none font-black tabular-nums">
              {mission.no}
            </span>
            <span>首</span>
          </span>
          <span className="h-px w-6 bg-paper-light/60" />
          <span className="font-[family-name:var(--font-chiron)] text-2xl leading-[1.05] font-black [writing-mode:vertical-rl]">
            {luck}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="font-[family-name:var(--font-chiron)] text-[1.45rem] leading-tight font-black"
            style={{ color: c.deep }}
          >
            {mission.title}
          </h3>
          <p className="mt-1 font-[family-name:var(--font-chiron)] text-sm font-bold tracking-wide text-ink-soft">
            {LUCK_HINT[luck]}
          </p>
          <p className="mt-2 font-[family-name:var(--font-chiron)] text-base leading-relaxed font-medium text-ink">
            {mission.detail}
          </p>
          {/* 小主廚的叮嚀 */}
          <div className="mt-3 flex items-end gap-1">
            <Image
              src="/images/mascot-face-happy.png"
              alt=""
              width={69}
              height={64}
              className="mb-0.5 h-12 w-auto shrink-0 drop-shadow-[0_1px_0_rgb(62_58_53/0.2)]"
            />
            <SpeechBubble className="flex-1">
              <p
                className="font-[family-name:var(--font-chiron)] text-xs font-bold tracking-widest"
                style={{ color: c.deep }}
              >
                小主廚的叮嚀
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-chiron)] text-[0.95rem] leading-snug font-medium text-ink">
                {mission.tip}
              </p>
            </SpeechBubble>
          </div>
        </div>
      </div>

      {/* 狀態列：紀念章直接蓋在籤詩右下角，壓到叮嚀上 */}
      <div
        className={`relative mt-auto flex min-h-[5.75rem] items-end pt-3 ${done ? "pr-28" : ""}`}
      >
        <div
          className={`flex flex-col gap-1.5 ${done ? "items-start" : "w-full items-center"}`}
        >
          {done ? (
            <>
              <p
                className="flex items-center gap-1.5 font-[family-name:var(--font-chiron)] text-xl font-black"
                style={{ color: c.deep }}
              >
                <span aria-hidden>✔</span>任務達成！
              </p>
              <button
                type="button"
                onClick={onUnstamp}
                className="text-sm text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick"
              >
                取消蓋章
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStamp}
                className="w-full rounded-full border-2 border-ink px-5 py-3 font-[family-name:var(--font-chiron)] text-xl font-black whitespace-nowrap text-paper-light shadow-[0_4px_0_#3e3a35] outline-[1.5px] outline-offset-[-6px] outline-paper-light/70 outline-dashed transition hover:brightness-110 active:translate-y-0.5 active:shadow-[0_2px_0_#3e3a35]"
                style={{ background: c.deep }}
              >
                完成任務・蓋章！
              </button>
              <button
                type="button"
                onClick={onRedraw}
                disabled={redrawsLeft <= 0}
                className="text-sm text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick disabled:no-underline disabled:opacity-50"
              >
                {redrawsLeft > 0
                  ? `換一支籤（還能換 ${redrawsLeft} 次）`
                  : "今天已經換過籤囉"}
              </button>
            </>
          )}
        </div>
        {done && (
          <div className="pointer-events-none absolute -right-1 -bottom-1">
            <StationStamp
              category={mission.category}
              date={today}
              size={104}
              rotate={-12}
              waves
              animate={justStamped}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 對話框：一整條 SVG 路徑畫出圓角框與左下角的尾巴，沒有接縫。
 * 用 preserveAspectRatio="none" 撐滿內容，描邊用 vector-effect 保持固定粗細。
 */
function SpeechBubble({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative pl-3 ${className}`}>
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <path
          d="M28 2 H184 Q198 2 198 16 V84 Q198 98 184 98 H32 Q16 98 13 90 L1 96 L8 80 Q12 74 12 66 V16 Q12 2 28 2 Z"
          fill="#fffaf0"
          stroke="#3e3a35"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative py-2.5 pr-3 pl-3">{children}</div>
    </div>
  );
}
