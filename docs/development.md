# Development Guide

This document covers instructions for setting up, building, running, and validating the **Copy for AI** extension workspace locally.

---

## 1. Development Prerequisites

Ensure the following environments are configured on your machine before attempting to compile the extension codebase:

* **Node.js Runtime:** Version `v18.x` or newer recommended.
* **Visual Studio Code:** Client platform capable of parsing the target engine API boundaries (`^1.125.0`).

---

## 2. Project Bootstrapping

Clone the workspace repository locally, navigate to the target directory root, and run the dependency installation task:

```bash
npm install

```

This updates localized lock-files and generates your workspace node dependency tree (including `js-tiktoken`, `esbuild`, and `typescript`).

---

## 3. Workflow Build Scripts

The tool utilizes bundled scripts defined in `package.json` to handle validation, compilation, and bundling stages.

| Automation Target | Terminal Invocation command | Internal Process |
| --- | --- | --- |
| **Type Check Validation** | `npm run check-types` | Executes the compiler option `tsc --noEmit` to validate strict typing syntax. |
| **Code Style Linting** | `npm run lint` | Invokes `eslint src` to verify structural coding practices across all source text scripts. |
| **Local Continuous Compilation** | `npm run watch` | Spawns parallel processes watching source file revisions via `esbuild` and `tsc` structures. |
| **Production Distribution Pack** | `npm run package` | Sequentially builds code elements, applying the `--production` flag configuration in `esbuild.js`. |

---

## 4. Local Sandbox Testing and Debugging

You can test changes inside an isolated VS Code instance (Extension Development Host) by leveraging integrated debug profiles.

### Launch Lifecycle Step-by-Step

1. Launch VS Code inside your local project home workspace root folder.
2. Select the **Run and Debug** icon from the activity sidebar (or invoke keyboard hotkey `Ctrl+Shift+D` / `Cmd+Shift+D`).
3. Set the target drop-down configuration selection flag to **Run Extension**.
4. Press `F5` to spin up the local debug lifecycle engine.
5. A secondary instance of Visual Studio Code titled `[Extension Development Host]` will execute, natively running the local development build of the extension.

---

## 5. Automated Regression Test Execution

Testing suites are managed through the modern `@vscode/test-cli` infrastructure platform.

```bash
npm run test

```

### Execution Details

* Running this script invokes the `pretest` step hook, validating types, enforcing lint configurations, and tracking down source references.
* The test CLI provisions a sandboxed text-editor engine environment, targets compiled code targets located in the automated suite directories (`out/test`), and validates core command expectations using Assert assertions.