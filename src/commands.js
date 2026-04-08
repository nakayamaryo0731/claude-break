import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawn } from "node:child_process";
import {
  initConfig,
  loadConfig,
  saveConfig,
  loadState,
  saveState,
  loadPid,
  clearPid,
  savePid,
  paths,
} from "./config.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * cc-fit init: Set up hooks in Claude Code settings and create default config.
 */
export function cmdInit() {
  // 1. Create default config
  const config = initConfig();
  console.log(`[cc-fit] Config created at ${paths.CONFIG_PATH}`);

  // 2. Inject hooks into Claude Code settings
  const claudeSettingsPath = join(homedir(), ".claude", "settings.json");
  let settings = {};
  if (existsSync(claudeSettingsPath)) {
    try {
      settings = JSON.parse(readFileSync(claudeSettingsPath, "utf-8"));
    } catch {
      console.error("[cc-fit] Warning: Could not parse existing Claude settings. Creating new.");
    }
  }

  if (!settings.hooks) settings.hooks = {};

  const ccFitHooks = {
    UserPromptSubmit: [
      { hooks: [{ type: "command", command: "cc-fit start", async: true }] },
    ],
    Stop: [
      { hooks: [{ type: "command", command: "cc-fit stop --reason=completed", async: true }] },
    ],
    Notification: [
      { hooks: [{ type: "command", command: "cc-fit stop --reason=needs-input", async: true }] },
    ],
  };

  // Merge: add cc-fit hooks without removing existing hooks
  for (const [event, hookEntries] of Object.entries(ccFitHooks)) {
    if (!settings.hooks[event]) {
      settings.hooks[event] = hookEntries;
    } else {
      // Check if cc-fit hook already exists
      const hasCcFit = settings.hooks[event].some((entry) =>
        entry.hooks?.some((h) => h.command?.startsWith("cc-fit"))
      );
      if (!hasCcFit) {
        settings.hooks[event].push(...hookEntries);
      }
    }
  }

  // Ensure ~/.claude directory exists
  const claudeDir = join(homedir(), ".claude");
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2) + "\n");
  console.log(`[cc-fit] Hooks added to ${claudeSettingsPath}`);
  console.log("[cc-fit] Setup complete! cc-fit will now run during Claude Code tasks.");
}

/**
 * cc-fit start: Kill existing timer if any, then spawn a detached timer worker.
 */
export function cmdStart() {
  const config = loadConfig();
  if (!config.enabled) {
    return;
  }

  // Kill existing timer process
  const existingPid = loadPid();
  if (existingPid) {
    try {
      process.kill(existingPid, "SIGTERM");
    } catch {
      // Process already dead
    }
  }

  // Preserve start time from previous timer (don't reset elapsed time)
  // Clear pendingStop to cancel any debounced stop
  const state = loadState();
  const startedAt = state.startedAt || Date.now();
  saveState({ startedAt, lastCategory: state.lastCategory ?? null });

  // Spawn detached timer worker so it survives after this process exits
  const workerPath = join(__dirname, "timer-worker.js");
  const child = spawn("node", [workerPath], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

/**
 * cc-fit stop: Write a pending stop marker. The timer worker handles debounce.
 * This command exits immediately — no setTimeout needed.
 */
export function cmdStop(reason) {
  saveState({ ...loadState(), pendingStop: Date.now(), stopReason: reason });
}

/**
 * cc-fit config: Show current config.
 */
export function cmdConfig() {
  const config = loadConfig();
  console.log(JSON.stringify(config, null, 2));
}

/**
 * cc-fit categories: List available activity categories.
 */
export function cmdCategories() {
  const config = loadConfig();
  const activities = config.activities;
  for (const [key, cat] of Object.entries(activities)) {
    console.log(`\n[${cat.label}] (${key})`);
    for (const a of cat.activities) {
      console.log(`  - ${a}`);
    }
  }
}

/**
 * cc-fit disable: Disable notifications.
 */
export function cmdDisable() {
  const config = loadConfig();
  config.enabled = false;
  saveConfig(config);
  console.log("[cc-fit] Disabled. Run `cc-fit enable` to re-enable.");

  // Also kill running timer
  const pid = loadPid();
  if (pid) {
    try { process.kill(pid, "SIGTERM"); } catch {}
    clearPid();
  }
}

/**
 * cc-fit enable: Enable notifications.
 */
export function cmdEnable() {
  const config = loadConfig();
  config.enabled = true;
  saveConfig(config);
  console.log("[cc-fit] Enabled.");
}

/**
 * cc-fit uninstall: Remove hooks from Claude Code settings.
 */
export function cmdUninstall() {
  const claudeSettingsPath = join(homedir(), ".claude", "settings.json");
  if (!existsSync(claudeSettingsPath)) {
    console.log("[cc-fit] No Claude settings found.");
    return;
  }

  let settings;
  try {
    settings = JSON.parse(readFileSync(claudeSettingsPath, "utf-8"));
  } catch {
    console.log("[cc-fit] Could not parse Claude settings.");
    return;
  }

  if (settings.hooks) {
    for (const event of Object.keys(settings.hooks)) {
      settings.hooks[event] = settings.hooks[event].filter(
        (entry) => !entry.hooks?.some((h) => h.command?.startsWith("cc-fit"))
      );
      if (settings.hooks[event].length === 0) {
        delete settings.hooks[event];
      }
    }
    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }
  }

  writeFileSync(claudeSettingsPath, JSON.stringify(settings, null, 2) + "\n");
  console.log("[cc-fit] Hooks removed from Claude Code settings.");

  // Kill running timer
  const pid = loadPid();
  if (pid) {
    try { process.kill(pid, "SIGTERM"); } catch {}
    clearPid();
  }
}
