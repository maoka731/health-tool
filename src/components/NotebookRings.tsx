import { useId } from "react";

/** 筆記本頂端的金屬線圈 */
export default function NotebookRings({ compact = false }: { compact?: boolean }) {
  const rings = Array.from({ length: 9 });
  const uid = useId();
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-6 flex justify-evenly pr-24 pl-6" aria-hidden>
      {rings.map((_, i) => (
        <svg
          key={i}
          width="26"
          height="46"
          viewBox="0 0 26 46"
          className={`${i >= 4 ? "hidden sm:block" : ""} ${i >= 4 && compact ? "lg:hidden" : ""} ${
            i >= 6 && !compact ? "sm:hidden md:block" : ""
          }`}
        >
          <defs>
            <linearGradient id={`${uid}-ring-${i}`} x1="0" x2="1">
              <stop offset="0" stopColor="#8d8378" />
              <stop offset="0.45" stopColor="#f3eee6" />
              <stop offset="1" stopColor="#9a8f82" />
            </linearGradient>
          </defs>
          {/* 後腳：從紙張上緣（y≈25）繞到後面，顏色較暗 */}
          <path d="M7 25.5V12" fill="none" stroke="#3e3a35" strokeWidth="7" strokeLinecap="butt" />
          <path d="M7 25.5V12" fill="none" stroke="#7d7469" strokeWidth="3.5" strokeLinecap="butt" />
          {/* 打孔：只對準前腳 */}
          <ellipse cx="18" cy="38.5" rx="5.5" ry="4" fill="#3e3a35" />
          {/* 線圈上半與前腳：往下穿進孔洞 */}
          <path d="M7 12.5a5.5 5.5 0 0 1 11 0V37" fill="none" stroke="#3e3a35" strokeWidth="7" strokeLinecap="round" />
          <path d="M7 12.5a5.5 5.5 0 0 1 11 0V37" fill="none" stroke={`url(#${uid}-ring-${i})`} strokeWidth="3.5" strokeLinecap="round" />
          {/* 孔洞前緣蓋住前腳末端 */}
          <path d="M12.5 38.5a5.5 4 0 0 0 11 0" fill="#3e3a35" />
          <ellipse cx="18" cy="38" rx="3.6" ry="1.8" fill="#1f1c19" />
        </svg>
      ))}
    </div>
  );
}
