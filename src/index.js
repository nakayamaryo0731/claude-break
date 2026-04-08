#!/usr/bin/env node

import {
  cmdInit,
  cmdStart,
  cmdStop,
  cmdConfig,
  cmdCategories,
  cmdDisable,
  cmdEnable,
  cmdUninstall,
} from "./commands.js";

const [command, ...args] = process.argv.slice(2);

function parseArgs(args) {
  const result = {};
  for (const arg of args) {
    const match = arg.match(/^--(\w[\w-]*)(?:=(.*))?$/);
    if (match) {
      result[match[1]] = match[2] ?? true;
    }
  }
  return result;
}

const opts = parseArgs(args);

switch (command) {
  case "init":
    cmdInit();
    break;
  case "start":
    cmdStart();
    break;
  case "stop":
    cmdStop(opts.reason ?? "completed");
    break;
  case "config":
    cmdConfig();
    break;
  case "categories":
    cmdCategories();
    break;
  case "disable":
    cmdDisable();
    break;
  case "enable":
    cmdEnable();
    break;
  case "uninstall":
    cmdUninstall();
    break;
  default:
    console.log(`claude-break - Claude Code fitness companion

Usage:
  claude-break init         Set up Claude Code hooks and create config
  claude-break start        Start activity timer (called by hook)
  claude-break stop         Stop timer and send callback (called by hook)
  claude-break config       Show current configuration
  claude-break categories   List activity categories
  claude-break disable      Temporarily disable notifications
  claude-break enable       Re-enable notifications
  claude-break uninstall    Remove hooks from Claude Code settings

Claude works. You get healthy.`);
    break;
}
