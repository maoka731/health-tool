import Image from "next/image";
import type { ReactNode } from "react";

/** 主視覺：左側文字看板＋右側車站插畫 */
export default function StationHero({
  tag,
  title,
  subtitle,
  children,
}: {
  tag?: string;
  title: ReactNode;
  subtitle: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[5px_6px_0_rgb(62_58_53/0.2)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <div className="relative aspect-[842/490] md:order-2 md:aspect-auto md:min-h-[380px]">
        <Image
          src="/images/hero-station.jpg"
          alt="戴著廚師帽的吉祥物在火車站月台，捧著一盒健康便當"
          fill
          priority
          sizes="(min-width: 1152px) 640px, (min-width: 768px) 58vw, 100vw"
          className="object-cover object-[30%_50%]"
        />
      </div>
      <div className="relative flex flex-col justify-center gap-4 px-6 py-8 sm:px-10 md:border-r-2 md:border-ink">
        <span className="tape -top-1 left-8 -rotate-6" />
        {tag && <span className="chip self-start text-sea">{tag}</span>}
        <div className="relative">
          <Sparks />
          <h1 className="poster-title text-[2.3rem] leading-[1.25] whitespace-nowrap sm:text-[2.8rem] md:text-[2rem] lg:text-[2.7rem] xl:text-[3.2rem]">{title}</h1>
        </div>
        <p className="-rotate-1 font-display text-lg leading-relaxed text-ink sm:text-xl">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

/** 標題旁的芥末黃強調線（參考設定圖） */
function Sparks() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="absolute -top-5 -left-6 h-9 w-9 sm:-left-8 sm:h-10 sm:w-10"
      aria-hidden
    >
      <g stroke="#f7b744" strokeWidth="4.5" strokeLinecap="round">
        <path d="M8 22L2 18" />
        <path d="M16 13L13 5" />
        <path d="M27 11L29 3" />
      </g>
    </svg>
  );
}
