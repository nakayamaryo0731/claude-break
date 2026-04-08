#!/usr/bin/env node
/**
 * Timer worker process. Spawned by `cc-fit start` and runs detached.
 * Sends activity notifications at configured intervals.
 * Also monitors for pending stop requests and handles debounce.
 */
import { loadConfig, loadState, saveState, savePid, clearPid, appendLog } from "./config.js";
import { pickActivity } from "./activities.js";
import { sendNotification, sayMessage } from "./notify.js";

const config = loadConfig();
if (!config.enabled) process.exit(0);

const debounceSec = config.debounceSec ?? 5;
const firstDelaySec = (config.timings ?? [5])[0];
const intervalSec = config.intervalSec ?? 30;

savePid(process.pid);

let state = loadState();
if (!state.startedAt) {
  state.startedAt = Date.now();
  state.lastCategory = null;
  saveState(state);
}

let lastCategory = state.lastCategory;

// Calculate next notification time, skipping past any elapsed time
const elapsedAtStart = Math.floor((Date.now() - state.startedAt) / 1000);
let nextNotificationSec;
if (elapsedAtStart < firstDelaySec) {
  nextNotificationSec = firstDelaySec;
} else {
  // Already past first delay — schedule next from now
  const sinceFirst = elapsedAtStart - firstDelaySec;
  const intervals = Math.ceil(sinceFirst / intervalSec);
  nextNotificationSec = firstDelaySec + intervals * intervalSec;
}

function notify() {
  const elapsedSec = Math.floor((Date.now() - state.startedAt) / 1000);
  const result = pickActivity(elapsedSec, lastCategory, config);

  if (result) {
    const { category, label, activity } = result;
    sendNotification(label, activity);
    appendLog({ category, activity });

    if (config.say) {
      sayMessage(activity);
    }

    lastCategory = category;
    state.lastCategory = category;
    saveState(state);
  }

  nextNotificationSec += intervalSec;
}

function checkPendingStop() {
  const currentState = loadState();
  if (!currentState.pendingStop) return;

  const elapsed = (Date.now() - currentState.pendingStop) / 1000;
  if (elapsed >= debounceSec) {
    saveState({});
    clearPid();
    process.exit(0);
  }
}

function mainLoop() {
  checkPendingStop();

  // Don't notify while a stop is pending (Claude likely finished, user is interacting)
  const currentState = loadState();
  const elapsedSec = Math.floor((Date.now() - state.startedAt) / 1000);
  if (currentState.pendingStop) {
    // Skip past any missed notifications so they don't burst when stop clears
    while (nextNotificationSec <= elapsedSec) {
      nextNotificationSec += intervalSec;
    }
  } else if (elapsedSec >= nextNotificationSec) {
    notify();
  }

  setTimeout(mainLoop, 1000);
}

mainLoop();

process.on("SIGTERM", () => {
  clearPid();
  process.exit(0);
});

process.on("SIGINT", () => {
  clearPid();
  process.exit(0);
});
