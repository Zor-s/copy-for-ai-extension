import * as vscode from "vscode";

export class SettingsPanel {
  public static currentPanel: SettingsPanel | undefined;

  private constructor(private readonly panel: vscode.WebviewPanel) {
    this.panel.webview.html = this.getHtml();

    this.panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "save") {
        const folders = message.folders
          .map((folder: string) => folder.trim())
          .filter((folder: string) => folder.length > 0);

        await vscode.workspace
          .getConfiguration("copyForAI.directoryTree")
          .update("ignoreFolders", folders, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage("Copy for AI settings saved.");
      }
    });
  }

  public static createOrShow() {
    const panel = vscode.window.createWebviewPanel(
      "copyForAISettings",
      "Copy for AI Settings",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      },
    );

    SettingsPanel.currentPanel = new SettingsPanel(panel);
  }

  private getHtml(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body {
            padding: 20px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            font-family: var(--vscode-font-family);
        }

        h2 {
            font-size: 20px;
            margin-bottom: 20px;
        }

        .section {
            border: 1px solid var(--vscode-panel-border);
            padding: 16px;
            border-radius: 6px;
            max-width: 600px;
        }

        .description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 16px;
        }

        .folders {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .folder {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--vscode-textCodeBlock-background);
            padding: 8px 12px;
            border-radius: 4px;
        }

        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 3px;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        input {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 6px;
        }

        .actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
    </style>
    </head>

    <body>

    <h2>Copy for AI Settings</h2>

    <div class="section">

        <h3>Directory Tree</h3>

        <div class="description">
            Folders ignored when generating AI directory trees.
        </div>

        <div id="folders" class="folders"></div>

        <br>

        <input
            id="newFolder"
            placeholder="Folder name"
        />

        <button onclick="addFolder()">
            Add
        </button>


        <div class="actions">

            <button onclick="reset()">
                Reset Defaults
            </button>

            <button onclick="save()">
                Save Settings
            </button>

        </div>

    </div>


    <script>

    const vscode = acquireVsCodeApi();

    let folders = [
        "node_modules",
        ".git",
        "dist",
        ".vscode"
    ];


    function render() {

        const container =
            document.getElementById("folders");

        container.innerHTML = "";

        folders.forEach(folder => {

            const row =
                document.createElement("div");

            row.className = "folder";

            row.innerHTML =
            \`
            <span>\${folder}</span>
            <button onclick="removeFolder('\${folder}')">
                ×
            </button>
            \`;

            container.appendChild(row);
        });
    }


    function addFolder() {

        const input =
            document.getElementById("newFolder");

        const value =
            input.value.trim();

        if (!value) {
            return;
        }

        folders.push(value);

        input.value = "";

        render();
    }


    function removeFolder(folder) {

        folders =
            folders.filter(
                item => item !== folder
            );

        render();
    }


    function save() {

        vscode.postMessage({
            command: "save",
            folders
        });

    }


    function reset() {

        folders = [
            "node_modules",
            ".git",
            "dist",
            ".vscode"
        ];

        render();

    }


    render();

    </script>

    </body>
    </html>
    `;
  }
}
