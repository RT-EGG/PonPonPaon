import { IpcMain } from "electron";
import fs from "fs";
import path from "path";
import { app } from "electron";
import { buildThumbnail, ThumbParams } from "./lib/ffmpegThumbs";
import { hashKey } from "./lib/ffmpegThumbs";
import imageSize from "image-size";
import { pathToFileURL } from "url";
import { LoadFileMeta } from "./lib/files";

const registerIpcHandle = (ipcMain: IpcMain) => {
    ipcMain.handle(
        "thumbs:build",
        async (
            _ev,
            inputPath: string,
            outputPath: string,
            params: ThumbParams
        ) => {
            return await buildThumbnail(inputPath, outputPath, params);
        }
    );

    ipcMain.handle("thumbs:getOutputDir", (_ev, filePath: string) => {
        const key = hashKey(filePath);
        const outDir = path.join(app.getPath("userData"), "thumb-cache", key);
        return outDir;
    });

    ipcMain.handle("thumbs:getImageSize", (_ev, filePath: string) => {
        return imageSize(fs.readFileSync(filePath));
    });

    ipcMain.handle("files:getUserDataPath", (_ev) => {
        return app.getPath("userData");
    });

    ipcMain.handle("files:pathToFileUrl", (_ev, path: string) => {
        return pathToFileURL(path).href;
    });

    ipcMain.handle("files:exists", (_ev, path: string) => {
        try {
            fs.statSync(path);
            return true;
        } catch {
            return false;
        }
    });

    ipcMain.handle("files:loadFileMeta", (_, path: string) => {
        return LoadFileMeta(path);
    });

    ipcMain.handle("files:readFile", (_, path: string) => {
        return fs.readFileSync(path);
    });
};

export default registerIpcHandle;
