import Image from "next/image";
import BrandLogo from "./BrandLogo";

const LINKS = ["關於我們", "站內地圖", "隱私權政策", "使用條款", "聯絡我們"];

const social = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function SiteFooter() {
  return (
    // 滿版頁尾：上緣雙線，右側（桌機）或下方（手機）放山林風景
    <footer className="mt-20 w-full">
      <div className="relative overflow-hidden border-t-2 border-ink bg-paper-light shadow-[0_-3px_0_rgb(62_58_53/0.12)]">
        <div className="relative flex flex-col gap-5 px-5 py-7 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:pr-[380px] xl:px-10 xl:pr-[460px]">
          <BrandLogo className="h-12 w-auto shrink-0 self-start sm:h-14 lg:self-center" />
          <span className="hidden h-10 w-px bg-ink/30 lg:block" />
          {/* 連結頁面尚未建立，先以純文字呈現 */}
          <ul className="flex flex-wrap items-center gap-y-2 text-sm font-medium whitespace-nowrap text-ink">
            {LINKS.map((l, i) => (
              <li key={l} className="flex items-center">
                {i > 0 && <span className="mx-3 h-3.5 w-px bg-ink/40" />}
                <span title="即將開站">{l}</span>
              </li>
            ))}
          </ul>
          <span className="hidden h-10 w-px bg-ink/30 lg:block" />
          <div className="flex items-center gap-3 text-ink">
            <span title="Instagram" aria-label="Instagram">
              <svg {...social}>
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
              </svg>
            </span>
            <span title="YouTube" aria-label="YouTube">
              <svg {...social}>
                <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                <path d="M10 9v6l5-3z" fill="currentColor" />
              </svg>
            </span>
            <span title="Facebook" aria-label="Facebook">
              <svg {...social}>
                <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
                <path d="M15 8h-1.5A1.5 1.5 0 0 0 12 9.5V20M10 13h5" />
              </svg>
            </span>
          </div>
        </div>
        <FooterScenery />
        <p className="relative border-t border-dashed border-ink/25 px-5 py-3 text-xs text-ink-soft sm:px-6 xl:px-10">
          © 2026 健康列車 Healthy Train・計算結果僅供參考，特殊健康狀況請諮詢醫師或營養師。
        </p>
      </div>
    </footer>
  );
}

/** 頁尾右側的山林風景（取自 UI 設定圖 v2） */
function FooterScenery() {
  return (
    <div className="pointer-events-none relative h-24 w-full overflow-hidden sm:h-28 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-[360px] xl:w-[440px]">
      <Image
        src="/images/footer-scenery.png"
        alt=""
        fill
        sizes="(min-width: 1280px) 440px, (min-width: 1024px) 360px, 100vw"
        className="object-cover object-right [mask-image:linear-gradient(to_right,transparent,black_35%)] lg:object-center"
      />
    </div>
  );
}
