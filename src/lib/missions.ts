// 健康集章站：每日任務籤＋集章本
// 純前端：抽籤結果與蓋章紀錄存在使用者瀏覽器（見 storage.ts 的 stampBook）。
// 之後的「喝水站」「伸展提醒」也可以把完成紀錄寫成新的集章類型，沿用同一本集章本。

// ─── 任務類別 ───

export type MissionCategory = "eat" | "move" | "rest" | "mind";

export const MISSION_CATEGORIES: Record<
  MissionCategory,
  { label: string; station: string; color: string; tint: string; icon: string }
> = {
  eat: { label: "飲食", station: "均衡站", color: "#6ba367", tint: "#d6e8c4", icon: "🥦" },
  move: { label: "活動", station: "元氣站", color: "#e76b3c", tint: "#f9cdb5", icon: "👟" },
  rest: { label: "作息", station: "好眠站", color: "#2c8f86", tint: "#bfe3dc", icon: "🌙" },
  mind: { label: "心情", station: "微笑站", color: "#d98f1c", tint: "#fde4ab", icon: "☀️" },
};

export interface Mission {
  id: string;
  category: MissionCategory;
  /** 籤紙上的大字標題 */
  title: string;
  /** 具體要做什麼 */
  detail: string;
  /** 小主廚的一句話 */
  tip: string;
  /** 籤的等第（純趣味） */
  luck: "大吉" | "中吉" | "小吉" | "吉";
}

