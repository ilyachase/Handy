import assert from "node:assert/strict";
import { captureDisplay, type CaptureOutcome } from "./dictionaryCapture";

// Echoes the key and its word, so each case shows which string it picked.
const t = (key: string, options?: Record<string, string>) =>
  options?.word ? `${key}|${options.word}` : key;

const cases: [CaptureOutcome, string, string][] = [
  [
    { kind: "added", word: "YClients" },
    "settings.advanced.customWords.capture.added|YClients",
    "success",
  ],
  [
    { kind: "duplicate", word: "Kimi" },
    "settings.advanced.customWords.duplicate|Kimi",
    "warning",
  ],
  [{ kind: "empty" }, "settings.advanced.customWords.capture.empty", "warning"],
  [
    { kind: "too_long" },
    "settings.advanced.customWords.capture.tooLong",
    "warning",
  ],
  [{ kind: "failed" }, "settings.advanced.customWords.capture.failed", "error"],
];

for (const [outcome, title, level] of cases) {
  assert.deepEqual(captureDisplay(outcome, t), { title, level });
}

console.log("dictionaryCapture: all cases pass");
