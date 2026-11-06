import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ParallaxScope, Reveal } from "@/components/Parallax";
import { px } from "@/lib/parallax";

// ─────────────────────────────────────────────
// 首頁的介紹與故事區塊：乘車證（網站介紹）、一日時刻表、列車小故事、列車長的話、乘車須知
// ─────────────────────────────────────────────

export function SectionTitle({ en, children, sub }: { en: string; children: ReactNode; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold tracking-[0.35em] text-ink-soft">{en}</p>
      <h2 className="mt-1 font-[family-name:var(--font-chiron)] text-3xl font-black text-brick [text-shadow:2px_2px_0_rgb(62_58_53/0.15)] sm:text-4xl">
        {children}
      </h2>
      {sub && <p className="mt-2 text-sm text-ink-soft sm:text-base">{sub}</p>}
    </div>
  );
}

/** 背景小裝飾（從 background.png 上半部去背）：位置、大小、捲動速度各不同，形成多層視差 */
const SKY_DECOR: { src: string; w: number; h: number; cls: string; k: number; kx?: number; kr?: number }[] = [
  { src: "/images/landing/deco-cloud-c.png", w: 360, h: 139, cls: "top-[46%] -left-10 w-48 opacity-90 sm:w-64", k: -380, kx: 60 },
  { src: "/images/landing/deco-cloud-a.png", w: 289, h: 81, cls: "top-[9%] left-[30%] w-40 sm:w-56", k: -300, kx: -80 },
  { src: "/images/landing/deco-cloud-a.png", w: 289, h: 81, cls: "right-[6%] bottom-[10%] w-36 -scale-x-100 opacity-80 sm:w-48", k: -220, kx: 90 },
  { src: "/images/landing/deco-stamp.png", w: 251, h: 164, cls: "top-6 left-3 w-28 sm:top-10 sm:left-8 sm:w-40", k: 140, kr: 10 },
  { src: "/images/landing/deco-leaves.png", w: 498, h: 315, cls: "-top-2 -right-6 w-56 sm:w-80 lg:w-[26rem]", k: 220, kr: -6 },
];

/**
 * 滿版風景背景區塊（reference-design/background.png）：
 * - focus="top"：用圖片上半部的天空紙紋當底，郵票、雲朵、葉子拆成獨立圖層，各自用不同速度移動。
 * - focus="bottom"：用整張圖的下半部（山景、月台小火車），底圖移動得比內容慢。
 * 上下緣淡出接回紙張底色。
 */
