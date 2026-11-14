import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTranslation } from "react-i18next";
import { captureDisplay, type CaptureOutcome } from "@/lib/dictionaryCapture";
import { notify } from "@/stores/noticeStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function useDictionaryCapture() {
  const { t } = useTranslation();
  const refreshSettings = useSettingsStore((state) => state.refreshSettings);

  useEffect(() => {
    const unlisten = listen<CaptureOutcome>(
      "dictionary-capture-result",
      ({ payload }) => {
        if (payload.kind === "added") void refreshSettings();
        const { title, level } = captureDisplay(payload, t);
        notify({ title, level: level === "success" ? "info" : level });
      },
    );
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, [t, refreshSettings]);
}
