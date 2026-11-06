import Image from "next/image";

/** 品牌識別：健康列車 Healthy Train（取自 UI 設定圖 v2，282×91） */
export default function BrandLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/images/brand-healthy-train.png"
      alt="健康列車 Healthy Train"
      width={282}
      height={91}
      priority
      className={className}
    />
  );
}
