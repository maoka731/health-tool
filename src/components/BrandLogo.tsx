import Image from "next/image";

/** 品牌識別：取自 UI 設定圖（287×81） */
export default function BrandLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/images/brand-logo.png"
      alt="健康便當列車 Healthy Bento Express"
      width={287}
      height={81}
      priority
      className={className}
    />
  );
}
