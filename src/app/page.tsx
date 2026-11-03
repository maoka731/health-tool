import Image from "next/image";
import Link from "next/link";
import StationHero from "@/components/StationHero";

const ENTRIES = [
  { title: "營養計算", desc: ["算出 BMI、TDEE", "換成幾碗飯、幾顆蛋"], icon: "/images/icon-notebook.png", w: 97, h: 68, href: "/nutrition" },
  { title: "便當食譜", desc: ["簡單好做的", "健康菜單"], icon: "/images/icon-bento.png", w: 93, h: 63 },
  { title: "食材圖鑑", desc: ["認識食材營養", "與黃金搭配"], icon: "/images/icon-crate.png", w: 88, h: 66 },
  { title: "主題特輯", desc: ["依季節・情境", "規劃特色便當"], icon: "/images/icon-flag.png", w: 68, h: 62 },
];

export default function Home() {
  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <StationHero
        title={
          <>
            打造你的
            <br />
            健康便當計畫！
          </>
        }
        subtitle="用均衡營養，吃出更好的日常！"
      >
        <Link
          href="/nutrition"
          className="inline-flex items-center gap-2 self-start rounded-full border-2 border-ink bg-brick px-5 py-2.5 font-bold text-paper-light shadow-[2px_3px_0_#3e3a35] transition hover:-translate-y-0.5"
        >
          ▶ 先算算我該吃多少 →
        </Link>
      </StationHero>

      <section className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {ENTRIES.map((e) => {
          const body = (
            <>
              <Image src={e.icon} alt="" width={e.w} height={e.h} className="h-16 w-auto" />
              <h2 className="mt-3 font-display text-xl text-brick sm:text-2xl">{e.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {e.desc[0]}
                <br />
                {e.desc[1]}
              </p>
              <span
                className={`mt-3 flex h-8 w-8 items-center justify-center self-end rounded-full text-paper-light ${
                  e.href ? "bg-brick" : "bg-ink/30"
                }`}
              >
                →
              </span>
            </>
          );
          const cls = "retro-card group flex flex-col items-center px-4 py-5 text-center";
          return e.href ? (
            <Link key={e.title} href={e.href} className={`${cls} transition-transform hover:-translate-y-1`}>
              {body}
            </Link>
          ) : (
            <div key={e.title} className={`${cls} opacity-70`} title="即將開站">
              {body}
            </div>
          );
        })}
      </section>
    </div>
  );
}
