import * as vscode from "vscode";
import { copyCommand } from "./commands/copy";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "copyForAI.copy",
            copyCommand
        )
    );
}

export function deactivate() {}