"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import BrandLogo from "./BrandLogo";
import {
  BasketIcon,
  CloseIcon,
  FlagIcon,
  HeartIcon,
  HomeIcon,
  MenuIcon,
  NoteIcon,
  RecipeIcon,
  ScaleIcon,
  SearchIcon,
} from "./NavIcons";

interface NavItem {
  label: string;
  icon: ReactNode;
  /** 沒有 href 代表頁面尚未開站 */
  href?: string;
}

const NAV: NavItem[] = [
  { label: "首頁", icon: <HomeIcon />, href: "/" },
  { label: "便當食譜", icon: <RecipeIcon /> },
  { label: "食材圖鑑", icon: <BasketIcon /> },
  { label: "營養計算", icon: <ScaleIcon />, href: "/nutrition" },
  { label: "營養筆記", icon: <NoteIcon /> },
  { label: "主題特輯", icon: <FlagIcon /> },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6">
      <div className="rounded-xl border-2 border-ink bg-paper-light/95 shadow-[3px_4px_0_rgb(62_58_53/0.15)] backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 xl:px-6">
          <Link href="/" onClick={() => setOpen(false)} className="shrink-0">
            <BrandLogo className="h-9 w-auto shrink-0 min-[400px]:h-11" />
          </Link>

          <span className="hidden h-9 w-px bg-ink/30 xl:block" />

          {/* 桌機導覽 */}
          <nav className="hidden flex-1 items-center justify-between xl:flex" aria-label="主選單">
            {NAV.map((item) => (
              <NavLink key={item.label} item={item} active={item.href === pathname} />
            ))}
          </nav>

          <span className="hidden h-9 w-px bg-ink/30 xl:block" />

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 xl:ml-0">
            <IconButton label="搜尋（即將開放）">
              <SearchIcon />
            </IconButton>
            <IconButton label="收藏（即將開放）">
              <HeartIcon />
            </IconButton>
            <button
              type="button"
              className="rounded-lg p-2 text-ink hover:bg-paper xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "關閉選單" : "開啟選單"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* 手機導覽 */}
        {open && (
          <nav id="mobile-nav" className="grid grid-cols-2 gap-1 border-t-2 border-dashed border-ink/25 p-3 xl:hidden" aria-label="主選單">
            {NAV.map((item) => (
              <NavLink key={item.label} item={item} active={item.href === pathname} onNavigate={() => setOpen(false)} />
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const content = (
    <>
      {item.icon}
      <span>{item.label}</span>
    </>
  );
  const cls = "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 font-bold transition-colors";

  if (!item.href) {
    return (
      <span className={`${cls} cursor-default text-ink/40`} title="即將開站" aria-disabled="true">
        {content}
      </span>
    );
  }
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

function IconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} className="rounded-lg p-2 text-ink hover:bg-paper hover:text-accent">
      {children}
    </button>
  );
}
