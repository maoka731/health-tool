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
    <footer className="mx-auto mt-16 w-full max-w-6xl px-4 pb-4 sm:px-6">
      <div className="relative overflow-hidden rounded-xl border-2 border-ink bg-paper-light shadow-[3px_4px_0_rgb(62_58_53/0.15)]">
        <div className="relative flex flex-col gap-5 px-5 py-6 xl:flex-row xl:items-center xl:gap-5 xl:pr-[300px]">
          <BrandLogo height={52} />
          <span className="hidden h-10 w-px bg-ink/30 xl:block" />
          {/* 連結頁面尚未建立，先以純文字呈現 */}
          <ul className="flex flex-wrap items-center gap-y-2 text-sm font-medium whitespace-nowrap text-ink xl:flex-nowrap">
            {LINKS.map((l, i) => (
              <li key={l} className="flex items-center">
                {i > 0 && <span className="mx-3 h-3.5 w-px bg-ink/40" />}
                <span title="即將開站">{l}</span>
              </li>
            ))}
          </ul>
          <span className="hidden h-10 w-px bg-ink/30 xl:block" />
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
        <p className="relative border-t border-dashed border-ink/25 px-5 py-2.5 text-xs text-ink-soft">
          © 2026 健康便當列車・計算結果僅供參考，特殊健康狀況請諮詢醫師或營養師。
        </p>
      </div>
    </footer>
  );
}

/** 頁尾右側的山海鐵道風景（取自 UI 設定圖） */
function FooterScenery() {
  return (
    <div className="pointer-events-none relative h-[78px] w-full overflow-hidden xl:absolute xl:top-0 xl:right-0 xl:h-full xl:w-[320px]">
      <Image
        src="/images/footer-train.jpg"
        alt=""
        fill
        sizes="(min-width: 1280px) 320px, 100vw"
        className="object-cover object-right [mask-image:linear-gradient(to_right,transparent,black_35%)] xl:object-center"
      />
    </div>
  );
}
