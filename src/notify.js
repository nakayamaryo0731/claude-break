import { execFileSync } from "node:child_process";
import { platform } from "node:os";

/**
 * Send a desktop notification.
 * title: "Claude Break"
 * subtitle: category label (e.g. "Exercise")
 * message: activity text
 */
export function sendNotification(subtitle, message) {
  const title = "Claude Break";
  const os = platform();
  if (os === "darwin") {
    try {
      execFileSync("osascript", [
        "-e",
        `display notification "${message}" with title "${title}" subtitle "${subtitle}" sound name "Glass"`,
      ], { stdio: "ignore" });
    } catch {
      // ignore errors
    }
  } else if (os === "linux") {
    try {
      execFileSync("notify-send", [`${title} — ${subtitle}`, message], { stdio: "ignore" });
    } catch {
      // notify-send may not be installed
    }
  } else if (os === "win32") {
    try {
      execFileSync("powershell", [
        "-Command",
        `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); ` +
        `$n = New-Object System.Windows.Forms.NotifyIcon; ` +
        `$n.Icon = [System.Drawing.SystemIcons]::Information; ` +
        `$n.Visible = $true; ` +
        `$n.ShowBalloonTip(5000, '${title} - ${subtitle}', '${message}', 'Info');`,
      ], { stdio: "ignore" });
    } catch {
      // ignore errors
    }
  }
}

/**
 * Use macOS `say` command to read the message aloud.
 * No-op on non-macOS platforms.
 */
export function sayMessage(message) {
  if (platform() !== "darwin") return;
  try {
    execFileSync("say", [message], { stdio: "ignore" });
  } catch {
    // ignore errors
  }
}
