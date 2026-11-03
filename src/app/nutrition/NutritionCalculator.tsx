"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ACTIVITY_LEVELS,
  BMI_LABEL,
  calculateNutrition,
  type BmiCategory,
  type NutritionResult,
  type Sex,
} from "@/lib/nutrition";
import Image from "next/image";
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
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityId, setActivityId] = useState<string | null>(null);
  // 送出前只顯示表單；送出後顯示結果，並可即時調整
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const ageN = parseInRange(age, LIMITS.age);
  const heightN = parseInRange(height, LIMITS.height);
  const weightN = parseInRange(weight, LIMITS.weight);
  const activity = ACTIVITY_LEVELS.find((a) => a.id === activityId);

  const result =
    sex && activity && ageN !== null && heightN !== null && weightN !== null
      ? calculateNutrition({ sex, age: ageN, heightCm: heightN, weightKg: weightN, activityFactor: activity.factor })
      : null;

  useEffect(() => {
    if (submitted) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submitted]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (result) setSubmitted(true);
    else setShowErrors(true);
  }

  return (
    <div
      className={`mt-10 grid gap-8 ${submitted ? "lg:grid-cols-12" : "mx-auto max-w-xl"}`}
    >
      {/* 輸入：筆記本 */}
      <section className={submitted ? "lg:col-span-4" : ""}>
        <form onSubmit={handleSubmit} noValidate className="retro-card relative px-5 pt-8 pb-6 sm:px-6">
          <span className="tape -top-3 left-6 -rotate-6" />
          <Image
            src="/images/mascot.png"
            alt="健康便當小主廚"
            width={174}
            height={174}
            className={`absolute -right-3 drop-shadow-[2px_3px_0_rgb(62_58_53/0.15)] ${
              submitted ? "-top-10 h-24 w-24" : "-top-14 h-32 w-32"
            }`}
          />
          <h2 className="mb-1 flex items-center gap-2 font-display text-2xl text-brick">
            <span className="text-mustard">★</span>旅客資料<span className="text-mustard">★</span>
          </h2>
          <p className="mb-5 text-sm text-ink-soft">
            {submitted ? "改改看，右邊結果會跟著變喔！" : "填好你的資料，小主廚幫你配一份今日菜單。"}
          </p>

          <div className={`space-y-5 ${submitted ? "" : "sm:grid sm:grid-cols-2 sm:gap-x-4 sm:space-y-0 sm:gap-y-5"}`}>
            <Field label="性別" error={showErrors && !sex ? "請選擇性別" : undefined}>
              <div className="grid grid-cols-2 gap-2">
                {(["female", "male"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    aria-pressed={sex === s}
                    className={`rounded-lg border-2 border-ink py-2 text-lg font-bold transition ${
                      sex === s ? "bg-brick text-paper-light shadow-[2px_3px_0_#3e3a35]" : "bg-[#fffaf0] text-ink hover:bg-paper"
                    }`}
                  >
                    {s === "female" ? "女性" : "男性"}
                  </button>
                ))}
              </div>
            </Field>

            <NumberField label="年齡" unit="歲" placeholder="例如 30" value={age} onChange={setAge} limits={LIMITS.age} showErrors={showErrors} />
            <NumberField label="身高" unit="公分" placeholder="例如 160" value={height} onChange={setHeight} limits={LIMITS.height} step="0.1" showErrors={showErrors} />
            <NumberField label="體重" unit="公斤" placeholder="例如 55" value={weight} onChange={setWeight} limits={LIMITS.weight} step="0.1" showErrors={showErrors} />

            <div className={submitted ? "" : "sm:col-span-2"}>
              <Field label="活動量" error={showErrors && !activity ? "請選擇活動量" : undefined}>
                <div className={`grid gap-2 ${submitted ? "" : "sm:grid-cols-2"}`}>
                  {ACTIVITY_LEVELS.map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2 transition ${
                        activityId === a.id ? "border-ink bg-mustard/25" : "border-ink/25 bg-[#fffaf0] hover:border-ink/60"
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
                      <span className="flex-1">
                        <span className="block font-bold">{a.label}</span>
                        <span className="block text-xs text-ink-soft">{a.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {!submitted && (
            <button
              type="submit"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-brick py-3 font-display text-xl text-paper-light shadow-[3px_4px_0_#3e3a35] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_2px_0_#3e3a35]"
            >
              出發！看我的營養建議 →
            </button>
          )}
        </form>
      </section>

      {/* 結果：送出後才顯示 */}
      {submitted && (
        <section ref={resultsRef} className="scroll-mt-24 space-y-8 lg:col-span-8" aria-live="polite">
          {result ? <Results result={result} /> : <EmptyState />}
        </section>
      )}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-bold tracking-widest text-ink-soft">{label}</div>
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
}: {
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
      <div className="mb-1.5 text-sm font-bold tracking-widest text-ink-soft">{label}</div>
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
          className="retro-input pr-14 placeholder:text-ink/30"
          aria-invalid={invalid}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft">{unit}</span>
      </div>
      {invalid && (
        <p className="mt-1 text-sm text-brick">
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
      <p className="text-ink-soft">年齡、身高、體重要填好，結果才會重新出現喔。</p>
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

