import { IpcMain } from "electron";
import fs from "fs";
import path from "path";
import { app, dialog } from "electron";
import { buildThumbnail, ThumbParams } from "./lib/ffmpegThumbs";
import { hashKey } from "./lib/ffmpegThumbs";
import imageSize from "image-size";
import { pathToFileURL } from "url";
import { LoadFileMeta } from "./lib/files";
import { sharedStateManager } from "./lib/sharedStateManager";
import { createSubWindow } from "./lib/windowManager";
import { BrowserWindow } from "electron";

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

    // SharedState関連のハンドラー
    ipcMain.handle("sharedState:getState", (_ev) => {
        return sharedStateManager.getState();
    });

    ipcMain.handle("sharedState:dispatch", (_ev, action: any) => {
        sharedStateManager.dispatch(action);
        return true;
    });

    // ウィンドウ管理
    ipcMain.handle("window:createSubWindow", (_ev) => {
        const subWindow = createSubWindow('main');
        return subWindow.id;
    });

    // ファイル選択ダイアログ
    ipcMain.handle("dialog:openFile", async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        const result = await dialog.showOpenDialog(window!, {
            title: "ビデオファイルを選択",
            filters: [
                {
                    name: "動画ファイル",
                    extensions: ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "m4v"]
                },
                {
                    name: "すべてのファイル",
                    extensions: ["*"]
                }
            ],
            properties: ["openFile"]
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });
};

export default registerIpcHandle;
