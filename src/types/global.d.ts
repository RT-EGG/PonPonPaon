import { ISizeCalculationResult } from "image-size/types/interface";
import { ThumbParams } from "@/lib/ffmpegThumbs";
import { FileMeta } from "@/lib/files";

export {};
declare global {
    interface Window {
        appBridge: {
            onOpenFiles(handler: (files: string[]) => void): void;
            ready(): void;
            getPathForFile(file: File): string | null;
        };
        files: {
            getUserDataPath: () => Promise<string>;
            pathToFileUrl(path: string): Promise<string>;
            exists(path: string): Promise<boolean>;
            loadFileMeta(path: string): Promise<FileMeta>;
            readFile(path: string): Promise<unknown>;
        };
        thumbs: {
            getOutputDir(filePath: string): Promise<string>;
            getImageSize(filePath: string): Promise<ISizeCalculationResult>;
            build(
                inputPath: string,
                outputPath: string,
                params: ThumbParams
            ): Promise<boolean>;
        };
    }
}
