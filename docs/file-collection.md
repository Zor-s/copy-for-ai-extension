# File Collection

This document explains the file collection engine inside `src/services/fileCollector.ts`, which gathers, traverses, and sanitizes file resources.

---

## Technical Overview

The file collection system accepts workspace contextual entries (`vscode.Uri`) from user commands, recursively traverses directories, identifies and excludes binary files, and extracts content into a sorted list of data objects.

```
       [collectFiles Input]
                │
        ┌───────┴──────────┐
        ▼                  ▼
[URI List / Focus]   [No Parameters]
        │                  │
        │                  ▼
        │        [Active Text Editor?]
        │         ├─► No  ──► Throw "No active editor."
        │         └─► Yes ──► Read active document buffer
        ▼
[Resolve Resources]
  - Single File ──► Verify bytes ──► Keep / Discard
  - Directory  ──► Recursive walk ──► Read Files
        │
        ▼
 [Sort Collection] ──► alphabetical sort by relativePath
        │
        ▼
  [Return Array]

```

---

## 1. Resource Ingestion Flow

The entry function `collectFiles(uri, selected)` normalizes the inputs into a flat collection of files:

* **Multi-selection (`selected` is populated):** The command iterates over all selected items in the Explorer tree, calling `collectUri` on each element.
* **Single-item context (`uri` is provided):** The command processes only the specific folder or file that was right-clicked.
* **Fallback state (no arguments):** If both parameters are missing, the collector targets the open active text editor and extracts its current buffer directly using `editor.document.getText()`.

---

## 2. Directory Traversal

When a target URI points to a folder (`vscode.FileType.Directory`), the collector starts a recursive process:

1. **Directory Discovery:** It reads directory contents using `vscode.workspace.fs.readDirectory`.
2. **Breadth/Depth Sorting:** For each entry, it constructs child paths using `vscode.Uri.joinPath`.
* If the entry is a nested `FileType.Directory`, the system recursively executes `collectFolder` and flattens the returned array using spread operators (`...`).
* If the entry is a `FileType.File`, it attempts to process it through the reader.



---

## 3. Binary File Detection

To prevent raw binary structures (like images, archives, or compiled objects) from corrupting clipboard data, the collector uses a binary detection safeguard in `readFile()`:

* **Byte Scanning:** Instead of relying on fragile file extension lists, the system reads raw file data using `vscode.workspace.fs.readFile`.
* **Null-Byte Checking:** It scans the resulting Uint8Array for a null byte (`0`).
* **Action:** If a null byte is found, the file is identified as binary, skipped, and logged with a console warning. Non-binary files are converted back to a UTF-8 string using `TextDecoder`.

---

## 4. Sorting & Output Structures

Before returning the array of `CollectedFile` objects, the collector runs a sorting process:

```typescript
files.sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath)
);

```

Sorting alphabetically by `relativePath` ensures that formatting engines receive a predictable file hierarchy, regardless of how the files were selected in the VS Code UI.

---