export const MISSIONS: Mission[] = [
  // 飲食
  { id: "veg-plus", category: "eat", title: "午餐多一份青菜", detail: "午餐的蔬菜量要佔餐盤的一半，至少多加一份燙青菜或沙拉。", tip: "深綠色蔬菜的營養最滿分！", luck: "大吉" },
  { id: "no-sugar-drink", category: "eat", title: "今天不喝含糖飲料", detail: "手搖飲、汽水、加糖咖啡都先暫停一天，改喝白開水或無糖茶。", tip: "嘴饞時試試氣泡水加檸檬片～", luck: "中吉" },
  { id: "fruit-fist", category: "eat", title: "吃一個拳頭的水果", detail: "選一份當季水果，份量大約是自己的拳頭大小。", tip: "整顆吃比打成果汁更好喔！", luck: "小吉" },
  { id: "whole-grain", category: "eat", title: "主食換成全穀", detail: "白飯換成糙米飯、五穀飯，或吃一份地瓜、玉米。", tip: "全穀的纖維能讓飽足感更久。", luck: "中吉" },
  { id: "protein-first", category: "eat", title: "先吃菜和蛋白質", detail: "這一餐的順序：蔬菜 → 豆魚蛋肉 → 最後才吃飯。", tip: "血糖會比較穩定，下午不容易昏昏欲睡。", luck: "吉" },
  { id: "slow-eat", category: "eat", title: "一餐吃滿 20 分鐘", detail: "放下手機，每一口慢慢咀嚼，讓這一餐至少吃 20 分鐘。", tip: "大腦接收到「飽了」的訊號需要時間。", luck: "小吉" },
  { id: "less-fried", category: "eat", title: "今天避開炸物", detail: "選蒸、煮、烤、滷的料理，炸雞排先放過自己一天。", tip: "便當可以請老闆把炸排換成滷雞腿！", luck: "中吉" },
  { id: "milk", category: "eat", title: "喝一杯乳品", detail: "一杯鮮奶、優格或無糖豆漿，補充鈣質與蛋白質。", tip: "國健署建議每天 1.5–2 杯乳品。", luck: "吉" },

  // 活動
  { id: "walk-1000", category: "move", title: "多走 1000 步", detail: "提早一站下車，或午餐後散步 10 分鐘。", tip: "走路是最簡單的運動！", luck: "大吉" },
  { id: "stairs", category: "move", title: "今天走樓梯", detail: "三層樓以內不搭電梯，改走樓梯上下樓。", tip: "爬樓梯是很棒的下半身訓練。", luck: "中吉" },
  { id: "stretch-3", category: "move", title: "起身伸展 3 次", detail: "每坐 1 小時就站起來轉轉肩膀、伸展手臂，今天做滿 3 次。", tip: "久坐的肩頸會很感謝你～", luck: "小吉" },
  { id: "squat-20", category: "move", title: "做 20 下深蹲", detail: "可以分兩次，每次 10 下，膝蓋不超過腳尖。", tip: "等電梯、等水開的時間也能做！", luck: "中吉" },
  { id: "sun-walk", category: "move", title: "曬 15 分鐘太陽", detail: "上午或傍晚到戶外走走，讓身體曬曬太陽。", tip: "陽光幫助身體製造維生素 D。", luck: "吉" },
  { id: "dance", category: "move", title: "跟著一首歌動一動", detail: "播一首喜歡的歌，跟著音樂跳動或原地踏步到歌曲結束。", tip: "心情也會跟著變好喔！", luck: "大吉" },

  // 作息
  { id: "sleep-early", category: "rest", title: "今晚 12 點前睡", detail: "提早 30 分鐘準備睡覺，12 點前躺上床。", tip: "睡眠充足，隔天食慾也比較穩定。", luck: "大吉" },
  { id: "screen-off", category: "rest", title: "睡前 30 分鐘不滑手機", detail: "睡前把手機放遠一點，改成看書或聽輕音樂。", tip: "藍光會讓大腦以為還是白天。", luck: "中吉" },
  { id: "water-morning", category: "rest", title: "起床先喝一杯水", detail: "早上起床後先喝一杯 250ml 的溫開水。", tip: "幫身體開機，喚醒腸胃～", luck: "小吉" },
  { id: "eye-rest", category: "rest", title: "讓眼睛休息 3 次", detail: "每看螢幕 30 分鐘，就望遠方 20 秒，今天做滿 3 次。", tip: "20-20-20 護眼法則！", luck: "吉" },
  { id: "no-late-snack", category: "rest", title: "今晚不吃宵夜", detail: "晚餐後 9 點以後不再進食，真的餓就喝杯溫水或無糖豆漿。", tip: "腸胃晚上也需要下班休息。", luck: "中吉" },

  // 心情
  { id: "three-good", category: "mind", title: "寫下 3 件好事", detail: "睡前想想今天發生的 3 件小確幸，寫下來或說出來。", tip: "感恩練習能讓睡眠品質更好。", luck: "大吉" },
  { id: "breathe", category: "mind", title: "做 1 分鐘深呼吸", detail: "吸氣 4 秒、停 4 秒、吐氣 6 秒，重複 5 次。", tip: "緊張的時候特別有用！", luck: "小吉" },
  { id: "call-friend", category: "mind", title: "跟一位朋友聊聊天", detail: "傳訊息或打電話給一位好久沒聯絡的朋友。", tip: "好的人際關係也是健康的一部分。", luck: "中吉" },
  { id: "tidy-desk", category: "mind", title: "整理桌面 5 分鐘", detail: "把桌上的東西歸位，丟掉不需要的紙張。", tip: "環境清爽，心情也清爽～", luck: "吉" },
  { id: "praise-self", category: "mind", title: "稱讚自己一次", detail: "找一件今天做得不錯的事，好好稱讚自己。", tip: "你已經很努力了！", luck: "大吉" },
];

export function findMission(id: string | undefined) {
  return MISSIONS.find((m) => m.id === id);
}

/** 抽一支籤；可排除指定的任務（換籤時避免抽到同一支） */
export function drawMission(excludeIds: string[] = []): Mission {
  const pool = MISSIONS.filter((m) => !excludeIds.includes(m.id));
  const list = pool.length > 0 ? pool : MISSIONS;
  return list[Math.floor(Math.random() * list.length)];
}

