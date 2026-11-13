import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../hooks/useSettings";
import { SettingContainer } from "../ui/SettingContainer";
import { Textarea } from "../ui/Textarea";

interface TranscriptionPromptProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

// Free-text context for models that accept a prompt (whisper family). The
// backend decides per model whether it is sent; models without a prompt slot
// ignore it. Saved on blur, like the other text settings.
export const TranscriptionPrompt: React.FC<TranscriptionPromptProps> =
  React.memo(({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();
    const saved = getSetting("transcription_prompt") ?? "";
    const [value, setValue] = useState(saved);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
      if (!dirty) setValue(saved);
    }, [saved, dirty]);

    const handleBlur = useCallback(() => {
      if (!dirty) return;
      const trimmed = value.trim();
      updateSetting(
        "transcription_prompt",
        trimmed.length > 0 ? trimmed : null,
      );
      setDirty(false);
    }, [dirty, value, updateSetting]);

    return (
      <SettingContainer
        title={t("settings.advanced.transcriptionPrompt.title")}
        description={t("settings.advanced.transcriptionPrompt.description")}
        descriptionMode={descriptionMode}
        grouped={grouped}
        layout="stacked"
      >
        <Textarea
          variant="compact"
          className="w-full"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setDirty(true);
          }}
          onBlur={handleBlur}
          placeholder={t("settings.advanced.transcriptionPrompt.placeholder")}
          disabled={isUpdating("transcription_prompt")}
        />
      </SettingContainer>
    );
  });
