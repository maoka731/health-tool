// 健康集章站：三種任務籤筒＋集章本
// 純前端：抽籤結果與蓋章紀錄存在使用者瀏覽器（見 storage.ts 的 stampBook）。

// ─── 籤筒（任務類別） ───

export type MissionCategory = "eat" | "move" | "mind";

export const CATEGORY_ORDER: MissionCategory[] = ["eat", "move", "mind"];

/** 顏色取自 UI 設定圖色票：成功綠、強調橘、輔助海綠 */
export const MISSION_CATEGORIES: Record<
  MissionCategory,
  { label: string; station: string; color: string; deep: string; tint: string; icon: string; en: string }
> = {
  eat: { label: "飲食", station: "均衡站", color: "#6ba367", deep: "#4c7f49", tint: "#d6e8c4", icon: "🥦", en: "FOOD" },
  move: { label: "活動", station: "元氣站", color: "#e76b3c", deep: "#b5452b", tint: "#f9cdb5", icon: "👟", en: "MOVE" },
  mind: { label: "身心", station: "舒心站", color: "#2c8f86", deep: "#1f6b64", tint: "#bfe3dc", icon: "☀️", en: "MIND" },
};

// ─── 籤等：越難完成的任務，籤越「凶」 ───

export type Luck = "大吉" | "中吉" | "小吉" | "末吉" | "凶";

/** 難度 1（最容易）→ 大吉，難度 5（最難）→ 凶 */
export const LUCK_BY_DIFFICULTY: Record<1 | 2 | 3 | 4 | 5, Luck> = {
  1: "大吉",
  2: "中吉",
  3: "小吉",
  4: "末吉",
  5: "凶",
};

export const LUCK_HINT: Record<Luck, string> = {
  大吉: "輕鬆就能完成",
  中吉: "稍微用點心",
  小吉: "需要一點計畫",
  末吉: "有點挑戰",
  凶: "高難度挑戰！",
};

export interface Mission {
  id: string;
  category: MissionCategory;
  /** 籤號：該籤筒裡的第幾首 */
  no: number;
  /** 難度 1–5，決定籤等 */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** 籤紙上的大字標題 */
  title: string;
  /** 具體要做什麼 */
  detail: string;
  /** 小主廚的一句話 */
  tip: string;
  /**
   * （預留）之後有互動頁面時（呼吸鐘、伸展、喝水站…），抽到籤可以跳轉過去完成。
   * 目前都是手動按「完成任務」。
   */
  link?: { label: string; href: string };
}

type Raw = Omit<Mission, "category" | "no">;

const EAT: Raw[] = [
  { id: "eat-water", difficulty: 1, title: "飯前先喝一杯水", detail: "午餐或晚餐開動前，先喝一杯 250ml 的白開水。", tip: "幫腸胃暖身，也比較不容易吃太快～" },
  { id: "eat-veg-first", difficulty: 1, title: "先吃菜再吃飯", detail: "這一餐的順序：蔬菜 → 豆魚蛋肉 → 最後才吃飯。", tip: "血糖會比較穩，下午不容易昏昏欲睡。" },
  { id: "eat-milk", difficulty: 2, title: "喝一杯乳品", detail: "一杯鮮奶、優格或無糖豆漿，補充鈣質與蛋白質。", tip: "國健署建議每天 1.5–2 杯乳品。" },
  { id: "eat-fruit", difficulty: 2, title: "吃一個拳頭的水果", detail: "選一份當季水果，份量大約是自己的拳頭大小。", tip: "整顆吃比打成果汁更好喔！" },
  { id: "eat-veg-plus", difficulty: 2, title: "午餐多一份青菜", detail: "加點一份燙青菜或沙拉，讓蔬菜佔餐盤的一半。", tip: "深綠色蔬菜的營養最滿分！" },
  { id: "eat-slow", difficulty: 3, title: "一餐吃滿 20 分鐘", detail: "放下手機，每一口慢慢咀嚼，讓這一餐至少吃 20 分鐘。", tip: "大腦接收到「飽了」的訊號需要時間。" },
  { id: "eat-whole-grain", difficulty: 3, title: "主食換成全穀", detail: "白飯換成糙米飯、五穀飯，或吃一份地瓜、玉米。", tip: "全穀的纖維能讓飽足感更久。" },
  { id: "eat-no-fried", difficulty: 3, title: "今天避開炸物", detail: "選蒸、煮、烤、滷的料理，炸雞排先放過自己一天。", tip: "便當可以請老闆把炸排換成滷雞腿！" },
  { id: "eat-no-sugar", difficulty: 4, title: "今天不喝含糖飲料", detail: "手搖飲、汽水、加糖咖啡都先暫停一天，改喝白開水或無糖茶。", tip: "嘴饞時試試氣泡水加檸檬片～" },
  { id: "eat-211", difficulty: 4, title: "吃一餐 211 餐盤", detail: "其中一餐照「蔬菜 2：蛋白質 1：全穀 1」的比例裝盤。", tip: "營養計算站可以幫你算份量！" },
  { id: "eat-no-snack", difficulty: 5, title: "一整天不吃零食", detail: "正餐以外不吃餅乾、糖果、洋芋片，嘴饞就吃水果或喝水。", tip: "撐過去的你超厲害！" },
  { id: "eat-home-cook", difficulty: 5, title: "自己準備一餐", detail: "自己煮或自己組合一份健康便當，蔬菜、蛋白質、全穀都要有。", tip: "健康便當列車為你加油！" },
];

