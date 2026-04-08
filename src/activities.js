// Default activity presets organized by category
export const DEFAULT_ACTIVITIES = {
  stretch: {
    label: "ストレッチ",
    activities: [
      "肩回し10回",
      "首のストレッチ（左右各10秒）",
      "背伸びを10秒キープ",
      "前屈で太ももの裏を伸ばそう",
      "手首を回して10回ずつ",
      "胸を開いて肩甲骨を寄せよう",
    ],
  },
  exercise: {
    label: "筋トレ",
    activities: [
      "スクワット10回",
      "腕立て伏せ5回",
      "プランク30秒",
      "カーフレイズ20回",
      "ランジ左右5回ずつ",
    ],
  },
  hydration: {
    label: "水分補給",
    activities: [
      "コップ1杯の水を飲もう",
      "白湯を一口飲もう",
      "お茶を一杯入れよう",
    ],
  },
  eyes: {
    label: "目の休憩",
    activities: [
      "窓の外を20秒見よう（20-20-20ルール）",
      "目を閉じて10秒リラックス",
      "遠くの景色を眺めよう",
    ],
  },
  breathing: {
    label: "呼吸",
    activities: [
      "深呼吸を3回しよう",
      "4-7-8呼吸法（4秒吸う→7秒止める→8秒吐く）",
      "ボックス呼吸（4秒ずつ吸う→止める→吐く→止める）",
    ],
  },
  posture: {
    label: "姿勢リセット",
    activities: [
      "座り直して背筋を伸ばそう",
      "骨盤を立てて座ろう",
      "胸を開いて深呼吸",
    ],
  },
};

/**
 * Pick an activity. All categories are eligible from the start.
 * Avoids repeating the same category as lastCategory.
 */
export function pickActivity(elapsedSec, lastCategory, config) {
  const activities = config?.activities ?? DEFAULT_ACTIVITIES;

  const eligible = new Set(Object.keys(activities));

  if (eligible.size === 0) return null;

  // Remove last used category to avoid repeats
  if (lastCategory && eligible.size > 1) {
    eligible.delete(lastCategory);
  }

  const cats = [...eligible];
  const category = cats[Math.floor(Math.random() * cats.length)];
  const items = activities[category].activities;
  const activity = items[Math.floor(Math.random() * items.length)];

  return { category, label: activities[category].label, activity };
}
