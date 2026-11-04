// 餐點資料模型與預設餐點目錄
// 抽籤轉盤、（預留）餐食紀錄、餐食圖鑑、健康推薦都共用這裡的型別。

import type { Sex } from "./nutrition";

export type MealCategory = "bento" | "cvs" | "fastfood" | "snack" | "global" | "custom";

export const MEAL_CATEGORIES: { id: Exclude<MealCategory, "custom">; label: string; hint: string }[] = [
  { id: "bento", label: "菜肉便當", hint: "家常・風味便當" },
  { id: "cvs", label: "超商便當", hint: "便利商店系列" },
  { id: "fastfood", label: "速食", hint: "連鎖快餐系列" },
  { id: "snack", label: "小吃", hint: "台灣經典小吃" },
  { id: "global", label: "異國料理", hint: "日韓・義式・越南" },
];

/** 一份餐點的營養素（之後餐食紀錄與推薦使用；目前預設目錄尚未填值） */
export interface MealNutrition {
  kcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  /** 蔬菜份數（211 餐盤用） */
  vegServings?: number;
}

/** 餐點：預設目錄、使用者自建、餐食紀錄都用同一個型別 */
export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  /** public/ 底下的圖片路徑 */
  image?: string;
  nutrition?: MealNutrition;
  /** 推薦或篩選用的標籤，例如「高蛋白」「炸物」 */
  tags?: string[];
}

const img = (id: string) => `/images/meal-${id}.png`;

/** 使用者自行輸入、沒有對應圖片的餐點，一律用通用便當圖 */
export const GENERIC_MEAL_IMAGE = "/images/meal-generic.png";

export function optionImage(option: { image?: string }) {
  return option.image ?? GENERIC_MEAL_IMAGE;
}

export const MEAL_CATALOG: Meal[] = [
  { id: "teriyaki-chicken-bento", name: "照燒雞腿便當", category: "bento", image: img("teriyaki-chicken-bento") },
  { id: "braised-pork-bento", name: "滷肉便當", category: "bento", image: img("braised-pork-bento") },
  { id: "salmon-bento", name: "香煎鮭魚便當", category: "bento", image: img("salmon-bento") },
  { id: "beef-brisket-bento", name: "紅燒牛腩便當", category: "bento", image: img("beef-brisket-bento") },
  { id: "mackerel-bento", name: "鹽烤鯖魚便當", category: "bento", image: img("mackerel-bento") },

  { id: "cvs-teriyaki-chicken", name: "照燒雞排便當", category: "cvs", image: img("cvs-teriyaki-chicken") },
  { id: "cvs-pork-cutlet", name: "日式豬排便當", category: "cvs", image: img("cvs-pork-cutlet") },
  { id: "cvs-braised-pork", name: "經典滷肉便當", category: "cvs", image: img("cvs-braised-pork") },
  { id: "cvs-mackerel", name: "烤鯖魚便當", category: "cvs", image: img("cvs-mackerel") },
  { id: "cvs-mapo-tofu", name: "麻婆豆腐便當", category: "cvs", image: img("cvs-mapo-tofu") },

  { id: "burger-set", name: "經典漢堡套餐", category: "fastfood", image: img("burger-set") },
  { id: "chicken-burger-set", name: "雞腿堡套餐", category: "fastfood", image: img("chicken-burger-set") },
  { id: "fried-chicken-set", name: "炸雞套餐", category: "fastfood", image: img("fried-chicken-set") },
  { id: "pizza-set", name: "披薩套餐", category: "fastfood", image: img("pizza-set") },
  { id: "hotdog-set", name: "熱狗套餐", category: "fastfood", image: img("hotdog-set") },

  { id: "beef-noodle", name: "牛肉麵", category: "snack", image: img("beef-noodle") },
  { id: "braised-pork-rice", name: "滷肉飯", category: "snack", image: img("braised-pork-rice") },
  { id: "bawan", name: "肉圓", category: "snack", image: img("bawan") },
  { id: "tianbula", name: "甜不辣", category: "snack", image: img("tianbula") },
  { id: "meatball-noodle", name: "貢丸湯麵", category: "snack", image: img("meatball-noodle") },

  { id: "sushi", name: "壽司", category: "global", image: img("sushi") },
  { id: "kr-tofu-stew", name: "韓式豆腐鍋", category: "global", image: img("kr-tofu-stew") },
  { id: "pasta", name: "義大利麵", category: "global", image: img("pasta") },
  { id: "pho", name: "越南河粉", category: "global", image: img("pho") },
  { id: "udon", name: "烏龍麵", category: "global", image: img("udon") },
  { id: "kr-bulgogi-rice", name: "韓式烤肉飯", category: "global", image: img("kr-bulgogi-rice") },
];

const byName = new Map(MEAL_CATALOG.map((m) => [m.name, m]));

/** 使用者輸入的名稱若跟目錄完全相同，就沿用目錄的圖片與資料 */
export function findCatalogMeal(name: string): Meal | undefined {
  return byName.get(name.trim());
}

