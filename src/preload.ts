import { contextBridge, ipcRenderer, webUtils } from "electron";
import { ThumbParams } from "./lib/ffmpegThumbs";
import fs from "fs";

contextBridge.exposeInMainWorld("appBridge", {
    onOpenFiles: (handler: (files: string[]) => void) => {
        ipcRenderer.on("open-files", (_ev, files: string[]) => handler(files));
    },
    // 初回起動時の取りこぼし防止用に「準備OK」をメインへ伝える
    ready: () => ipcRenderer.send("renderer-ready"),
    getPathForFile: (file: File) => webUtils.getPathForFile(file),
});

contextBridge.exposeInMainWorld("files", {
    getUserDataPath: () => ipcRenderer.invoke("files:getUserDataPath"),
    pathToFileUrl: (path: string) =>
        ipcRenderer.invoke("files:pathToFileUrl", path),
    exists: (path: string) => ipcRenderer.invoke("files:exists", path),
    loadFileMeta: async (path: string) =>
        ipcRenderer.invoke("files:loadFileMeta", path),
    readFile: (path: string) => ipcRenderer.invoke("files:readFile", path),
});

contextBridge.exposeInMainWorld("thumbs", {
    getOutputDir: (filePath: string) =>
        ipcRenderer.invoke("thumbs:getOutputDir", filePath),
    getImageSize: (filePath: string) =>
        ipcRenderer.invoke("thumbs:getImageSize", filePath),
    build: (inputPath: string, outputPath: string, params: ThumbParams) =>
        ipcRenderer.invoke("thumbs:build", inputPath, outputPath, params),
});

contextBridge.exposeInMainWorld("sharedState", {
    getState: () => ipcRenderer.invoke("sharedState:getState"),
    dispatch: (action: any) => ipcRenderer.invoke("sharedState:dispatch", action),
    subscribe: (listener: (state: any) => void) => {
        const handleStateSync = (_event: any, state: any) => listener(state);
        ipcRenderer.on("state-sync", handleStateSync);
        
        // cleanup関数を返す
        return () => {
            ipcRenderer.off("state-sync", handleStateSync);
        };
    },
});

contextBridge.exposeInMainWorld("windowManager", {
    createSubWindow: () => ipcRenderer.invoke("window:createSubWindow"),
    showContextMenu: () => ipcRenderer.invoke("window:showContextMenu"),
});

contextBridge.exposeInMainWorld("dialog", {
    openFile: () => ipcRenderer.invoke("dialog:openFile"),
});
