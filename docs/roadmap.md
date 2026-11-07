# Roadmap

This document outlines the planned releases, features, and technical milestones for the **Copy for AI** extension.

---

## Short-Term Milestones (v0.1.0 - v0.2.0)

### 1. Robust Exclusion & Ignoring Engine

* **Goal:** Provide native support for project-specific ignore files.
* **Planned Features:**
* Read and parse local `.aiignore` or standard `.gitignore` rules in the workspace.
* Avoid reading and processing blacklisted file trees (e.g., `node_modules`, `.git`, lockfiles) to boost traversal performance.



### 2. User Configuration Framework (`package.json` contributions)

* **Goal:** Allow users to customize file processing and outputs.
* **Planned Features:**
* `copyForAI.maxFileSize`: Cap the size of parsed text files (e.g., skip files larger than 1MB).
* `copyForAI.ignoredExtensions`: Allow explicit file extension blacklisting.
* `copyForAI.customHeaderPattern`: Allow customization of the generated divider strings.



### 3. Selection Optimization

* **Goal:** Refine resource discovery workflows.
* **Planned Features:**
* Add a keyboard shortcut mapping (e.g., `Cmd+Alt+C` / `Ctrl+Alt+C`) to instantly run the copy process on selected items.



---

## Medium-Term Milestones (v0.3.0 - v0.5.0)

### 1. Token Usage Warning Thresholds

* **Goal:** Help users stay within LLM context limits before copying.
* **Planned Features:**
* Display visual warning overlays or confirmations if the total calculated token size exceeds user-defined limits (e.g., warning at 50,000+ tokens).



### 2. Smart Formatting Templates

* **Goal:** Add formatting options designed for different AI models.
* **Planned Features:**
* Implement XML-tag structural formatting options alongside the default markdown-style divider formatting.
* Generate a directory tree layout representation at the top of the copied clipboard text.



---

## Long-Term Milestones (v1.0.0+)

### 1. Embedded Compact UI Panel

* **Goal:** Give users visual control over their active selections.
* **Planned Features:**
* Provide a custom sidebar View container list showing currently queued files.
* Enable users to quickly toggle checkboxes next to files to add or remove them from the payload.