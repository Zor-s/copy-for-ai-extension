import * as vscode from "vscode";

interface TreeEntry {
    name: string;
    type: vscode.FileType;
}

interface MemoryNode {
    type: "directory" | "file";
    children: Map<string, MemoryNode>;
}

function getIgnoredFolders(): string[] {
    return vscode.workspace
        .getConfiguration("copyForAI.directoryTree")
        .get<string[]>("ignoreFolders", [
            "node_modules",
            ".git",
            "dist",
            ".vscode",
        ]);
}

async function readTreeEntries(
    uri: vscode.Uri
): Promise<TreeEntry[]> {

    const ignored = getIgnoredFolders();

    const entries = await vscode.workspace.fs.readDirectory(uri);

    return entries
        .filter(([name]) => !ignored.includes(name))
        .map(([name, type]) => ({
            name,
            type,
        }))
        .sort((a, b) => {

            // Directories first
            if (
                a.type === vscode.FileType.Directory &&
                b.type !== vscode.FileType.Directory
            ) {
                return -1;
            }

            if (
                a.type !== vscode.FileType.Directory &&
                b.type === vscode.FileType.Directory
            ) {
                return 1;
            }

            return a.name.localeCompare(b.name);
        });
}

async function buildTree(
    uri: vscode.Uri,
    prefix = ""
): Promise<string[]> {

    const lines: string[] = [];

    const entries = await readTreeEntries(uri);

    for (let i = 0; i < entries.length; i++) {

        const entry = entries[i];

        const isLast = i === entries.length - 1;

        const branch = isLast
            ? "└── "
            : "├── ";

        lines.push(`${prefix}${branch}${entry.name}`);

        if (entry.type === vscode.FileType.Directory) {

            const childPrefix =
                prefix + (isLast ? "    " : "│   ");

            const childUri = vscode.Uri.joinPath(
                uri,
                entry.name
            );

            lines.push(
                ...(await buildTree(
                    childUri,
                    childPrefix
                ))
            );
        }
    }

    return lines;
}

export async function generateDirectoryTree(
    uri?: vscode.Uri
): Promise<string> {

    let rootUri = uri;

    if (!rootUri) {

        const workspace =
            vscode.workspace.workspaceFolders;

        if (!workspace || workspace.length === 0) {
            throw new Error("No workspace open.");
        }

        rootUri = workspace[0].uri;
    }

    const rootName =
        vscode.workspace.asRelativePath(rootUri, false) ||
        rootUri.path.split("/").pop() ||
        "workspace";

    const lines = [
        rootName,
        ...(await buildTree(rootUri)),
    ];

    return lines.join("\n");
}

function renderMemoryTree(
    node: MemoryNode,
    prefix = ""
): string[] {

    const entries =
        [...node.children.entries()]
            .sort(([nameA, nodeA], [nameB, nodeB]) => {

                if (
                    nodeA.type === "directory" &&
                    nodeB.type !== "directory"
                ) {
                    return -1;
                }

                if (
                    nodeA.type !== "directory" &&
                    nodeB.type === "directory"
                ) {
                    return 1;
                }

                return nameA.localeCompare(nameB);
            });

    const lines: string[] = [];

    entries.forEach(([name, child], index) => {

        const isLast =
            index === entries.length - 1;

        const branch =
            isLast
                ? "└── "
                : "├── ";

        lines.push(`${prefix}${branch}${name}`);

        if (child.type === "directory") {

            const childPrefix =
                prefix + (isLast ? "    " : "│   ");

            lines.push(
                ...renderMemoryTree(
                    child,
                    childPrefix
                )
            );
        }
    });

    return lines;
}

export function generateLimitedDirectoryTree(
    paths: string[]
): string {

    const root: MemoryNode = {
        type: "directory",
        children: new Map(),
    };

    for (const path of paths) {

        const parts =
            path.split(/[\\/]/);

        let current = root;

        parts.forEach((part, index) => {

            const isFile =
                index === parts.length - 1;

            if (!current.children.has(part)) {

                current.children.set(part, {
                    type: isFile
                        ? "file"
                        : "directory",
                    children: new Map(),
                });
            }

            current =
                current.children.get(part)!;
        });
    }

    return renderMemoryTree(root).join("\n");
}