const MOVE: Raw[] = [
  { id: "move-stand", difficulty: 1, title: "站起來伸個懶腰", detail: "現在就站起來，雙手往上伸直，深呼吸停 10 秒。", tip: "就是這麼簡單，完成！" },
  { id: "move-shoulder", difficulty: 1, title: "轉轉肩膀 10 下", detail: "肩膀往前轉 10 下、往後轉 10 下，放鬆肩頸。", tip: "久坐的肩頸會很感謝你～" },
  { id: "move-dance", difficulty: 2, title: "跟著一首歌動一動", detail: "播一首喜歡的歌，跟著音樂跳動或原地踏步到歌曲結束。", tip: "心情也會跟著變好喔！" },
  { id: "move-tiptoe", difficulty: 2, title: "等待時踮腳尖 20 下", detail: "等電梯、等水開、刷牙時，踮腳尖 20 下。", tip: "小腿是第二個心臟！" },
  { id: "move-stairs", difficulty: 3, title: "今天走一次樓梯", detail: "三層樓以內不搭電梯，改走樓梯上下樓。", tip: "爬樓梯是很棒的下半身訓練。" },
  { id: "move-walk-10", difficulty: 3, title: "飯後散步 10 分鐘", detail: "午餐或晚餐後，出去走走 10 分鐘再回來。", tip: "飯後散步幫助消化、穩定血糖。" },
  { id: "move-squat", difficulty: 3, title: "做 20 下深蹲", detail: "可以分兩次，每次 10 下，膝蓋不超過腳尖。", tip: "等電梯、等水開的時間也能做！" },
  { id: "move-stretch-3", difficulty: 4, title: "起身伸展 3 次", detail: "每坐 1 小時就站起來伸展一下，今天做滿 3 次。", tip: "可以設個手機鬧鐘提醒自己。" },
  { id: "move-1000", difficulty: 4, title: "多走 1000 步", detail: "提早一站下車，或繞遠路走回家。", tip: "走路是最簡單的運動！" },
  { id: "move-plank", difficulty: 4, title: "棒式撐 30 秒", detail: "手肘撐地、身體打直，撐住 30 秒（可以分 3 次）。", tip: "核心肌群練起來！" },
  { id: "move-30min", difficulty: 5, title: "運動滿 30 分鐘", detail: "快走、慢跑、騎車、游泳都可以，讓身體微微喘、流點汗。", tip: "國健署建議每週累積 150 分鐘！" },
  { id: "move-8000", difficulty: 5, title: "今天走滿 8000 步", detail: "用手機或手錶記錄，一整天累積走到 8000 步。", tip: "挑戰成功就是凶籤逆轉勝！" },
];

