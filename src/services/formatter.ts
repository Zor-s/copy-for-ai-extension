import { CollectedFile } from "./fileCollector";

export function formatFiles(files: CollectedFile[]): string {
    return files
        .map(file => {
            return [
                `===== FILE: ${file.relativePath} =====`,
                "",
                file.contents,
                "",
                `===== END FILE: ${file.relativePath} =====`,
            ].join("\n");
        })
        .join("\n\n");
}