#!/bin/bash
#
# Claude Break demo recording script
#
# Simulates a Claude Code session with notifications.
# Run from any terminal — no fullscreen needed.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/assets"
VIDEO_FILE="$OUTPUT_DIR/demo.mov"
GIF_FILE="$OUTPUT_DIR/demo.gif"
DURATION=40
SCREEN_DEVICE="2"

mkdir -p "$OUTPUT_DIR"

# Clean up
kill "$(cat ~/.claude-break/timer.pid 2>/dev/null)" 2>/dev/null || true
rm -f ~/.claude-break/state.json ~/.claude-break/timer.pid ~/.claude-break/log.jsonl

echo "Recording starts in 2 seconds..."
sleep 2

# Start screen recording
ffmpeg -y -f avfoundation -framerate 15 -i "$SCREEN_DEVICE" -t "$DURATION" \
  -vf "scale=1280:-2" -pix_fmt yuv420p \
  "$VIDEO_FILE" 2>/tmp/claude-break-ffmpeg.log &
FFMPEG_PID=$!
sleep 1

# Simulate claude code prompt
echo -e "\033[1;35m>\033[0m Write a Python function that implements binary search"
echo ""
sleep 1

# Start claude-break timer (this is what the hook would do)
claude-break start

# Simulate claude code output appearing gradually
sleep 2
echo -e "\033[2m  Reading project files...\033[0m"
sleep 2
echo -e "\033[2m  Writing src/search.py...\033[0m"
sleep 3

# Python output
echo ""
echo -e "\033[33m  src/search.py\033[0m"
echo ""

# Type out code slowly
code='def binary_search(arr, target):
    """Return index of target in sorted array, or -1 if not found."""
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1'

while IFS= read -r line; do
  echo "  $line"
  sleep 0.3
done <<< "$code"

echo ""
sleep 2
echo -e "\033[32m  ✓ Created src/search.py\033[0m"
sleep 2
echo ""
echo -e "\033[2m  Done in 28.3s\033[0m"

# Stop timer
claude-break stop --reason=completed

# Wait for recording to finish
wait $FFMPEG_PID 2>/dev/null || true

echo ""
echo "[record] Recording complete"
echo "[record] Converting to GIF..."

ffmpeg -y -i "$VIDEO_FILE" \
  -vf "fps=10,scale=800:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  "$GIF_FILE" 2>/tmp/claude-break-gif.log

echo "[record] Done!"
ls -lh "$GIF_FILE"
