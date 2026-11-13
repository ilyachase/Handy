// Which text a History entry shows and copies (fork feature, cjpais/Handy
// discussion #2260). Entries with a post-processed result show it by default,
// since that is what was pasted; the original transcript is one click away.

export type HistoryTextVariant = "processed" | "original";

interface HistoryTexts {
  transcription_text: string;
  post_processed_text: string | null;
}

export function hasProcessedText(entry: HistoryTexts): boolean {
  return (entry.post_processed_text ?? "").trim().length > 0;
}

export function visibleHistoryText(
  entry: HistoryTexts,
  variant: HistoryTextVariant,
): string {
  if (variant === "processed" && hasProcessedText(entry)) {
    return entry.post_processed_text as string;
  }
  return entry.transcription_text;
}
