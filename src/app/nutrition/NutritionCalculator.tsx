"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ACTIVITY_LEVELS,
  BMI_LABEL,
  calculateNutrition,
  type BmiCategory,
  type NutritionResult,
  type Sex,
} from "@/lib/nutrition";
import Image from "next/image";
import type { HealthProfile } from "@/lib/meals";
import { STORAGE_KEYS, writeStored } from "@/lib/storage";
import { NUTRITION_HANDOFF_KEY } from "@/lib/nutritionHandoff";
import NotebookRings from "@/components/NotebookRings";
import Plate211 from "./Plate211";

const LIMITS = {
  age: { min: 18, max: 100 },
  height: { min: 100, max: 230 },
  weight: { min: 30, max: 250 },
};

function parseInRange(value: string, { min, max }: { min: number; max: number }) {
  const n = Number(value);
  if (value.trim() === "" || !Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

const fmt = (n: number, digits = 0) =>
  n.toLocaleString("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export default function NutritionCalculator() {
  // 進入頁面即顯示「左：旅客資料／右：結果」雙欄，欄位預設全空
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityId, setActivityId] = useState<string | null>(null);

  const ageN = parseInRange(age, LIMITS.age);
  const heightN = parseInRange(height, LIMITS.height);
  const weightN = parseInRange(weight, LIMITS.weight);
  const activity = ACTIVITY_LEVELS.find((a) => a.id === activityId);

  const result =
    sex && activity && ageN !== null && heightN !== null && weightN !== null
      ? calculateNutrition({ sex, age: ageN, heightCm: heightN, weightKg: weightN, activityFactor: activity.factor })
      : null;

  // 從首頁快捷計算機過來時，自動帶入剛填的資料（只帶一次）
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(NUTRITION_HANDOFF_KEY);
      window.sessionStorage.removeItem(NUTRITION_HANDOFF_KEY);
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as HealthProfile;
      /* eslint-disable react-hooks/set-state-in-effect -- 只在掛載時從 sessionStorage 帶入一次 */
      setSex(p.sex);
      setAge(String(p.age));
      setHeight(String(p.heightCm));
      setWeight(String(p.weightKg));
      setActivityId(p.activityId);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // 資料格式不對就忽略
    }
  }, []);

  // 資料完整時把身體資料存在本機，之後午餐推薦等功能會讀取
  useEffect(() => {
    if (!sex || !activityId || ageN === null || heightN === null || weightN === null) return;
    const profile: HealthProfile = {
      sex,
      age: ageN,
      heightCm: heightN,
      weightKg: weightN,
      activityId,
      updatedAt: new Date().toISOString(),
    };
    writeStored(STORAGE_KEYS.healthProfile, profile);
  }, [sex, activityId, ageN, heightN, weightN]);

  return (
    <div className="mt-16 grid gap-8 lg:grid-cols-12">
      {/* 輸入：筆記本 */}
      <section className="relative lg:col-span-4">
        <div className="notebook-back" aria-hidden />
        <form
          onSubmit={(e: FormEvent) => e.preventDefault()}
          noValidate
          className="notebook flex flex-col px-5 pt-12 pb-6 sm:px-7 lg:h-full lg:px-5"
        >
          <NotebookRings compact />
          <Image
            src="/images/mascot.png"
            alt="健康便當小主廚"
            width={174}
            height={174}
            className="absolute -top-12 -right-4 z-10 h-24 w-24 drop-shadow-[2px_3px_0_rgb(62_58_53/0.15)]"
          />
          <h2 className="mb-1 flex items-center gap-2 font-display text-2xl text-brick">
            <span className="text-mustard">★</span>旅客資料<span className="text-mustard">★</span>
          </h2>

          <div className="note-box mt-3 grid grid-cols-2 gap-x-3 gap-y-3 p-3 md:grid-cols-4 lg:grid-cols-2">
            <Field icon={<PersonIcon />} label="性別">
              <SexToggle value={sex} onChange={setSex} compact />
            </Field>
            <NumberField compact icon={<CakeIcon />} label="年齡" unit="歲" value={age} onChange={setAge} limits={LIMITS.age} showErrors={false} />
            <NumberField compact icon={<RulerIcon />} label="身高" unit="公分" value={height} onChange={setHeight} limits={LIMITS.height} step="0.1" showErrors={false} />
            <NumberField compact icon={<ScaleIcon />} label="體重" unit="公斤" value={weight} onChange={setWeight} limits={LIMITS.weight} step="0.1" showErrors={false} />
          </div>

          <div className="note-box mt-3 p-3 lg:flex lg:flex-1 lg:flex-col">
            <FieldLabel icon={<RunIcon />} label="活動量" />
            <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:flex-1 lg:auto-rows-fr lg:grid-cols-1 lg:gap-2">
              {ACTIVITY_LEVELS.map((a) => (
                <label
                  key={a.id}
                  title={a.hint}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-2.5 py-1.5 text-sm transition ${
                    activityId === a.id ? "border-ink bg-mustard/25" : "border-ink/20 bg-[#fffaf0] hover:border-ink/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="activity"
                    value={a.id}
                    checked={activityId === a.id}
                    onChange={() => setActivityId(a.id)}
                    className="accent-brick"
                  />
                  <span className="font-bold">{a.label}</span>
                  <span className="ml-auto truncate text-xs text-ink-soft">{a.short}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-mustard/20 px-3 py-2 text-sm text-ink">
            <Image src="/images/mascot-face-happy.png" alt="" width={76} height={64} className="h-8 w-auto shrink-0" />
            改改看數字，結果會即時更新喔！
          </div>
        </form>
      </section>

      {/* 結果：資料填齊前顯示「準備中」 */}
      <section className="space-y-8 lg:col-span-8" aria-live="polite">
        {result ? <Results result={result} /> : <EmptyState />}
      </section>
    </div>
  );
}

function SexToggle({
  value,
  onChange,
  compact = false,
}: {
  value: Sex | null;
  onChange: (s: Sex) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid grid-cols-2 ${compact ? "gap-1" : "gap-2"}`}>
      {(["female", "male"] as const).map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-pressed={value === s}
          className={`rounded-lg border-2 border-ink font-bold transition ${compact ? "py-1.5 text-base" : "py-2 text-lg"} ${
            value === s ? "bg-brick text-paper-light shadow-[2px_3px_0_#3e3a35]" : "bg-[#fffaf0] text-ink hover:bg-paper"
          }`}
        >
          {s === "female" ? "女" : "男"}
          {!compact && "性"}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold tracking-widest text-ink">
      {icon}
      {label}
    </div>
  );
}

function Field({
  icon,
  label,
  error,
  children,
}: {
  icon?: ReactNode;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <FieldLabel icon={icon} label={label} />
      {children}
      {error && <p className="mt-1 text-sm text-brick">{error}</p>}
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  limits,
  step = "1",
  placeholder,
  showErrors,
  icon,
  compact = false,
}: {
  compact?: boolean;
  icon?: ReactNode;
  label: string;
  unit: string;
  placeholder?: string;
  showErrors: boolean;
  value: string;
  onChange: (v: string) => void;
  limits: { min: number; max: number };
  step?: string;
}) {
  const empty = value.trim() === "";
  const invalid = (!empty || showErrors) && parseInRange(value, limits) === null;
  return (
    <label className="block">
      <FieldLabel icon={icon} label={label} />
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={limits.min}
          max={limits.max}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`retro-input placeholder:text-ink/30 ${compact ? "py-1.5! pr-10 text-base!" : "pr-14"}`}
          aria-invalid={invalid}
        />
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-soft ${compact ? "right-2 text-xs" : "right-3"}`}
        >
          {unit}
        </span>
      </div>
      {invalid && (
        <p className={`mt-1 text-brick ${compact ? "text-xs" : "text-sm"}`}>
          {empty ? `請填寫${label}` : `請輸入 ${limits.min}–${limits.max} ${unit}`}
        </p>
      )}
    </label>
  );
}

function EmptyState() {
  return (
    <div className="retro-card flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
      <Image src="/images/mascot-face-thinking.png" alt="" width={70} height={60} />
      <p className="font-display text-xl text-brick">列車準備中…</p>
      <p className="text-ink-soft">填好左邊的性別、年齡、身高、體重和活動量，小主廚就幫你算出今日營養建議。</p>
    </div>
  );
}

const BMI_FACE: Record<BmiCategory, string> = {
  underweight: "/images/mascot-face-surprised.png",
  normal: "/images/mascot-face-happy.png",
  overweight: "/images/mascot-face-thinking.png",
  obese: "/images/mascot-face-thinking.png",
};

const BMI_COLOR: Record<BmiCategory, string> = {
  underweight: "#2c8f86",
  normal: "#6ba367",
  overweight: "#f7b744",
  obese: "#e76b3c",
};

function Results({ result }: { result: NutritionResult }) {
  const { bmi, bmiCategory, healthyWeight, bmr, tdee } = result;
  // BMI 刻度條：顯示 14–34
  const pos = Math.min(100, Math.max(0, ((bmi - 14) / 20) * 100));

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {/* BMI 車票 */}
        <div className="ticket px-7 py-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold tracking-[0.3em] text-ink-soft">BMI</span>
            <span
              className="rounded-full px-3 py-0.5 text-sm font-bold text-paper-light"
              style={{ backgroundColor: BMI_COLOR[bmiCategory] }}
            >
              {BMI_LABEL[bmiCategory]}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-display text-5xl text-ink">{fmt(bmi, 1)}</span>
            <Image src={BMI_FACE[bmiCategory]} alt="" width={64} height={56} className="h-14 w-auto" />
          </div>
          <div className="relative mt-4 h-3 overflow-hidden rounded-full border-2 border-ink">
            <div className="flex h-full">
              <span className="bg-sea" style={{ width: "22.5%" }} />
              <span className="bg-leaf" style={{ width: "27.5%" }} />
              <span className="bg-mustard" style={{ width: "15%" }} />
              <span className="flex-1 bg-accent" />
            </div>
          </div>
          <div className="relative h-4">
            <span
              className="absolute top-0 -translate-x-1/2 text-xs leading-none text-ink"
              style={{ left: `${pos}%` }}
            >
              ▲
            </span>
          </div>
          <p className="text-sm text-ink-soft">
            健康體重範圍：{fmt(healthyWeight.min, 1)}–{fmt(healthyWeight.max, 1)} 公斤
          </p>
        </div>

        {/* TDEE 車票 */}
        <div className="ticket bg-sea! px-7 py-5 text-paper-light">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold tracking-[0.3em] text-white/85">TDEE</span>
            <span className="text-sm text-white/85">每日總消耗熱量</span>
          </div>
          <div className="mt-1 font-display text-5xl font-bold">
            {fmt(tdee)}
            <span className="ml-2 font-sans text-lg font-normal">大卡</span>
          </div>
          <div className="mt-4 border-t-2 border-dashed border-white/40 pt-3 text-sm text-white/85">
            基礎代謝率 BMR：{fmt(bmr)} 大卡
            <br />
            想維持體重，每天吃到 TDEE 左右即可。
          </div>
        </div>
      </div>

      <Plate211 result={result} />
    </>
  );
}

const icon = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function PersonIcon() {
  return (
    <svg {...icon}>
      <circle cx="12" cy="6" r="3" />
      <path d="M6 21v-5a6 6 0 0 1 12 0v5" />
    </svg>
  );
}

function CakeIcon() {
  return (
    <svg {...icon}>
      <path d="M4 21h16M5 21v-8h14v8M5 16c2 1.5 4.5 1.5 7 0s5-1.5 7 0M12 13V9M12 6.5a1.2 1.2 0 0 1 0-2.5" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg {...icon}>
      <circle cx="8" cy="5" r="2.2" />
      <path d="M5 21v-6l-1-4h8l-1 4v6M17 3v18M15 3h4M15 21h4M17 8h1.5M17 12h1.5M17 16h1.5" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg {...icon}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M8 9a5 5 0 0 1 8 0M12 9l1.5-2.5" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

function RunIcon() {
  return (
    <svg {...icon}>
      <circle cx="14" cy="4.5" r="2" />
      <path d="M7 21l3-6 3 2v4M10 15l1-6 4 3 3 1M11 9L7 10l-2 3" />
    </svg>
  );
}
