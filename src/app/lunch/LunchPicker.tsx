"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import NotebookRings from "@/components/NotebookRings";
import {
  GENERIC_MEAL_IMAGE,
  IMAGE_GROUPS,
  QUICK_PRESETS,
  groupOfImage,
  imageChoices,
  newOptionId,
  optionImage,
  randomPresetOptions,
  type ImageGroup,
  type QuickMeal,
  type WheelOption,
} from "@/lib/meals";
import { STORAGE_KEYS, useStoredState, writeStored } from "@/lib/storage";
import LunchStage, { SPIN_MS } from "./LunchStage";

const MAX_OPTIONS = 12;
const MAX_NAME = 12;
const EMPTY: WheelOption[] = [];

function randomInt(max: number) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

export default function LunchPicker() {
  const [options, setOptions] = useStoredState<WheelOption[]>(STORAGE_KEYS.wheelOptions, EMPTY);

  // 每次進到頁面，轉盤先放上隨機 3 個預設選項（在瀏覽器端決定，避免伺服器與瀏覽器的隨機結果不一致）
  useEffect(() => {
    writeStored(STORAGE_KEYS.wheelOptions, randomPresetOptions(3));
  }, []);
  // 使用者儲存到快速加入的選項（目前沒有後端，重新整理就會消失）
  const [saved, setSaved] = useState<QuickMeal[]>([]);
  const [quickTab, setQuickTab] = useState<ImageGroup>("bento");

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelOption | null>(null);
  const pending = useRef<{ option: WheelOption; done: boolean } | null>(null);
  const [trainAtEnd, setTrainAtEnd] = useState(false);

  // 新增表單
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState(GENERIC_MEAL_IMAGE);
  const [group, setGroup] = useState<ImageGroup>("bento");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const full = options.length >= MAX_OPTIONS;
  const canSpin = options.length >= 2 && !spinning;

  function finishSpin() {
    const p = pending.current;
    if (!p || p.done) return;
    p.done = true;
    setSpinning(false);
    setResult(p.option);
  }

  function spin() {
    if (!canSpin) return;
    const n = options.length;
    const idx = randomInt(n);
    const slice = 360 / n;
    // 落點：該格中間附近（避開邊界），指針在正上方
    const jitter = (randomInt(1000) / 1000 - 0.5) * slice * 0.6;
    const target = (idx + 0.5) * slice + jitter;
    const next = rotation + 360 * 6 + mod(-target - rotation, 360);

    pending.current = { option: options[idx], done: false };
    setTrainAtEnd((v) => !v);
    setResult(null);
    setSpinning(true);
    setRotation(next);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 減少動態效果時直接揭曉；另設保險計時，避免 transitionend 沒觸發卡住
    window.setTimeout(finishSpin, reduced ? 50 : SPIN_MS + 400);
  }

  /** 驗證輸入的名稱；失敗時顯示錯誤並回傳 null */
  function validName(): string | null {
    const name = draft.trim();
    if (!name) return fail("請先輸入餐點名稱");
    if ([...name].length > MAX_NAME) return fail(`名稱最多 ${MAX_NAME} 個字`);
    return name;
  }

  function fail(text: string) {
    setMessage({ text, error: true });
    return null;
  }

  function resetForm(text: string) {
    setDraft("");
    setImage(GENERIC_MEAL_IMAGE);
    setGroup("bento");
    setMessage({ text, error: false });
  }

  function addToWheel(name: string, img: string) {
    if (options.some((o) => o.name === name)) return fail(`「${name}」已經在清單裡囉`);
    if (full) return fail(`轉盤最多 ${MAX_OPTIONS} 個選項`);
    setOptions((prev) => [...prev, { id: newOptionId("custom"), name, image: img, source: "custom" }]);
    return true;
  }

  function handleAdd() {
    const name = validName();
    if (name && addToWheel(name, image)) resetForm(`已把「${name}」加入轉盤！`);
  }

  function handleSave() {
    const name = validName();
    if (!name) return;
    if ([...QUICK_PRESETS, ...saved].some((m) => m.name === name)) return fail(`快速加入裡已經有「${name}」囉`);
    const g = groupOfImage(image);
    setSaved((prev) => [...prev, { id: newOptionId("saved"), name, image, group: g, custom: true }]);
    setQuickTab(g);
    resetForm(`已把「${name}」存到快速加入的「${IMAGE_GROUPS.find((x) => x.id === g)!.label}」！`);
  }

  function toggleQuick(m: QuickMeal) {
    const existing = options.find((o) => o.name === m.name);
    if (existing) removeOption(existing.id);
    else addToWheel(m.name, m.image);
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
    setResult((r) => (r?.id === id ? null : r));
  }

  const choices = imageChoices(group);
  const hasDraft = draft.trim().length > 0;
  const quickMeals = [...QUICK_PRESETS, ...saved].filter((m) => m.group === quickTab);

  return (
    <div className="mt-6">
      <h1 className="sr-only">午餐抽籤站：今天中午該吃什麼？</h1>

      <LunchStage
        options={options}
        rotation={rotation}
        spinning={spinning}
        canSpin={canSpin}
        result={result}
        onSpin={spin}
        onSpinEnd={finishSpin}
      />

      {/* 手機版：結果車票在上、按鈕在下（桌機的結果放在場景桌面上） */}
      <div className="mx-auto mt-5 max-w-[520px] lg:hidden">
        <div aria-live="polite">
          {result && !spinning && (
            <div className="mb-5">
              <ResultTicket result={result} />
            </div>
          )}
          {!result && spinning && (
            <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink/30 bg-paper/50 px-4 py-3 text-sm text-ink-soft">
              <Image src="/images/mascot-cheer.png" alt="" width={98} height={103} className="h-9 w-auto shrink-0" />
              小主廚正在幫你選…
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={spin}
          disabled={!canSpin}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink bg-brick py-3 font-[family-name:var(--font-chiron)] text-xl font-black text-paper-light shadow-[0_4px_0_#3e3a35] outline-[1.5px] outline-offset-[-7px] outline-paper-light/70 outline-dashed transition active:translate-y-0.5 active:shadow-[0_2px_0_#3e3a35] disabled:cursor-not-allowed disabled:brightness-90 disabled:saturate-50"
        >
          {spinning ? "轉呀轉…" : result ? "再抽一次 ▶" : "立即轉盤抽便當 ▶"}
        </button>
      </div>

      <RailTrack atEnd={trainAtEnd} moving={spinning} />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* ── 左：新增餐點＋轉盤清單（筆記本） ── */}
        <section className="relative lg:col-span-7" aria-labelledby="list-title">
          <div className="notebook-back" aria-hidden />
          <div className="notebook flex h-full flex-col px-5 pt-12 pb-6 sm:px-6">
            <NotebookRings compact />
            <h2 id="list-title" className="flex items-center gap-2 font-display text-2xl text-brick">
              <span className="text-mustard">★</span>午餐候選清單<span className="text-mustard">★</span>
            </h2>
            <p className="mb-4 text-sm text-ink-soft">從快速加入挑選，或自己輸入想吃的餐點。</p>

            {/* 轉盤清單 */}
            <div className="note-box p-3">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <span className="text-base font-bold tracking-widest text-ink">
                  轉盤上的選項
                  <span className="ml-1.5 text-sm font-normal tracking-normal text-ink-soft">
                    {options.length} / {MAX_OPTIONS}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={spinning || options.length === 0}
                  onClick={() => {
                    setOptions([]);
                    setResult(null);
                  }}
                  className="text-sm text-ink-soft underline decoration-dotted underline-offset-4 hover:text-brick disabled:opacity-50"
                >
                  全部清空
                </button>
              </div>
              {options.length === 0 ? (
                <p className="py-8 text-center text-base text-ink-soft">清單是空的，從快速加入點幾個，或自己輸入吧！</p>
              ) : (
                <ol className="grid gap-2.5 sm:grid-cols-2">
                  {options.map((o, i) => (
                    <li
                      key={o.id}
                      className="flex min-h-16 items-center overflow-hidden rounded-xl border-2 border-ink/70 bg-[#fffaf0] shadow-[2px_3px_0_rgb(62_58_53/0.12)]"
                    >
                      {/* 車票存根 */}
                      <span className="flex w-12 shrink-0 flex-col items-center justify-center gap-0.5 self-stretch border-r-2 border-dashed border-ink/30 bg-mustard/30 font-display leading-none text-ink-soft">
                        <span className="text-[10px]">No.</span>
                        <span className="text-base">{String(i + 1).padStart(2, "0")}</span>
                      </span>
                      <Image
                        src={optionImage(o)}
                        alt=""
                        width={180}
                        height={144}
                        className="ml-2 h-12 w-16 shrink-0 object-contain"
                      />
                      <span className="min-w-0 flex-1 truncate px-2 text-base font-bold text-ink">{o.name}</span>
                      <button
                        type="button"
                        onClick={() => removeOption(o.id)}
                        disabled={spinning}
                        aria-label={`移除 ${o.name}`}
                        className="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-soft hover:bg-brick hover:text-white disabled:opacity-40"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {/* 新增餐點 */}
            <div className="mt-3 note-box p-3">
              <label htmlFor="meal-input" className="mb-1.5 block text-sm font-bold tracking-widest text-ink">
                ① 餐點名稱
              </label>
              <input
                id="meal-input"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setMessage(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="例如：雞肉飯、鍋燒意麵"
                maxLength={MAX_NAME + 4}
                disabled={spinning}
                className="retro-input py-2! text-base! placeholder:text-ink/30"
                aria-invalid={message?.error ?? false}
                aria-describedby="meal-form-msg"
              />

              {hasDraft && (
                <div className="pop-in">
                <div className="mt-3 mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                  <span id="image-label" className="text-sm font-bold tracking-widest whitespace-nowrap text-ink">
                    ② 選一張圖
                  </span>
                  <div role="tablist" aria-label="圖片分類" className="flex gap-1">
                    {IMAGE_GROUPS.map((g) => (
                      <button
                        key={g.id}
                        role="tab"
                        type="button"
                        aria-selected={group === g.id}
                        onClick={() => setGroup(g.id)}
                        className={`rounded-full border-2 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap transition sm:px-3 sm:text-sm ${
                          group === g.id ? "border-ink bg-mustard/40 text-ink" : "border-ink/20 bg-[#fffaf0] text-ink-soft hover:border-ink/50"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  role="radiogroup"
                  aria-labelledby="image-label"
                  className="grid grid-cols-3 gap-2 min-[480px]:grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5"
                >
                  {choices.map((c) => {
                    const active = image === c.src;
                    return (
                      <button
                        key={c.src}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={c.label}
                        title={c.label}
                        onClick={() => setImage(c.src)}
                        className={`relative flex aspect-[5/4] items-center justify-center rounded-lg border-2 p-1.5 transition ${
                          active ? "border-ink bg-mustard/30 shadow-[1px_2px_0_#3e3a35]" : "border-ink/10 bg-[#fffaf0] hover:border-ink/40"
                        }`}
                      >
                        <Image src={c.src} alt="" width={180} height={144} className="max-h-full w-auto object-contain" />
                        {active && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-leaf text-[10px] text-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={spinning || full || !hasDraft}
                  className="rounded-lg border-2 border-ink bg-brick py-2.5 text-sm font-bold whitespace-nowrap text-white min-[360px]:text-base shadow-[2px_3px_0_#3e3a35] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  加入轉盤
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={spinning || !hasDraft}
                  className="rounded-lg border-2 border-ink bg-sea py-2.5 text-sm font-bold whitespace-nowrap text-white min-[360px]:text-base shadow-[2px_3px_0_#3e3a35] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  儲存到快速加入
                </button>
              </div>
              <p
                id="meal-form-msg"
                aria-live="polite"
                className={`mt-1.5 min-h-5 text-sm ${message?.error ? "text-brick" : "text-leaf"}`}
              >
                {message?.text}
              </p>
            </div>

          </div>
        </section>

        {/* ── 右：快速加入（車廂） ── */}
        <section className="lg:col-span-5" aria-labelledby="menu-title">
          <div className="relative flex h-full flex-col overflow-hidden rounded-t-[28px] rounded-b-xl border-2 border-ink bg-paper-light shadow-[4px_5px_0_rgb(62_58_53/0.15)]">
            <div className="flex items-center gap-3 border-b-2 border-ink bg-[#efe3c6] px-5 py-3">
              <Image src="/images/lunch-train.png" alt="" width={107} height={88} className="h-10 w-auto shrink-0" />
              <div className="min-w-0">
                <h2 id="menu-title" className="font-display text-2xl text-brick">快速加入</h2>
                <p className="text-xs text-ink-soft sm:text-sm">點一下加入轉盤，再點一下拿掉</p>
              </div>
            </div>

            <div role="tablist" aria-label="快速加入分類" className="grid grid-cols-4 gap-1.5 px-3 pt-4 sm:gap-2 sm:px-5">
              {IMAGE_GROUPS.map((g) => {
                const active = quickTab === g.id;
                return (
                  <button
                    key={g.id}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setQuickTab(g.id)}
                    className={`rounded-t-xl rounded-b-md border-2 py-2 text-sm font-bold whitespace-nowrap transition sm:text-base ${
                      active
                        ? "border-ink bg-sea-light text-ink shadow-[inset_0_-4px_0_rgb(44_143_134/0.35)]"
                        : "border-ink/30 bg-[#fffaf0] text-ink-soft hover:border-ink/60"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>

            <ul role="tabpanel" className="grid flex-1 grid-cols-2 content-start gap-3 p-3 min-[520px]:grid-cols-3 sm:p-5">
              {quickMeals.map((m) => {
                const selected = options.some((o) => o.name === m.name);
                const disabled = spinning || (!selected && full);
                return (
                  <li key={m.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleQuick(m)}
                      disabled={disabled}
                      aria-pressed={selected}
                      className={`relative flex w-full flex-col items-center rounded-xl border-2 px-2 pt-2.5 pb-2 transition ${
                        selected
                          ? "border-ink bg-mustard/25 shadow-[2px_3px_0_rgb(62_58_53/0.18)]"
                          : "border-ink/15 bg-[#fffaf0] hover:-translate-y-0.5 hover:border-ink/50"
                      } disabled:opacity-40`}
                    >
                      {selected && (
                        <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-leaf text-xs text-white">
                          ✓
                        </span>
                      )}
                      <span className="flex aspect-[5/4] w-full items-center justify-center">
                        <Image src={m.image} alt="" width={240} height={192} className="max-h-full w-auto object-contain" />
                      </span>
                      <span className="mt-1 w-full truncate text-sm font-bold text-ink">{m.name}</span>
                      {m.custom && <span className="text-[10px] text-sea">我的</span>}
                    </button>
                    {m.custom && (
                      <button
                        type="button"
                        onClick={() => setSaved((prev) => prev.filter((x) => x.id !== m.id))}
                        aria-label={`刪除儲存的 ${m.name}`}
                        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper-light text-sm text-ink-soft hover:bg-brick hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* 車身紅色腰帶 */}
            <div className="relative mt-auto h-7 border-t-2 border-ink bg-brick">
              <div className="absolute inset-x-0 top-1.5 h-0.5 bg-paper-light/60" />
            </div>
          </div>
          <div className="flex justify-between px-10" aria-hidden>
            {[0, 1, 2, 3].map((k) => (
              <span key={k} className="-mt-3 h-6 w-6 rounded-full border-2 border-ink bg-[#5a4a3c] shadow-[inset_0_0_0_4px_#8a7a6a]" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/** 抽中結果：車票樣式（手機） */
function ResultTicket({ result }: { result: WheelOption }) {
  return (
    <div className="ticket-drop relative">
      <div className="flex items-stretch overflow-hidden rounded-xl border-2 border-ink bg-[#fbf3e2] shadow-[3px_4px_0_rgb(62_58_53/0.25)]">
        <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 border-r-2 border-dashed border-ink/40 bg-brick text-paper-light">
          <span className="text-[9px] tracking-[0.2em]">TODAY</span>
          <span className="font-[family-name:var(--font-chiron)] text-lg leading-none font-black">午餐</span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-2 pl-3">
          <Image src={optionImage(result)} alt="" width={180} height={150} className="h-16 w-20 shrink-0 object-contain min-[400px]:h-20 min-[400px]:w-24" />
          <div className="min-w-0 flex-1 pr-8">
            <p className="text-xs tracking-[0.2em] text-ink-soft">今天午餐就吃</p>
            <p className="poster-title rotate-0! text-2xl leading-tight break-words">{result.name}</p>
          </div>
        </div>
      </div>
      <Image
        src="/images/mascot-cheer.png"
        alt=""
        width={103}
        height={93}
        className="pointer-events-none absolute -right-2 -bottom-3 h-auto w-14 -rotate-6 drop-shadow-[0_2px_0_rgb(62_58_53/0.25)]"
      />
      <span className="stamp-in absolute -top-3 -right-2 flex h-14 w-14 rotate-12 items-center justify-center rounded-full border-[3px] border-brick bg-[#fbf3e2]/85 font-[family-name:var(--font-chiron)] text-base tracking-widest font-black text-brick shadow-[inset_0_0_0_3px_#fbf3e2,inset_0_0_0_5px_#b5452b]">
        抽中
      </span>
    </div>
  );
}

/** 舞台下方的鐵軌：每次抽籤，小火車就跑到另一端 */
function RailTrack({ atEnd, moving }: { atEnd: boolean; moving: boolean }) {
  return (
    <div className="relative my-8 h-12" aria-hidden>
      <div
        className="absolute inset-x-0 bottom-1 h-4"
        style={{
          backgroundImage:
            "linear-gradient(#3e3a35, #3e3a35), linear-gradient(#3e3a35, #3e3a35), repeating-linear-gradient(90deg, #8a6a4a 0 7px, transparent 7px 24px)",
          backgroundSize: "100% 2px, 100% 2px, 100% 100%",
          backgroundPosition: "0 2px, 0 11px, 0 0",
          backgroundRepeat: "no-repeat, no-repeat, repeat",
        }}
      />
      <Image
        src="/images/lunch-train.png"
        alt=""
        width={107}
        height={88}
        className="absolute bottom-3 h-11 w-auto"
        style={{
          left: atEnd ? "calc(100% - 3.4rem)" : "0",
          transform: atEnd ? "scaleX(-1)" : "scaleX(1)",
          transition: moving ? `left ${SPIN_MS}ms cubic-bezier(0.45, 0, 0.2, 1), transform 0.2s` : "transform 0.2s",
        }}
      />
    </div>
  );
}
