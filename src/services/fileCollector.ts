import * as vscode from "vscode";

export interface CollectedFile {
    uri: vscode.Uri;
    relativePath: string;
    contents: string;
}

async function readFile(uri: vscode.Uri): Promise<CollectedFile | null> {
    try {
        const bytes = await vscode.workspace.fs.readFile(uri);

        // Basic binary detection.
        // Binary files commonly contain null bytes.
        if (bytes.includes(0)) {
            console.warn(`Skipping binary file: ${uri.fsPath}`);
            return null;
        }

        const contents = new TextDecoder("utf-8").decode(bytes);

        return {
            uri,
            relativePath: vscode.workspace.asRelativePath(uri),
            contents,
        };

    } catch (error) {
        console.warn(`Failed reading file: ${uri.fsPath}`, error);
        return null;
    }
}

async function collectFolder(uri: vscode.Uri): Promise<CollectedFile[]> {
    const files: CollectedFile[] = [];

    const entries = await vscode.workspace.fs.readDirectory(uri);

    for (const [name, type] of entries) {
        const child = vscode.Uri.joinPath(uri, name);

        if (type === vscode.FileType.File) {
            const file = await readFile(child);

            if (file) {
                files.push(file);
            }
        }

        if (type === vscode.FileType.Directory) {
            files.push(...await collectFolder(child));
        }
    }

    return files;
}

async function collectUri(uri: vscode.Uri): Promise<CollectedFile[]> {
    const stat = await vscode.workspace.fs.stat(uri);

    if (stat.type === vscode.FileType.Directory) {
        return collectFolder(uri);
    }

    const file = await readFile(uri);

    return file ? [file] : [];
}

export async function collectFiles(
    uri?: vscode.Uri,
    selected?: vscode.Uri[]
): Promise<CollectedFile[]> {

    let files: CollectedFile[] = [];

    if (selected && selected.length > 0) {
        for (const item of selected) {
            files.push(...await collectUri(item));
        }
    } else if (uri) {
        files = await collectUri(uri);
    } else {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            throw new Error("No active editor.");
        }

        const contents = editor.document.getText();

        files.push({
            uri: editor.document.uri,
            relativePath: vscode.workspace.asRelativePath(editor.document.uri),
            contents,
        });
    }

    files.sort((a, b) =>
        a.relativePath.localeCompare(b.relativePath)
    );

    return files;
}