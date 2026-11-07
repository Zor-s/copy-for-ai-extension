import * as vscode from "vscode";
import { SettingsPanel } from "../views/settingsPanel";

export function openSettingsCommand() {
    SettingsPanel.createOrShow();
}