function ScenicSection({
  ariaLabel,
  focus = "bottom",
  children,
}: {
  ariaLabel: string;
  focus?: "top" | "bottom";
  children: ReactNode;
}) {
  const top = focus === "top";
  return (
    <ParallaxScope as="section" ariaLabel={ariaLabel} className="relative mt-16 overflow-hidden py-24 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
        aria-hidden
      >
        {/* 底圖：比區塊高，往反方向慢慢移動 */}
        <div className="px absolute inset-x-0 -top-[24%] -bottom-[24%]" style={px(top ? -110 : -200)}>
          <Image
            src={top ? "/images/landing/scenic-paper.jpg" : "/images/landing/scenic-bg.jpg"}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover ${top ? "" : "object-[82%_100%] sm:object-bottom"}`}
          />
        </div>
        {/* 上半部的獨立小圖層 */}
        {top &&
          SKY_DECOR.map((d, i) => (
            <div key={i} className={`px absolute ${d.cls}`} style={px(d.k, d.kx, d.kr)}>
              <Image src={d.src} alt="" width={d.w} height={d.h} className="h-auto w-full" />
            </div>
          ))}
        {/* 淡淡的紙色罩，讓前景卡片更好讀 */}
        <div className="absolute inset-0 bg-paper-light/20" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </ParallaxScope>
  );
}

// ─── 這是一班什麼樣的列車？（乘車證造型） ─────

const PROMISES = [
  { icon: "/images/landing/expr-energetic-v3.png", w: 102, h: 104, bg: "#fbe0cf", title: "不用註冊，打開就上車", text: "沒有帳號密碼，也不用下載 App，點開網頁就能用。" },
  { icon: "/images/landing/expr-satisfied.png", w: 91, h: 84, bg: "#d4ece6", title: "資料只留在你的裝置", text: "身體資料、轉盤選項、集章紀錄都存在你自己的瀏覽器，不會上傳。" },
  { icon: "/images/landing/expr-yummy.png", w: 89, h: 93, bg: "#e3efd3", title: "依國健署建議設計", text: "份量換算參考國健署「每日飲食指南」與「211 餐盤」，簡單好懂。" },
];

export function AboutTrain() {
  return (
    <ScenicSection ariaLabel="關於健康列車" focus="top">
      <Reveal>
        <SectionTitle en="ABOUT THIS TRAIN">這是一班什麼樣的列車？</SectionTitle>
      </Reveal>
      <Reveal className="mt-8">
        <div className="relative grid overflow-hidden rounded-2xl border-2 border-ink bg-[#fbf3e2] shadow-[4px_6px_0_rgb(62_58_53/0.16)] lg:grid-cols-[1fr_17rem]">
          {/* 車票本體 */}
          <div className="relative px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-xs font-bold tracking-[0.3em] text-ink-soft">健康列車・乘車證</p>
            <p className="mt-3 font-[family-name:var(--font-chiron)] text-2xl leading-snug font-black text-ink sm:text-3xl">
              把「吃得健康」，
              <br className="sm:hidden" />
              變成每天都想搭的一班車。
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink">
              健康列車是一個給忙碌上班族、學生和每個「不知道中午吃什麼」的人的小網站。我們不談嚴格的菜單，也不算到小數點，而是用三個輕鬆的小工具，陪你算出份量、選好午餐、完成一個個小任務。每天搭一小段，慢慢就會到站。
            </p>
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {PROMISES.map((p) => (
                <li key={p.title} className="flex gap-3 rounded-xl border-2 border-dashed border-ink/20 bg-[#fffaf0] p-3 md:flex-col md:items-center md:px-4 md:pt-4 md:text-center">
                  {/* 小主廚表情：元氣／滿足／好吃（取自吉祥物設定圖的表情參考） */}
                  <span
                    className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-end justify-center overflow-hidden rounded-full border-2 border-ink md:h-20 md:w-20"
                    style={{ background: p.bg }}
                  >
                    <Image src={p.icon} alt="" width={p.w} height={p.h} className="h-[85%] w-auto max-w-none" />
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{p.title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* 票根：虛線撕開線＋起訖站 */}
          <div className="relative border-t-2 border-dashed border-ink/30 bg-mustard/15 px-5 py-6 lg:border-t-0 lg:border-l-2">
            <span className="absolute -top-3 -left-3 hidden h-6 w-6 rounded-full border-2 border-ink bg-background lg:block" aria-hidden />
            <span className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full border-2 border-ink bg-background lg:block" aria-hidden />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm lg:grid-cols-1">
              {[
                ["起站", "今天的你"],
                ["終點", "更好的日常"],
                ["票種", "全票・免費"],
                ["車次", "每日準時發車"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold tracking-[0.25em] text-ink-soft">{k}</dt>
                  <dd className="font-[family-name:var(--font-chiron)] text-lg font-black text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <Image
              src="/images/stamps/postmark.png"
              alt=""
              width={128}
              height={86}
              className="px absolute right-3 bottom-3 hidden h-14 w-auto -rotate-12 opacity-80 lg:block"
              style={px(30)}
            />
          </div>
        </div>
      </Reveal>
    </ScenicSection>
  );
}

// ─── 一日時刻表 ───────────────────────────────

const TIMETABLE = [
  { time: "07:30", train: "早安號", station: "每日任務籤", href: "/stamps", color: "#2c8f86", note: "起床先抽三支籤，看看今天的小任務" },
  { time: "11:30", train: "午餐號", station: "午餐大轉盤", href: "/lunch", color: "#e76b3c", note: "不知道吃什麼？轉一下就出發" },
  { time: "12:00", train: "均衡號", station: "營養計算", href: "/nutrition", color: "#6ba367", note: "用 211 餐盤配一份剛剛好的午餐" },
  { time: "21:00", train: "晚安號", station: "每日任務籤", href: "/stamps", color: "#2c8f86", note: "回顧今天，完成的任務蓋上紀念章" },
];

export function Timetable() {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="timetable-title">
      <Reveal>
        <SectionTitle en="TIMETABLE" sub="不知道從哪裡開始？照著時刻表搭一天看看">
          <span id="timetable-title">健康列車時刻表</span>
        </SectionTitle>
      </Reveal>
      <Reveal className="mx-auto mt-8 max-w-4xl">
        <div className="overflow-hidden rounded-2xl border-2 border-ink bg-[#fffdf7] shadow-[4px_6px_0_rgb(62_58_53/0.16)]">
          <div className="hidden grid-cols-[6rem_7rem_9rem_1fr] gap-3 border-b-2 border-ink bg-ink px-5 py-2.5 text-sm font-bold tracking-[0.2em] text-paper-light sm:grid">
            <span>時間</span>
            <span>車次</span>
            <span>停靠站</span>
            <span>小提醒</span>
          </div>
          <ol className="divide-y-2 divide-dashed divide-ink/15">
            {TIMETABLE.map((r) => (
              <li key={r.time + r.train}>
                <Link
                  href={r.href}
                  className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-3 gap-y-1 px-4 py-3.5 transition hover:bg-mustard/15 sm:grid-cols-[6rem_7rem_9rem_1fr] sm:px-5"
                >
                  <span className="row-span-2 font-[family-name:var(--font-chiron)] text-2xl font-black text-brick tabular-nums sm:row-span-1">{r.time}</span>
                  <span className="flex items-center gap-2 font-bold text-ink">
                    {r.train}
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white sm:hidden" style={{ background: r.color }}>
                      {r.station}
                    </span>
                  </span>
                  <span className="hidden sm:block">
                    <span className="rounded-full px-2.5 py-1 text-sm font-bold text-white" style={{ background: r.color }}>
                      {r.station}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2 text-sm text-ink-soft">
                    {r.note}
                    <span className="hidden shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-brick sm:inline" aria-hidden>
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-3 text-center text-xs text-ink-soft">＊時刻僅供參考，健康列車全天候營運，隨時都能上車。</p>
      </Reveal>
    </section>
  );
}

// ─── 列車小故事 ───────────────────────────────

/** 每一幕的插畫（reference-design/列車故事.png 裁成三張，約 690×237） */
const CHAPTERS: { no: string; title: string; img: string; alt: string; text: string }[] = [
  {
    no: "第一幕",
    title: "車站旁的小便當店",
    img: "/images/landing/story-1.png",
    alt: "秋天的車站旁，小便當店桌上放著一個滷肉便當",
    text: "小主廚原本在老車站旁邊開便當店。每天中午，旅客匆匆買了便當就跳上車，常常一邊吃一邊嘆氣：「今天又吃太多了」、「到底該吃多少才剛好？」",
  },
  {
    no: "第二幕",
    title: "一節會發車的廚房",
    img: "/images/landing/story-2.png",
    alt: "計算筆記、午餐轉盤和任務籤筒擺在一起",
    text: "小主廚想了好久，決定把便當店改裝成一節車廂。他在車上放了一本計算筆記、一座會發光的午餐轉盤，還有三個裝滿任務籤的竹筒。",
  },
  {
    no: "第三幕",
    title: "下一站，是你",
    img: "/images/landing/story-3.png",
    alt: "月光下，紅白色的列車沿著山間鐵道駛來",
    text: "就這樣，健康列車開始每天準時發車。小主廚兼任列車長，載著大家一站一站往前開：不用一次改變全部，只要今天比昨天多一點點就好。",
  },
];

export function TrainStory() {
  return (
    <ScenicSection ariaLabel="列車小故事">
      <Reveal>
        <SectionTitle en="OUR STORY" sub="關於這班列車，是怎麼開出來的">
          列車小故事
        </SectionTitle>
      </Reveal>
      <ol className="mt-10 grid gap-6 lg:grid-cols-3">
        {CHAPTERS.map((c, i) => (
          <li key={c.no} className="px-lg" style={px(40)}>
            <Reveal delay={i * 150} className="h-full">
              <article className="relative flex h-full flex-col rounded-2xl border-2 border-ink bg-[#fffdf7] p-2 shadow-[4px_6px_0_rgb(62_58_53/0.16)]">
                {/* 插畫 */}
                <div className="relative aspect-[690/237] overflow-hidden rounded-xl border-2 border-ink/15">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 1024px) 340px, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 left-3 rounded-full border-2 border-ink bg-paper-light px-2.5 py-0.5 font-[family-name:var(--font-chiron)] text-xs font-black tracking-[0.2em] text-brick">
                    {c.no}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
                  <h3 className="font-[family-name:var(--font-chiron)] text-xl font-black text-ink">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink">{c.text}</p>
                </div>
                <span className="absolute -top-3 right-6 h-5 w-16 rotate-3 rounded-sm bg-accent/40" aria-hidden />
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </ScenicSection>
  );
}

// ─── 列車長的話＋乘車須知 ─────────────────────

const FAQ = [
  { q: "需要註冊或付費嗎？", a: "不需要。打開網頁就能使用全部功能，也不用下載任何 App。" },
  {
    q: "我的資料會存在哪裡？",
    a: "身體資料、轉盤選項和集章紀錄都只存在你這台裝置的瀏覽器裡，不會上傳到任何伺服器。換一台裝置、使用無痕視窗或清除瀏覽資料時，紀錄就不會跟著過去。",
  },
  {
    q: "營養計算的結果準確嗎？",
    a: "熱量以常用的 Mifflin-St Jeor 公式估算，份量參考國健署「每日飲食指南」與「211 餐盤」，適合當作日常參考。若有特殊健康狀況、懷孕或正在控制疾病，請以醫師或營養師的建議為準。",
  },
  { q: "任務籤抽到不喜歡的可以換嗎？", a: "可以！每個籤筒每天能換一次籤。抽完三支籤後，隔天 0 點會有新的籤進站。" },
  { q: "「我的餐食日記」和「列車使用指南」什麼時候開通？", a: "這兩節車廂正在施工中，完成後會直接出現在上方的選單，敬請期待！" },
];

export function ConductorAndFaq() {
  return (
    <ParallaxScope as="section" ariaLabel="列車長的話與乘車須知" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        {/* 列車長的話：信紙 */}
        <Reveal>
          <SectionTitle en="FROM THE CONDUCTOR">列車長的話</SectionTitle>
          <div className="relative mt-8">
            <div
              className="relative -rotate-1 rounded-xl border-2 border-ink bg-[#fffdf7] px-6 pt-7 pb-8 shadow-[4px_6px_0_rgb(62_58_53/0.16)] sm:px-8"
              style={{
                backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgb(44 143 134 / 0.18) 31px 32px)",
                backgroundPosition: "0 25px",
              }}
            >
              <Image
                src="/images/stamps/postmark.png"
                alt=""
                width={128}
                height={86}
                className="absolute -top-5 right-4 h-16 w-auto rotate-6"
              />
              <div className="text-[15px] leading-[32px] text-ink sm:text-base">
                <p>各位旅客，歡迎搭乘健康列車！</p>
                <p>
                  我是列車長，也是車上的小主廚。以前在便當店，我最常聽到的一句話是「好想吃得健康，但好麻煩」。所以這班車上沒有複雜的規定，只有剛剛好的份量、一點點選擇的樂趣，和每天三個小小的任務。
                </p>
                <p>偶爾錯過一班車也沒關係，下一班很快就來。重要的是，你一直在路上。</p>
                <p>祝您旅途愉快，吃飽、吃好、每天都有好心情！</p>
              </div>
              <p className="mt-8 text-right font-[family-name:var(--font-chiron)] text-lg leading-[32px] font-black text-brick">健康列車 列車長　小主廚 敬上</p>
            </div>
            <Image
              src="/images/mascot.png"
              alt="列車長小主廚"
              width={162}
              height={168}
              className="px absolute -bottom-8 -left-3 h-24 w-auto drop-shadow-[2px_3px_0_rgb(62_58_53/0.15)] sm:-left-6 sm:h-28"
              style={px(40)}
            />
          </div>
        </Reveal>

        {/* 乘車須知：可展開的問答 */}
        <Reveal delay={120}>
          <SectionTitle en="PASSENGER GUIDE">乘車須知</SectionTitle>
          <div className="mt-8 space-y-3">
            {FAQ.map((f, i) => (
              <details
                key={f.q}
                className="group rounded-xl border-2 border-ink bg-[#fffdf7] shadow-[3px_4px_0_rgb(62_58_53/0.12)] open:bg-[#fffaf0]"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sea font-[family-name:var(--font-chiron)] text-sm font-black text-white">
                    Q
                  </span>
                  <span className="flex-1">{f.q}</span>
                  <span className="text-ink-soft transition group-open:rotate-45" aria-hidden>
                    ＋
                  </span>
                </summary>
                <p className="px-4 pb-4 pl-14 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </ParallaxScope>
  );
}
