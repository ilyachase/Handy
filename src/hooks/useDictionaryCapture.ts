import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTranslation } from "react-i18next";
import { notify } from "@/stores/noticeStore";
import { useSettingsStore } from "@/stores/settingsStore";

// Result of the "add selection to custom words" hotkey, emitted by
// `dictionary_capture.rs`.
type CaptureOutcome =
  | { kind: "added"; word: string }
  | { kind: "duplicate"; word: string }
  | { kind: "empty" }
  | { kind: "too_long" }
  | { kind: "failed" };

export function useDictionaryCapture() {
  const { t } = useTranslation();
  const refreshSettings = useSettingsStore((state) => state.refreshSettings);

  useEffect(() => {
    const unlisten = listen<CaptureOutcome>(
      "dictionary-capture-result",
      ({ payload }) => {
        switch (payload.kind) {
          case "added":
            void refreshSettings();
            notify({
              title: t("settings.advanced.customWords.capture.added", {
                word: payload.word,
              }),
              level: "info",
            });
            break;
          case "duplicate":
            notify({
              title: t("settings.advanced.customWords.duplicate", {
                word: payload.word,
              }),
              level: "warning",
            });
            break;
          case "empty":
            notify({
              title: t("settings.advanced.customWords.capture.empty"),
              level: "warning",
            });
            break;
          case "too_long":
            notify({
              title: t("settings.advanced.customWords.capture.tooLong"),
              level: "warning",
            });
            break;
          case "failed":
            notify({
              title: t("settings.advanced.customWords.capture.failed"),
              level: "error",
            });
            break;
        }
      },
    );
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, [t, refreshSettings]);
}
