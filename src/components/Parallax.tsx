"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * 滾動視差範圍：依這個區塊在視窗中的位置，持續更新兩個 CSS 變數給子層使用
 * - `--p`：區塊中心相對視窗中心的位置（單位＝一個視窗高；置中為 0，在下方為正）
 * - `--progress`：區塊被捲過的比例 0 → 1（用來讓小火車沿著路線前進）
 * 子層加上 `.px` class，並用 `--k`（垂直）、`--kx`（水平）、`--kr`（旋轉）設定速度。
 */
export function ParallaxScope({
  children,
  className = "",
  style,
  as: Tag = "div",
  id,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "li";
  id?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      const progress = Math.min(1, Math.max(0, (vh * 0.55 - r.top) / r.height));
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      id={id}
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

/** 進入畫面時淡入上浮（只播一次） */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.shown = "";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
