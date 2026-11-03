import Image from "next/image";

/** 品牌識別：取自 UI 設定圖 */
export default function BrandLogo({ height = 48 }: { height?: number }) {
  const width = Math.round((287 / 81) * height);
  return (
    <Image
      src="/images/brand-logo.png"
      alt="健康便當列車 Healthy Bento Express"
      width={width}
      height={height}
      priority
      style={{ width, height }}
    />
  );
}
