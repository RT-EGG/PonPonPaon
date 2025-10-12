import fs from "fs";

export type FileMeta = fs.Stats;

export async function LoadFileMeta(filePath: string) {
    const stats = await fs.promises.stat(filePath);
    return stats;
}
