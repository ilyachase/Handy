import assert from "node:assert/strict";
import { hasProcessedText, visibleHistoryText } from "./historyText";

const plain = { transcription_text: "raw", post_processed_text: null };
const blank = { transcription_text: "raw", post_processed_text: "  " };
const processed = { transcription_text: "raw", post_processed_text: "clean" };

// Without post-processing the original is shown whatever the toggle says.
assert.equal(hasProcessedText(plain), false);
assert.equal(visibleHistoryText(plain, "processed"), "raw");
assert.equal(visibleHistoryText(plain, "original"), "raw");

// A blank LLM result counts as no result.
assert.equal(hasProcessedText(blank), false);
assert.equal(visibleHistoryText(blank, "processed"), "raw");

// With post-processing the default view is what was pasted...
assert.equal(hasProcessedText(processed), true);
assert.equal(visibleHistoryText(processed, "processed"), "clean");
// ...and the toggle switches back to the original transcript.
assert.equal(visibleHistoryText(processed, "original"), "raw");
