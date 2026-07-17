import * as vscode from "vscode";
import { copyToClipboard } from "../services/clipboard";
import { collectFiles } from "../services/fileCollector";
import { formatFiles } from "../services/formatter";

export async function copyCommand(
    uri?: vscode.Uri,
    selected?: vscode.Uri[]
) {
    console.log("uri:", uri?.fsPath);
    console.log("selected:", selected?.map(u => u.fsPath));

    try {
        const files = await collectFiles(uri, selected);

        const output = formatFiles(files);

        await copyToClipboard(output);

        vscode.window.showInformationMessage(
            `Copied ${files.length} file${files.length === 1 ? "" : "s"}`
        );
    } catch (err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Copy failed."
        );
    }
}