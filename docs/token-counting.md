# Token Counting

This document explains how token counting is implemented inside `src/services/tokenizer.ts` to compute accurate prompt weight metric details for LLMs before data is copied.

---

## Technical Overview

The tokenization service counts the raw tokens in the generated clipboard payload. To do this, it integrates with the Byte-Pair Encoding (BPE) algorithm using the `js-tiktoken` library, targeting the `gpt-4o` vocabulary weights.

---

## 1. Lazy Loading & Dynamic Imports

To keep the VS Code extension responsive, the tokenizer uses a lazy-loading strategy for its external dependency:

* **Startup Speed Protection:** Loading heavy parsing libraries globally at activation slows down extension startup. By wrapping the import inside the execution thread of `countTokens`, the extension starts instantly.
* **Module Caching:** The library is loaded only once. On the first run, the system fetches the module and caches it in a shared variable:

```typescript
let encoder: TokenEncoder | undefined;

export async function countTokens(text: string): Promise<number> {
  if (!encoder) {
    const { encodingForModel } = await import("js-tiktoken");
    encoder = encodingForModel("gpt-4o");
  }
  return encoder.encode(text).length;
}

```

---

## 2. GPT-4o Tokenizer Target

The service uses the `gpt-4o` model tokenizer weights:

* **The `o200k_base` Vocabulary:** Modern frontier models (like GPT-4o, GPT-4o-mini, and subsequent reasoning engines) use the `o200k_base` tokenizer.
* **Compression Efficiency:** The `o200k_base` vocabulary is significantly larger and more efficient at compressing code scripts, non-English text, and structural formatting characters than older `cl100k_base` (GPT-4) tokenizers.
* **Practical Accuracy:** This ensures that the token counts displayed in the toast notification closely match the actual context window consumption calculated by the LLM providers.

---

## 3. String Parsing Execution

The process runs in three main steps:

1. **String Assembly:** The formatter outputs the final formatted text stream.
2. **Array Encoding:** The system calls `encoder.encode(text)`. The library maps the character sequences directly into an array of integers representing specific tokens.
3. **Length Extraction:** The token count is computed by accessing the `.length` property of the resulting array, which is then formatted with local digit grouping separators (e.g., `12,450`) for the user interface.