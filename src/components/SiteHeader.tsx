"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import BrandLogo from "./BrandLogo";
import { CloseIcon, FlagIcon, HeartIcon, HomeIcon, MenuIcon, NoteIcon, SearchIcon } from "./NavIcons";

interface NavItem {
  label: string;
  icon: ReactNode;
  /** 沒有 href 代表頁面尚未上線：反灰，點了會提示「即將上線！」 */
  href?: string;
}

/** 照 UI 設定圖 v2：插畫小圖示 */
const navIcon = (name: string, w: number, h: number) => (
  <Image src={`/images/landing/nav-${name}.png`} alt="" width={w} height={h} className="h-7 w-auto" />
);

const NAV: NavItem[] = [
  { label: "首頁", icon: <HomeIcon />, href: "/" },
  { label: "營養計算", icon: navIcon("nutrition", 43, 50), href: "/nutrition" },
  { label: "午餐大轉盤", icon: navIcon("lunch", 51, 52), href: "/lunch" },
  { label: "每日任務籤", icon: navIcon("stamps", 47, 61), href: "/stamps" },
  { label: "我的餐食日記", icon: <NoteIcon /> },
  { label: "列車使用指南", icon: <FlagIcon /> },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // 置頂導覽列：滿版寬度，捲動後加上陰影
    <header
      className={`sticky top-0 z-40 w-full border-b-2 border-ink bg-paper-light transition-shadow duration-300 ${
        scrolled ? "shadow-[0_6px_20px_-8px_rgb(62_58_53/0.35)]" : "shadow-[0_3px_0_rgb(62_58_53/0.12)]"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 lg:gap-3 lg:px-6 xl:gap-6 xl:px-10">
        <Link href="/" onClick={() => setOpen(false)} className="shrink-0" aria-label="健康列車首頁">
          <BrandLogo className="h-10 w-auto min-[400px]:h-12" />
        </Link>

        {/* 桌機導覽：靠右排 */}
        <nav className="ml-auto hidden items-center justify-end lg:flex xl:gap-1" aria-label="主選單">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={item.href === pathname} />
          ))}
        </nav>

        <span className="hidden h-9 w-px bg-ink/30 lg:block" />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:ml-0">
          <IconButton label="搜尋（即將開放）">
            <SearchIcon />
          </IconButton>
          <IconButton label="收藏（即將開放）">
            <HeartIcon />
          </IconButton>
          <button
            type="button"
            className="rounded-lg p-2 text-ink hover:bg-paper lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "關閉選單" : "開啟選單"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* 手機／平板導覽 */}
      {open && (
        <nav
          id="mobile-nav"
          className="grid grid-cols-1 gap-1 border-t-2 border-dashed border-ink/25 px-3 py-3 min-[460px]:grid-cols-2 sm:px-6 md:grid-cols-3 lg:hidden"
          aria-label="主選單"
        >
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={item.href === pathname} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
      )}
    </header>
  );
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const content = (
    <>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center lg:max-xl:hidden">{item.icon}</span>
      <span>{item.label}</span>
    </>
  );
  const cls =
    "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-base font-bold transition-colors lg:px-2 lg:text-[15px] xl:px-3 xl:text-base";

  if (!item.href) return <SoonItem className={cls}>{content}</SoonItem>;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${cls} ${active ? "text-brick" : "text-ink hover:text-accent"}`}
    >
      {content}
      {active && <span className="absolute inset-x-2 -bottom-0.5 h-[3px] rounded-full bg-brick" />}
    </Link>
  );
}

/** 尚未上線的分頁：反灰，點一下跳出「即將上線！」小提示 */
function SoonItem({ className, children }: { className: string; children: ReactNode }) {
  const [tip, setTip] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      aria-disabled="true"
      title="即將上線！"
      onClick={() => {
        setTip(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setTip(false), 1600);
      }}
      className={`${className} cursor-not-allowed`}
    >
      <span className="flex items-center gap-2 text-ink/35 grayscale">{children}</span>
      {tip && (
        <span
          role="status"
          className="pop-in absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded-full border-2 border-ink bg-mustard px-3 py-1 text-sm font-black text-ink shadow-[0_2px_0_#3e3a35]"
        >
          即將上線！
        </span>
      )}
    </button>
  );
}

function IconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} className="rounded-lg p-2 text-ink hover:bg-paper hover:text-accent">
      {children}
    </button>
  );
}
