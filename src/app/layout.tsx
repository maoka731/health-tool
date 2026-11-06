import type { Metadata } from "next";
import { Chiron_GoRound_TC, Huninn, Noto_Sans_TC } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

// 中文字型檔案很大，關閉 preload，交給 unicode-range 按需載入
// Huninn（粉圓體）＝ jf open 粉圓，用於標題
const huninn = Huninn({
  variable: "--font-huninn",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
});

// 圓潤黑體（Chiron GoRound TC）：900 用於海報標題；500／700 用於集章站籤詩的內文與副標
const posterFont = Chiron_GoRound_TC({
  variable: "--font-chiron",
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "健康列車 Healthy Train",
  description: "搭上營養列車，展開你的健康生活！營養計算、午餐大轉盤、每日任務籤三個小工具。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant-TW" className={`${huninn.variable} ${notoSansTC.variable} ${posterFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
