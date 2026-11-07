import * as vscode from "vscode";
import { generateDirectoryTree } from "../services/directoryTree";
import { copyToClipboard } from "../services/clipboard";

export async function directoryTreeCommand(
    uri?: vscode.Uri
) {
    try {
        const tree = await generateDirectoryTree(uri);

        await copyToClipboard(tree);

        vscode.window.showInformationMessage(
            "Directory tree copied for AI."
        );
    } catch (err) {
        vscode.window.showErrorMessage(
            err instanceof Error ? err.message : "Failed generating directory tree."
        );
    }
}