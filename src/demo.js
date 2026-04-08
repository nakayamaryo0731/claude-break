#!/usr/bin/env node
/**
 * Demo mode: fixed notification sequence for recording.
 * Usage: node src/demo.js
 *
 * Sends notifications at fixed intervals with predetermined activities.
 * Run this, then start your screen recording.
 */
import { sendNotification } from "./notify.js";

const DEMO_SEQUENCE = [
  { delaySec: 10, subtitle: "Exercise", message: "Squats x10" },
  { delaySec: 15, subtitle: "Hydration", message: "Drink a glass of water" },
  { delaySec: 15, subtitle: "Eyes", message: "Look out the window for 20s" },
];

console.log("[demo] Starting in 10 seconds...");
console.log("[demo] Notifications will fire at: 10s, 25s, 40s");
console.log("[demo] Press Ctrl+C to stop\n");

let elapsed = 0;
const interval = setInterval(() => {
  elapsed++;
  process.stdout.write(`\r[demo] ${elapsed}s elapsed`);
}, 1000);

let cumulativeDelay = 0;
for (const item of DEMO_SEQUENCE) {
  cumulativeDelay += item.delaySec;
  const delay = cumulativeDelay;
  setTimeout(() => {
    console.log(`\n[demo] 🔔 ${item.subtitle}: ${item.message}`);
    sendNotification(item.subtitle, item.message);
  }, delay * 1000);
}

// Auto-exit after all notifications
const totalTime = DEMO_SEQUENCE.reduce((sum, i) => sum + i.delaySec, 0) + 3;
setTimeout(() => {
  clearInterval(interval);
  console.log("\n[demo] Done!");
  process.exit(0);
}, totalTime * 1000);