const MIND: Raw[] = [
  { id: "mind-breathe", difficulty: 1, title: "做 1 分鐘深呼吸", detail: "吸氣 4 秒、停 4 秒、吐氣 6 秒，重複 5 次。", tip: "緊張的時候特別有用！" },
  { id: "mind-morning-water", difficulty: 1, title: "起床先喝一杯水", detail: "早上起床後先喝一杯溫開水（已經喝了也算！）。", tip: "幫身體開機，喚醒腸胃～" },
  { id: "mind-praise", difficulty: 1, title: "稱讚自己一次", detail: "找一件今天做得不錯的事，好好稱讚自己。", tip: "你已經很努力了！" },
  { id: "mind-eye", difficulty: 2, title: "讓眼睛休息 3 次", detail: "每看螢幕 30 分鐘，就望遠方 20 秒，今天做滿 3 次。", tip: "20-20-20 護眼法則！" },
  { id: "mind-tidy", difficulty: 2, title: "整理桌面 5 分鐘", detail: "把桌上的東西歸位，丟掉不需要的紙張。", tip: "環境清爽，心情也清爽～" },
  { id: "mind-sun", difficulty: 2, title: "曬 10 分鐘太陽", detail: "到戶外或窗邊曬曬太陽，讓身體充電。", tip: "陽光幫助身體製造維生素 D。" },
  { id: "mind-nap", difficulty: 3, title: "午休閉眼 15 分鐘", detail: "午餐後找個地方閉眼休息 15 分鐘，不滑手機。", tip: "短短的午休讓下午更有精神。" },
  { id: "mind-three-good", difficulty: 3, title: "寫下 3 件好事", detail: "想想今天發生的 3 件小確幸，寫下來或說出來。", tip: "感恩練習能讓心情變好。" },
  { id: "mind-coffee", difficulty: 3, title: "咖啡不超過 2 杯", detail: "今天的咖啡、濃茶加起來不超過 2 杯，下午 3 點後不喝。", tip: "晚上會比較好入睡喔。" },
  { id: "mind-friend", difficulty: 4, title: "跟一位朋友聊聊天", detail: "傳訊息或打電話給一位好久沒聯絡的朋友。", tip: "好的人際關係也是健康的一部分。" },
  { id: "mind-phone-free", difficulty: 4, title: "1 小時不滑手機", detail: "選一段時間把手機放遠，專心做一件事或好好休息。", tip: "給大腦一點安靜的時間。" },
  { id: "mind-no-screen-night", difficulty: 5, title: "睡前 1 小時不看螢幕", detail: "今晚睡前 1 小時關掉手機、電腦和電視，改看書或聽音樂。", tip: "完成後可以在睡前回來蓋章！" },
];

function build(category: MissionCategory, raws: Raw[]): Mission[] {
  return raws.map((r, i) => ({ ...r, category, no: i + 1 }));
}

export const MISSIONS: Mission[] = [...build("eat", EAT), ...build("move", MOVE), ...build("mind", MIND)];

export function missionsOf(category: MissionCategory) {
  return MISSIONS.filter((m) => m.category === category);
}

export function findMission(id: string | undefined) {
  return MISSIONS.find((m) => m.id === id);
}

export function luckOf(m: Mission): Luck {
  return LUCK_BY_DIFFICULTY[m.difficulty];
}

/** 從某個籤筒抽一支；可排除指定的任務（換籤時避免抽到同一支） */
export function drawMission(category: MissionCategory, excludeIds: string[] = []): Mission {
  const all = missionsOf(category);
  const pool = all.filter((m) => !excludeIds.includes(m.id));
  const list = pool.length > 0 ? pool : all;
  return list[Math.floor(Math.random() * list.length)];
}

/** 每個籤筒每天可以換籤的次數 */
export const MAX_REDRAWS = 1;

// ─── 集章本資料 ───

/** 某個籤筒某一天的抽籤紀錄 */
export interface Draw {
  missionId: string;
  drawnAt: string;
  /** 已換籤次數 */
  redraws: number;
  /** 完成（蓋章）的時間；未完成為空 */
  stampedAt?: string;
}

export type DayRecord = Partial<Record<MissionCategory, Draw>>;

export interface StampBook {
  /** key 為 YYYY-MM-DD（使用者本地時區） */
  days: Record<string, DayRecord>;
}

export const EMPTY_BOOK: StampBook = { days: {} };

// ─── 日期工具（一律用本地時區） ───

export function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** 該月份的日曆格（含前後補位的 null），以週一開頭 */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

export function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── 每日狀態 ───

