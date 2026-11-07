# Command Flow

This document details the step-by-step execution path of the `copyForAI.copy` command, showing how data moves from user interaction to the system clipboard.

---

## Process Flowchart

```
 [User Trigger]
        │
        ├─► Explorer Context Menu (Single or Multi-selection)
        └─► Command Palette (Active Editor Focus)
        │
        ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Command Invocation                                  │
 │    - Triggered in src/commands/copy.ts                 │
 │    - Captures primary Uri and selected Uri arrays      │
 └──────────────────────┬─────────────────────────────────┘
                        │
                        ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Resource Resolution & Collection                   │
 │    - Calls collectFiles(uri, selected)                 │
 │    - Resolves Workspace files, drops binary formats    │
 │    - Sorts file array alphabetically by path           │
 └──────────────────────┬─────────────────────────────────┘
                        │
                        ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Context Formatting                                  │
 │    - Calls formatFiles(files)                          │
 │    - Joins files with standard boundaries              │
 └──────────────────────┬─────────────────────────────────┘
                        │
                        ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Token Calculation                                   │
 │    - Calls countTokens(output)                         │
 │    - Lazily imports 'js-tiktoken' if uninitialized     │
 │    - Computes GPT-4o model token metrics               │
 └──────────────────────┬─────────────────────────────────┘
                        │
                        ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. Clipboard Integration & UI Output                  │
 │    - Invokes copyToClipboard(output)                   │
 │    - Sets data into vscode.env.clipboard               │
 │    - Dispatches a toast notification with statistics   │
 └────────────────────────────────────────────────────────┘

```

---

## Detailed Stage Breakdown

### Stage 1: Command Invocation

The flow starts when `copyForAI.copy` is invoked. VS Code passes parameters to `copyCommand(uri, selected)` depending on how the user triggered the action:

* **Explorer Context Menu:** `uri` holds the element right-clicked. `selected` provides an array of all highlighted filesystem elements.
* **Command Palette:** Both parameters are undefined. The command targets the active text editor document workspace window.

### Stage 2: Resource Resolution & Collection

The execution delegates selection resolving to `collectFiles`:

1. If `selected` is populated, the collector walks each entry.
2. If only a single `uri` is present, it targets that item.
3. If no parameters exist, it attempts to read the active editor context.
4. Recursive operations resolve subdirectories down to individual file items.
5. All gathered text contents are stored as temporary `CollectedFile` objects.
6. The collection array is sorted alphabetically using `relativePath.localeCompare(b.relativePath)` to keep outputs stable.

### Stage 3: Context Formatting

The sorted `CollectedFile[]` array is structured into a raw string via `formatFiles`. The formatter maps over each file element, generating structured dividers:

```text
===== FILE: src/extension.ts =====

[source code here]

===== END FILE: src/extension.ts =====

```

Each file block is concatenated using dual newline characters (`\n\n`) to optimize layout clarity for LLM context windows.

### Stage 4: Token Calculation

Before finishing, the raw output string is passed to `countTokens`:

1. The service checks if a shared, single instance of the `gpt-4o` encoder is allocated.
2. If not, it executes an asynchronous dynamic import (`await import("js-tiktoken")`) to load the tokenizer.
3. The string is processed into byte-pair tokens, and the array length is counted.

### Stage 5: Clipboard Integration & UI Output

The finalized payload is transferred to the system:

1. `copyToClipboard` pushes the payload to `vscode.env.clipboard.writeText`.
2. A status toast displays the results: `Copied X files (Y tokens)` where $Y$ uses local string digit grouping separators (e.g., `1,250`).
3. If an unhandled exception occurs at any execution block, the process halts and displays an error alert detailing the failure.