# Architecture

This document provides a high-level overview of the architectural design, core modules, and data flow within the **Copy for AI** Visual Studio Code extension.

---

## Architectural Overview

The extension is designed as a lightweight, single-command utility using a decoupled, service-oriented architecture. Responsibilities are split cleanly between a central command orchestrator and independent service modules handling file system traversal, content transformation, tokenization, and clipboard manipulation.

```
┌────────────────────────────────────────────────────────┐
│                   VS Code Extension                    │
└───────────┬──────────────────────────────┬─────────────┘
            │ (Context Trigger)            │ (Command Registration)
            ▼                              ▼
┌───────────────────────┐      ┌─────────────────────────┐
│ Explorer Context Menu │      │     Command Palette     │
└───────────┬───────────┘      └───────────┬─────────────┘
            │                              │
            └───────────────┬──────────────┘
                            ▼
               ┌────────────────────────┐
               │   src/commands/copy    │ (Orchestrator)
               └────────────┬───────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌────────────────┐  ┌───────────────┐  ┌───────────────┐
│ fileCollector  │  │   formatter   │  │   tokenizer   │
└────────────────┘  └───────────────┘  └───────────────┘

```

---

## Core Component Modules

### 1. Extension Lifecycle Controller (`src/extension.ts`)

* **Role:** Acts as the official entry point for the extension process.
* **Responsibilities:**
* Registers the unique execution handle `copyForAI.copy` into VS Code’s subscription subsystem during extension activation.
* Binds the registered command ID directly to the command orchestration logic.



### 2. Command Orchestrator (`src/commands/copy.ts`)

* **Role:** The centralized controller managing the application workflow state and runtime lifecycle execution.
* **Responsibilities:**
* Accepts raw target parameters (`Uri` contexts) handed down from the active VS Code user interaction wrapper.
* Coordinates sequential control execution through the underlying service infrastructure.
* Presents success metrics (file totals and token size counts) or captures exceptions to pass down to native UI alert bubbles.



### 3. File Processing Layer (`src/services/fileCollector.ts`)

* **Role:** Handles multi-source filesystem traversal, filtering, and object ingestion.
* **Responsibilities:**
* Evaluates input signatures to prioritize active text fields vs. multi-selected directory tree scopes.
* Traverses subfolders recursively using asynchronous workspace filesystem APIs.
* Inspects binary flags (via null-byte tracking arrays) to isolate readable source scripts from raw compiled files.
* Normalizes and alphabetically sorts extracted content nodes using deterministic path keys.



### 4. Format Engine (`src/services/formatter.ts`)

* **Role:** Structural data transformer.
* **Responsibilities:**
* Converts structured runtime data representations into single plain-text streams optimized for prompt parsing.
* Encapsulates each file with standard file boundary headers and footers matching `===== FILE: <path> =====`.



### 5. Token Calculation Service (`src/services/tokenizer.ts`)

* **Role:** Text token payload evaluation.
* **Responsibilities:**
* Leverages the `gpt-4o` token counting rules via the `js-tiktoken` Byte-Pair Encoding library.
* Defers library loading using dynamic imports until execution time to safeguard initial extension startup speeds.



### 6. System Clipboard Bridge (`src/services/clipboard.ts`)

* **Role:** Native operating system access adapter.
* **Responsibilities:**
* Interfaces directly with the internal `vscode.env.clipboard` service payload pipeline to set string contents.



---

## Technical Stack & Configuration Boundaries

* **Runtime Dependency:** `js-tiktoken` (used exclusively for local string token analysis).
* **Compilation / Bundling Target:** Managed via `esbuild.js` outputting to `./dist/extension.js` for optimized runtime packaging.
* **Target Engine API Compatibility:** Configured for `vscode` version `^1.125.0` or newer.