/** 這一天蓋了哪些籤筒的章 */
export function stampedCategories(rec: DayRecord | undefined): MissionCategory[] {
  if (!rec) return [];
  return CATEGORY_ORDER.filter((c) => rec[c]?.stampedAt);
}

/**
 * 月曆上的狀態：至少完成一種籤筒＝「完成」，三種都完成＝「完美」。
 * （以「蓋章」為準；若要改成「有抽過籤」就算，只要改這個函式）
 */
export type DayStatus = "none" | "done" | "perfect";

export function dayStatus(rec: DayRecord | undefined): DayStatus {
  const n = stampedCategories(rec).length;
  if (n === 0) return "none";
  return n === CATEGORY_ORDER.length ? "perfect" : "done";
}

// ─── 統計 ───

function isActive(book: StampBook, key: string) {
  return dayStatus(book.days[key]) !== "none";
}

/** 連續集章天數：從今天往回數；今天還沒蓋章時從昨天開始數（不會因為今天還沒完成就歸零） */
export function currentStreak(book: StampBook, today: Date) {
  let d = isActive(book, dateKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (isActive(book, dateKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function longestStreak(book: StampBook) {
  const keys = Object.keys(book.days).filter((k) => isActive(book, k)).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const d = parseKey(k);
    run = prev && dateKey(addDays(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export interface BookStats {
  /** 累積章數（三種籤筒合計） */
  total: number;
  streak: number;
  longest: number;
  perfectDays: number;
  byCategory: Record<MissionCategory, number>;
  /** 完成過的「凶」籤數 */
  hardDone: number;
}

export function bookStats(book: StampBook, today: Date): BookStats {
  const byCategory: Record<MissionCategory, number> = { eat: 0, move: 0, mind: 0 };
  let total = 0;
  let perfectDays = 0;
  let hardDone = 0;
  for (const rec of Object.values(book.days)) {
    for (const c of stampedCategories(rec)) {
      byCategory[c]++;
      total++;
      const m = findMission(rec[c]?.missionId);
      if (m && luckOf(m) === "凶") hardDone++;
    }
    if (dayStatus(rec) === "perfect") perfectDays++;
  }
  return { total, streak: currentStreak(book, today), longest: longestStreak(book), perfectDays, byCategory, hardDone };
}

// ─── 徽章（使用者在此網站歷史以來的成就） ───

export interface Badge {
  id: string;
  name: string;
  desc: string;
  /** 徽章上的大字 */
  mark: string;
  color: string;
  goal: number;
  value: (s: BookStats) => number;
  unit: string;
}

export const BADGES: Badge[] = [
  { id: "first", name: "首班車", desc: "蓋下第一個章", mark: "1", color: "#b5452b", goal: 1, value: (s) => s.total, unit: "章" },
  { id: "streak3", name: "三站連發", desc: "連續 3 天集章", mark: "3", color: "#e76b3c", goal: 3, value: (s) => s.longest, unit: "天" },
  { id: "streak7", name: "一週環島", desc: "連續 7 天集章", mark: "7", color: "#d98f1c", goal: 7, value: (s) => s.longest, unit: "天" },
  { id: "perfect", name: "三站制霸", desc: "同一天集滿三種章", mark: "★", color: "#5a3a22", goal: 1, value: (s) => s.perfectDays, unit: "天" },
  { id: "eat10", name: "均衡站常客", desc: "飲食章累積 10 個", mark: "食", color: MISSION_CATEGORIES.eat.color, goal: 10, value: (s) => s.byCategory.eat, unit: "章" },
  { id: "move10", name: "元氣站常客", desc: "活動章累積 10 個", mark: "動", color: MISSION_CATEGORIES.move.color, goal: 10, value: (s) => s.byCategory.move, unit: "章" },
  { id: "mind10", name: "舒心站常客", desc: "身心章累積 10 個", mark: "心", color: MISSION_CATEGORIES.mind.color, goal: 10, value: (s) => s.byCategory.mind, unit: "章" },
  { id: "hard", name: "逢凶化吉", desc: "完成一支「凶」籤", mark: "凶", color: "#3e3a35", goal: 1, value: (s) => s.hardDone, unit: "支" },
  { id: "total30", name: "月台常客", desc: "累積 30 個章", mark: "30", color: "#b5452b", goal: 30, value: (s) => s.total, unit: "章" },
];