/** 轉盤上的一個選項 */
export interface WheelOption {
  /** 選項本身的 id（同名可重複加入時仍可區分） */
  id: string;
  name: string;
  image?: string;
  /** 對應目錄或圖鑑的餐點 id；自行輸入且不在目錄中則為空 */
  mealId?: string;
  /** 來源：自行輸入、預設目錄、（預留）健康推薦 */
  source: "custom" | "catalog" | "recommended";
}

/** 分類：選圖與快速加入共用（便當含超商便當） */
export type ImageGroup = "bento" | "snack" | "fastfood" | "global";

export const IMAGE_GROUPS: { id: ImageGroup; label: string }[] = [
  { id: "bento", label: "便當" },
  { id: "snack", label: "小吃" },
  { id: "fastfood", label: "速食" },
  { id: "global", label: "異國" },
];

export interface MealImageChoice {
  src: string;
  label: string;
}

export function imageChoices(group: ImageGroup): MealImageChoice[] {
  const meals = MEAL_CATALOG.filter((m) =>
    group === "bento" ? m.category === "bento" || m.category === "cvs" : m.category === group,
  );
  const list = meals.map((m) => ({ src: m.image!, label: m.name }));
  return group === "bento" ? [{ src: GENERIC_MEAL_IMAGE, label: "通用便當" }, ...list] : list;
}

/** 快速加入的一個項目（預設菜單或使用者儲存的） */
export interface QuickMeal {
  id: string;
  name: string;
  image: string;
  group: ImageGroup;
  /** 使用者自己儲存的（可刪除） */
  custom?: boolean;
}

/** 快速加入的預設菜單 */
export const QUICK_PRESETS: QuickMeal[] = [
  { id: "q-healthy-box", name: "健康餐盒", image: img("salmon-bento"), group: "bento" },
  { id: "q-classic-bento", name: "傳統便當", image: img("teriyaki-chicken-bento"), group: "bento" },
  { id: "q-buffet", name: "自助餐", image: img("cvs-mapo-tofu"), group: "bento" },

  { id: "q-beef-noodle", name: "牛肉麵", image: img("beef-noodle"), group: "snack" },
  { id: "q-braised-pork-rice", name: "滷肉飯", image: img("braised-pork-rice"), group: "snack" },
  { id: "q-bawan", name: "肉圓", image: img("bawan"), group: "snack" },
  { id: "q-tianbula", name: "甜不辣", image: img("tianbula"), group: "snack" },
  { id: "q-meatball-noodle", name: "貢丸湯麵", image: img("meatball-noodle"), group: "snack" },

  { id: "q-burger", name: "單點漢堡／主食", image: img("chicken-burger-set"), group: "fastfood" },
  { id: "q-combo", name: "速食套餐", image: img("burger-set"), group: "fastfood" },
  { id: "q-fried-chicken", name: "炸雞", image: img("fried-chicken-set"), group: "fastfood" },
  { id: "q-pizza", name: "披薩", image: img("pizza-set"), group: "fastfood" },
  { id: "q-hotdog", name: "熱狗", image: img("hotdog-set"), group: "fastfood" },

  { id: "q-sushi", name: "壽司", image: img("sushi"), group: "global" },
  { id: "q-tofu-stew", name: "豆腐鍋", image: img("kr-tofu-stew"), group: "global" },
  { id: "q-pasta", name: "義大利麵", image: img("pasta"), group: "global" },
  { id: "q-pho", name: "越南河粉", image: img("pho"), group: "global" },
  { id: "q-udon", name: "烏龍麵", image: img("udon"), group: "global" },
  { id: "q-bulgogi-rice", name: "烤肉拌飯", image: img("kr-bulgogi-rice"), group: "global" },
];

/** 從快速加入的預設菜單隨機挑出 count 個，做成轉盤選項 */
export function randomPresetOptions(count = 3): WheelOption[] {
  const pool = [...QUICK_PRESETS];
  const picked: QuickMeal[] = [];
  while (picked.length < count && pool.length > 0) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked.map((m) => ({ id: newOptionId("preset"), name: m.name, image: m.image, source: "catalog" }));
}

/** 依圖片路徑找出它屬於哪個分類（使用者儲存時用來決定放在哪個分頁） */
export function groupOfImage(src: string): ImageGroup {
  if (src === GENERIC_MEAL_IMAGE) return "bento";
  const meal = MEAL_CATALOG.find((m) => m.image === src);
  if (!meal) return "bento";
  return meal.category === "cvs" || meal.category === "bento" ? "bento" : (meal.category as ImageGroup);
}

let seq = 0;
export function newOptionId(prefix = "opt") {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

// ─── 以下為預留給「餐食紀錄」與「健康推薦」的資料結構，目前尚未使用 ───

/** 營養計算頁存下的身體資料 */
export interface HealthProfile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityId: string;
  /** ISO 時間字串 */
  updatedAt: string;
}

/** 一筆餐食紀錄 */
export interface MealLogEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  mealTime: "breakfast" | "lunch" | "dinner" | "snack";
  mealId?: string;
  name: string;
  image?: string;
  nutrition?: MealNutrition;
  note?: string;
  createdAt: string;
}
