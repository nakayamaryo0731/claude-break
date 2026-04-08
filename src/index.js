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
    console.log(`cc-fit - Claude Code fitness companion

Usage:
  cc-fit init         Set up Claude Code hooks and create config
  cc-fit start        Start activity timer (called by hook)
  cc-fit stop         Stop timer and send callback (called by hook)
  cc-fit config       Show current configuration
  cc-fit categories   List activity categories
  cc-fit disable      Temporarily disable notifications
  cc-fit enable       Re-enable notifications
  cc-fit uninstall    Remove hooks from Claude Code settings

Claude が働き、あなたは健康に。`);
    break;
}
