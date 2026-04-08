import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { DEFAULT_ACTIVITIES } from "./activities.js";

const CC_FIT_DIR = join(homedir(), ".cc-fit");
const CONFIG_PATH = join(CC_FIT_DIR, "config.json");
const STATE_PATH = join(CC_FIT_DIR, "state.json");
const PID_PATH = join(CC_FIT_DIR, "timer.pid");
const LOG_PATH = join(CC_FIT_DIR, "log.jsonl");

export const paths = { CC_FIT_DIR, CONFIG_PATH, STATE_PATH, PID_PATH, LOG_PATH };

const DEFAULT_CONFIG = {
  enabled: true,
  debounceSec: 5,
  say: false,
  activities: DEFAULT_ACTIVITIES,
  // Notification timing: seconds after start
  timings: [5],
  intervalSec: 30, // after initial notification, repeat every N seconds
};

export function ensureDir() {
  if (!existsSync(CC_FIT_DIR)) {
    mkdirSync(CC_FIT_DIR, { recursive: true });
  }
}

export function loadConfig() {
  ensureDir();
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return { ...DEFAULT_CONFIG, ...raw };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config) {
  ensureDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

export function initConfig() {
  ensureDir();
  if (!existsSync(CONFIG_PATH)) {
    saveConfig(DEFAULT_CONFIG);
  }
  return loadConfig();
}

// State: persists start time across process restarts
export function loadState() {
  if (!existsSync(STATE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export function saveState(state) {
  ensureDir();
  writeFileSync(STATE_PATH, JSON.stringify(state) + "\n");
}

// PID management
export function savePid(pid) {
  ensureDir();
  writeFileSync(PID_PATH, String(pid));
}

export function loadPid() {
  if (!existsSync(PID_PATH)) return null;
  try {
    return parseInt(readFileSync(PID_PATH, "utf-8").trim(), 10);
  } catch {
    return null;
  }
}

export function clearPid() {
  if (existsSync(PID_PATH)) {
    try { writeFileSync(PID_PATH, ""); } catch {}
  }
}

// Log
export function appendLog(entry) {
  ensureDir();
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + "\n";
  appendFileSync(LOG_PATH, line);
}
