import { CollectedFile } from "./fileCollector";

export function formatFiles(
    files: CollectedFile[],
    directoryTree?: string
): string {

    const sections: string[] = [];

    if (directoryTree) {
        sections.push(
            [
                "===== DIRECTORY TREE =====",
                "",
                directoryTree,
                "",
                "===== END DIRECTORY TREE =====",
            ].join("\n")
        );
    }

    sections.push(
        files
            .map(file =>
                [
                    `===== FILE: ${file.relativePath} =====`,
                    "",
                    file.contents,
                    "",
                    `===== END FILE: ${file.relativePath} =====`,
                ].join("\n")
            )
            .join("\n\n")
    );

    return sections.join("\n\n");
}