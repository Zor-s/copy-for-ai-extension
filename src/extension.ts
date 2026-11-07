import * as vscode from "vscode";
import { copyCommand } from "./commands/copy";
import { directoryTreeCommand } from "./commands/directoryTree";
import { openSettingsCommand } from "./commands/openSettings";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "copyForAI.copy",
            (uri?: vscode.Uri, selected?: vscode.Uri[]) =>
                copyCommand("none", uri, selected)
        ),

        vscode.commands.registerCommand(
            "copyForAI.copyLimitedTree",
            (uri?: vscode.Uri, selected?: vscode.Uri[]) =>
                copyCommand("limited", uri, selected)
        ),

        vscode.commands.registerCommand(
            "copyForAI.copyFullTree",
            (uri?: vscode.Uri, selected?: vscode.Uri[]) =>
                copyCommand("full", uri, selected)
        ),

        vscode.commands.registerCommand(
            "copyForAI.directoryTree",
            directoryTreeCommand
        ),

        vscode.commands.registerCommand(
            "copyForAI.openSettings",
            openSettingsCommand
        )
    );
}

export function deactivate() {}