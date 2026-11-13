//! Add the text selected in any app to the custom words list (fork feature,
//! cjpais/Handy discussion #2259). The hotkey copies the selection, the word is
//! normalized like the Custom Words field does, and the user's clipboard is
//! restored afterwards.

use crate::settings;
use log::{info, warn};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// Same cap as the Custom Words input in settings.
pub const MAX_WORD_LEN: usize = 50;

/// Emitted to the main window, which shows the result as a toast and reloads
/// settings.
pub const RESULT_EVENT: &str = "dictionary-capture-result";

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "kind", content = "word", rename_all = "snake_case")]
pub enum CaptureOutcome {
    Added(String),
    Duplicate(String),
    Empty,
    TooLong,
    Failed,
}

/// Normalize a selection into a custom word: strip characters the Custom Words
/// field strips (`<>"'`), collapse whitespace, trim punctuation at both ends.
/// Returns the outcome without touching settings.
pub fn normalize_capture(raw: &str, existing: &[String]) -> CaptureOutcome {
    let cleaned: String = raw.chars().filter(|c| !"<>\"'".contains(*c)).collect();
    let collapsed = cleaned.split_whitespace().collect::<Vec<_>>().join(" ");
    let word = collapsed
        .trim_matches(|c: char| !c.is_alphanumeric())
        .to_string();
    if word.is_empty() {
        return CaptureOutcome::Empty;
    }
    if word.chars().count() > MAX_WORD_LEN {
        return CaptureOutcome::TooLong;
    }
    let lower = word.to_lowercase();
    if existing.iter().any(|w| w.to_lowercase() == lower) {
        return CaptureOutcome::Duplicate(word);
    }
    CaptureOutcome::Added(word)
}

/// Copy the selection, store the word, report the result. Runs on a worker
/// thread: it waits for the hotkey's modifiers to be released before sending
/// the copy shortcut, otherwise the target app would see e.g. Ctrl+Alt+Shift+C.
pub fn capture_selection(app: &AppHandle) {
    std::thread::sleep(std::time::Duration::from_millis(150));
    let outcome = match crate::clipboard::copy_selection(app) {
        Ok(Some(text)) => {
            let current = settings::get_settings(app);
            let outcome = normalize_capture(&text, &current.custom_words);
            if let CaptureOutcome::Added(word) = &outcome {
                let mut updated = current;
                updated.custom_words.push(word.clone());
                settings::write_settings(app, updated);
                info!("Added selected word to custom words");
            }
            outcome
        }
        Ok(None) => CaptureOutcome::Empty,
        Err(e) => {
            warn!("Copying the selection failed: {e}");
            CaptureOutcome::Failed
        }
    };
    let _ = app.emit(RESULT_EVENT, &outcome);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn existing(words: &[&str]) -> Vec<String> {
        words.iter().map(|w| w.to_string()).collect()
    }

    #[test]
    fn plain_word_is_added() {
        assert_eq!(
            normalize_capture("YClients", &[]),
            CaptureOutcome::Added("YClients".into())
        );
    }

    #[test]
    fn surrounding_space_and_punctuation_are_trimmed() {
        assert_eq!(
            normalize_capture("  «Kubernetes», \n", &[]),
            CaptureOutcome::Added("Kubernetes".into())
        );
        assert_eq!(
            normalize_capture("\"feature   branch\".", &[]),
            CaptureOutcome::Added("feature branch".into())
        );
        // Inner punctuation stays.
        assert_eq!(
            normalize_capture("CI/CD", &[]),
            CaptureOutcome::Added("CI/CD".into())
        );
    }

    #[test]
    fn empty_selection_is_rejected() {
        assert_eq!(normalize_capture("", &[]), CaptureOutcome::Empty);
        assert_eq!(normalize_capture("  ...  ", &[]), CaptureOutcome::Empty);
    }

    #[test]
    fn too_long_selection_is_rejected() {
        let long = "а".repeat(MAX_WORD_LEN + 1);
        assert_eq!(normalize_capture(&long, &[]), CaptureOutcome::TooLong);
        let max = "а".repeat(MAX_WORD_LEN);
        assert_eq!(normalize_capture(&max, &[]), CaptureOutcome::Added(max));
    }

    #[test]
    fn duplicate_ignores_case() {
        assert_eq!(
            normalize_capture("yclients", &existing(&["YClients"])),
            CaptureOutcome::Duplicate("yclients".into())
        );
    }
}
