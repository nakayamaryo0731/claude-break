// Default activity presets organized by category
export const DEFAULT_ACTIVITIES = {
  stretch: {
    label: "Stretch",
    activities: [
      "Shoulder rolls x10",
      "Neck stretch, 10s each side",
      "Reach up and hold for 10s",
      "Touch your toes",
      "Wrist circles x10 each",
      "Squeeze your shoulder blades",
    ],
  },
  exercise: {
    label: "Exercise",
    activities: [
      "Squats x10",
      "Push-ups x5",
      "Plank for 30s",
      "Calf raises x20",
      "Lunges x5 each side",
    ],
  },
  hydration: {
    label: "Hydration",
    activities: [
      "Drink a glass of water",
      "Go grab some water",
      "Make yourself a cup of tea",
    ],
  },
  eyes: {
    label: "Eyes",
    activities: [
      "Look out the window for 20s",
      "Close your eyes for 10s",
      "Look at something far away",
    ],
  },
  breathing: {
    label: "Breathing",
    activities: [
      "Take 3 deep breaths",
      "4-7-8 breathing",
      "Box breathing, 4s each",
    ],
  },
  posture: {
    label: "Posture",
    activities: [
      "Sit up straight",
      "Straighten your back",
      "Open your chest, deep breath",
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
