import type { CSSProperties } from "react";

/**
 * 視差層的 style 速記（搭配 `.px` class 與 ParallaxScope）
 * k＝垂直位移速度（px／每個視窗高）、kx＝水平速度、kr＝旋轉速度（度）
 * 正值：捲動時比內容移動得更快（前景）；負值：移動得較慢（遠景）。
 */
export function px(k: number, kx = 0, kr = 0): CSSProperties {
  return { "--k": k, "--kx": kx, "--kr": kr } as CSSProperties;
}