/** 每天可以換籤的次數 */
export const MAX_REDRAWS = 1;

// ─── 集章本資料 ───

/** 某一天的抽籤與蓋章紀錄 */
export interface DayRecord {
  missionId: string;
  drawnAt: string;
  /** 已換籤次數 */
  redraws: number;
  /** 完成（蓋章）的時間；未完成為空 */
  stampedAt?: string;
}

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

/** 以週一為一週的開始 */
export function weekDays(today: Date) {
  const offset = (today.getDay() + 6) % 7;
  const monday = addDays(today, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
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

// ─── 統計 ───

export function isStamped(book: StampBook, key: string) {
  return Boolean(book.days[key]?.stampedAt);
}

/** 連續集章天數：從今天往回數；今天還沒蓋章時從昨天開始數（不會因為今天還沒完成就歸零） */
export function currentStreak(book: StampBook, today: Date) {
  let d = isStamped(book, dateKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (isStamped(book, dateKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function longestStreak(book: StampBook) {
  const keys = Object.keys(book.days).filter((k) => isStamped(book, k)).sort();
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

export function stampedEntries(book: StampBook) {
  return Object.entries(book.days)
    .filter(([, r]) => r.stampedAt)
    .sort(([a], [b]) => (a < b ? 1 : -1));
}

export interface BookStats {
  total: number;
  streak: number;
  longest: number;
  thisMonth: number;
  byCategory: Record<MissionCategory, number>;
}

export function bookStats(book: StampBook, today: Date): BookStats {
  const entries = stampedEntries(book);
  const monthPrefix = dateKey(today).slice(0, 7);
  const byCategory: Record<MissionCategory, number> = { eat: 0, move: 0, rest: 0, mind: 0 };
  for (const [, r] of entries) {
    const m = findMission(r.missionId);
    if (m) byCategory[m.category]++;
  }
  return {
    total: entries.length,
    streak: currentStreak(book, today),
    longest: longestStreak(book),
    thisMonth: entries.filter(([k]) => k.startsWith(monthPrefix)).length,
    byCategory,
  };
}

// ─── 徽章 ───

export interface Badge {
  id: string;
  name: string;
  desc: string;
  /** 徽章上的大字 */
  mark: string;
  color: string;
  unlocked: (s: BookStats) => boolean;
  /** 進度（0–1），未解鎖時顯示 */
  progress: (s: BookStats) => number;
}

const ratio = (v: number, goal: number) => Math.min(1, v / goal);

export const BADGES: Badge[] = [
  { id: "first", name: "首班車", desc: "蓋下第一個章", mark: "1", color: "#b5452b", unlocked: (s) => s.total >= 1, progress: (s) => ratio(s.total, 1) },
  { id: "streak3", name: "三站連發", desc: "連續 3 天集章", mark: "3", color: "#e76b3c", unlocked: (s) => s.longest >= 3, progress: (s) => ratio(s.longest, 3) },
  { id: "streak7", name: "一週環島", desc: "連續 7 天集章", mark: "7", color: "#2c8f86", unlocked: (s) => s.longest >= 7, progress: (s) => ratio(s.longest, 7) },
  { id: "total10", name: "十站旅人", desc: "累積 10 個章", mark: "10", color: "#d98f1c", unlocked: (s) => s.total >= 10, progress: (s) => ratio(s.total, 10) },
  {
    id: "all-lines",
    name: "全線通車",
    desc: "飲食、活動、作息、心情各完成一次",
    mark: "全",
    color: "#6ba367",
    unlocked: (s) => Object.values(s.byCategory).every((n) => n > 0),
    progress: (s) => Object.values(s.byCategory).filter((n) => n > 0).length / 4,
  },
  { id: "total30", name: "月台常客", desc: "累積 30 個章", mark: "30", color: "#5a3a22", unlocked: (s) => s.total >= 30, progress: (s) => ratio(s.total, 30) },
];
