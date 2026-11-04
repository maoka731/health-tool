// 每日營養攝取計算：BMI、TDEE、三大營養素與食物代換
// 數值來源：衛福部國健署「每日飲食指南」、「211 餐盤」、「食物代換表」

export type Sex = "male" | "female";

export interface ActivityLevel {
  id: string;
  label: string;
  hint: string;
  /** 精簡版表單用的短說明 */
  short: string;
  factor: number;
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  { id: "sedentary", label: "久坐少動", hint: "辦公室工作、幾乎不運動", short: "幾乎不運動", factor: 1.2 },
  { id: "light", label: "輕度活動", hint: "每週運動 1–3 天", short: "每週 1–3 天", factor: 1.375 },
  { id: "moderate", label: "中度活動", hint: "每週運動 3–5 天", short: "每週 3–5 天", factor: 1.55 },
  { id: "active", label: "高度活動", hint: "每週運動 6–7 天", short: "每週 6–7 天", factor: 1.725 },
  { id: "athlete", label: "非常活躍", hint: "勞力工作或每天高強度訓練", short: "每天高強度", factor: 1.9 },
];

/**
 * 三大營養素熱量占比（demo 預設值）
 * 國健署建議範圍：醣類 50–60%、蛋白質 10–20%、脂肪 20–30%。
 * 211 餐盤（蔬菜 2：蛋白質 1：全穀 1）較重視蛋白質，
 * 因此取「醣類 50%、蛋白質 20%、脂肪 30%」。之後要開放客製化時改這裡即可。
 */
export const MACRO_RATIO = { carbs: 0.5, protein: 0.2, fat: 0.3 } as const;

/** 每公克熱量（大卡） */
const KCAL_PER_GRAM = { carbs: 4, protein: 4, fat: 9 } as const;

/** 食物代換表：每 1 份的營養素含量 */
export const EXCHANGE = {
  /** 全穀雜糧類 1 份：醣類 15 g、蛋白質 2 g、70 大卡；1 碗飯 = 4 份 */
  grain: { carbsPerServing: 15, servingsPerBowl: 4 },
  /** 豆魚蛋肉類（中脂）1 份：蛋白質 7 g、脂肪 5 g、75 大卡 = 1 顆雞蛋 = 去骨雞腿肉約 35 g */
  protein: { proteinPerServing: 7, servingsPerDrumstick: 3 },
  /** 油脂與堅果種子類 1 份：脂肪 5 g、45 大卡 = 1 茶匙油 */
  fat: { fatPerServing: 5 },
} as const;

export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

export const BMI_LABEL: Record<BmiCategory, string> = {
  underweight: "體重過輕",
  normal: "健康體位",
  overweight: "過重",
  obese: "肥胖",
};

/** 國健署成人 BMI 標準 */
export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 24) return "normal";
  if (bmi < 27) return "overweight";
  return "obese";
}

export interface NutritionInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityFactor: number;
}

export interface MacroResult {
  kcal: number;
  grams: number;
}

export interface NutritionResult {
  bmi: number;
  bmiCategory: BmiCategory;
  healthyWeight: { min: number; max: number };
  bmr: number;
  tdee: number;
  macros: { carbs: MacroResult; protein: MacroResult; fat: MacroResult };
  exchange: {
    riceBowls: number;
    eggs: number;
    drumsticks: number;
    oilTeaspoons: number;
  };
}

export function calculateNutrition(input: NutritionInput): NutritionResult {
  const { sex, age, heightCm, weightKg, activityFactor } = input;
  const heightM = heightCm / 100;

  const bmi = weightKg / (heightM * heightM);

  // Mifflin-St Jeor 基礎代謝率公式
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
  const tdee = bmr * activityFactor;

  const macro = (key: keyof typeof MACRO_RATIO): MacroResult => {
    const kcal = tdee * MACRO_RATIO[key];
    return { kcal, grams: kcal / KCAL_PER_GRAM[key] };
  };
  const carbs = macro("carbs");
  const protein = macro("protein");
  const fat = macro("fat");

  const proteinServings = protein.grams / EXCHANGE.protein.proteinPerServing;

  return {
    bmi,
    bmiCategory: bmiCategory(bmi),
    healthyWeight: { min: 18.5 * heightM * heightM, max: 24 * heightM * heightM },
    bmr,
    tdee,
    macros: { carbs, protein, fat },
    exchange: {
      riceBowls: carbs.grams / (EXCHANGE.grain.carbsPerServing * EXCHANGE.grain.servingsPerBowl),
      eggs: proteinServings,
      drumsticks: proteinServings / EXCHANGE.protein.servingsPerDrumstick,
      oilTeaspoons: fat.grams / EXCHANGE.fat.fatPerServing,
    },
  };
}

/** 四捨五入到 0.5（代換份數用，比較好讀） */
export function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/**
 * 每日蔬菜建議份數（國健署每日飲食指南，依熱量需求）
 * 1 份蔬菜 ≈ 生重 100 克 ≈ 煮熟約半碗
 */
export function vegetableServings(tdee: number): number {
  if (tdee < 1900) return 3;
  if (tdee < 2400) return 4;
  return 5;
}
