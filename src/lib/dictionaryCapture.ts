// Result of the "add selection to custom words" hotkey (fork feature), emitted
// by `dictionary_capture.rs` to the settings window and the recording overlay.
export type CaptureOutcome =
  | { kind: "added"; word: string }
  | { kind: "duplicate"; word: string }
  | { kind: "empty" }
  | { kind: "too_long" }
  | { kind: "failed" };

export type CaptureLevel = "success" | "warning" | "error";

type Translate = (key: string, options?: Record<string, string>) => string;

/** The text and level both the settings toast and the overlay pill show. */
export function captureDisplay(
  outcome: CaptureOutcome,
  t: Translate,
): { title: string; level: CaptureLevel } {
  switch (outcome.kind) {
    case "added":
      return {
        title: t("settings.advanced.customWords.capture.added", {
          word: outcome.word,
        }),
        level: "success",
      };
    case "duplicate":
      return {
        title: t("settings.advanced.customWords.duplicate", {
          word: outcome.word,
        }),
        level: "warning",
      };
    case "empty":
      return {
        title: t("settings.advanced.customWords.capture.empty"),
        level: "warning",
      };
    case "too_long":
      return {
        title: t("settings.advanced.customWords.capture.tooLong"),
        level: "warning",
      };
    case "failed":
      return {
        title: t("settings.advanced.customWords.capture.failed"),
        level: "error",
      };
  }
}
