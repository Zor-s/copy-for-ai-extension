import * as vscode from "vscode";
import { copyToClipboard } from "../services/clipboard";
import { collectFiles } from "../services/fileCollector";
import {
    generateDirectoryTree,
    generateLimitedDirectoryTree,
} from "../services/directoryTree";
import { formatFiles } from "../services/formatter";
import { countTokens } from "../services/tokenizer";

export type TreeMode = "none" | "limited" | "full";

export async function copyCommand(
    treeMode: TreeMode | vscode.Uri | undefined = "none",
    uri?: vscode.Uri | vscode.Uri[],
    selected?: vscode.Uri[]
) {
    let commandTreeMode: TreeMode = "none";
    let commandUri: vscode.Uri | undefined;
    let commandSelected: vscode.Uri[] | undefined;

    if (typeof treeMode === "string") {
        commandTreeMode = treeMode;

        if (Array.isArray(uri)) {
            commandSelected = uri;
        } else {
            commandUri = uri;
            commandSelected = selected;
        }
    } else if (treeMode) {
        commandUri = treeMode;

        if (Array.isArray(uri)) {
            commandSelected = uri;
        }
    }

    console.log("treeMode:", commandTreeMode);
    console.log("uri:", commandUri?.fsPath);
    console.log(
        "selected:",
        commandSelected?.map((u) => u.fsPath),
    );

    try {
        const files = await collectFiles(commandUri, commandSelected);

        let directoryTree: string | undefined;

        if (treeMode === "full") {
            directoryTree = await generateDirectoryTree();
        } else if (treeMode === "limited") {
            directoryTree = generateLimitedDirectoryTree(
                files.map(file => file.relativePath)
            );
        }

        const output = formatFiles(files, directoryTree);

        const tokens = await countTokens(output);

        await copyToClipboard(output);

        vscode.window.showInformationMessage(
            `Copied ${files.length} file${files.length === 1 ? "" : "s"} (${tokens.toLocaleString()} tokens)`
        );
    } catch (err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Copy failed."
        );
    }
}