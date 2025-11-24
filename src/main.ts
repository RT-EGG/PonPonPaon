import path from "node:path";
import * as fs from "fs";
import { BrowserWindow, app, ipcMain, session } from "electron";
import { buildThumbnail, hashKey, ThumbParams } from "./lib/ffmpegThumbs";
import { logLine } from "./lib/logger";
import imageSize from "image-size";
import { pathToFileURL } from "node:url";
import { LoadFileMeta } from "./lib/files";
import registerIpcHandle from "./registerIpcHandle";
import { sharedStateManager } from "./lib/sharedStateManager";
import { createApplicationMenu } from "./lib/applicationMenu";
import { Menu } from "electron";

let mainWindow: BrowserWindow | null = null;
let pending: string[] = [];

const extractFilePathArguments = (argv: string[]) => {
    // デバッグ実行かパッケージ後かで開始インデックスが異なる
    const startIndex = app.isPackaged ? 1 : 2;
    const candidates = argv.slice(startIndex);

    return candidates.filter(
        (arg) =>
            !arg.startsWith("-") && // -始まりではない（なんらかのコマンド引数ではない）
            fs.existsSync(arg) // ファイルとして存在する
    );
};

const sendOrQueue = (files: string[]) => {
    if (!files.length) return;
    // 重複排除（任意）
    const unique = Array.from(new Set(files));
    if (!mainWindow || mainWindow.webContents.isLoading()) {
        pending.push(...unique);
        return;
    }
    mainWindow.webContents.send("open-files", unique);
};

// 単一起動を強制
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    // すでに別のインスタンスが起動している
    app.quit();
} else {
    app.on("second-instance", (_event, argv, _cwd) => {
        if (mainWindow) {
            const files = extractFilePathArguments(argv);
            if (files.length > 0) {
                sendOrQueue(files);
            }

            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        // アプリの起動イベント発火で BrowserWindow インスタンスを作成
        mainWindow = new BrowserWindow({
            webPreferences: {
                // webpack が出力したプリロードスクリプトを読み込み
                preload: path.join(__dirname, "preload.js"),
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        // ウィンドウをSharedStateManagerに登録
        sharedStateManager.registerWindow(mainWindow);

        // アプリケーションメニューを設定
        const menu = createApplicationMenu(mainWindow);
        Menu.setApplicationMenu(menu);

        // レンダラープロセスをロード
        mainWindow.loadFile("dist/index.html");
        
        // 開発環境では開発者ツールを開く
        if (process.env.NODE_ENV === "development") {
            mainWindow.webContents.openDevTools();
        }

        // レンダラーのロード完了で未送信分を吐き出す
        mainWindow.webContents.on("did-finish-load", () => {
            if (pending.length) {
                mainWindow!.webContents.send(
                    "open-files",
                    Array.from(new Set(pending))
                );
                pending = [];
            }
        });

        sendOrQueue(extractFilePathArguments(process.argv));
    });

    ipcMain.on("renderer-ready", () => {
        if (
            mainWindow &&
            !mainWindow.webContents.isLoading() &&
            pending.length
        ) {
            mainWindow.webContents.send(
                "open-files",
                Array.from(new Set(pending))
            );
            pending = [];
        }
    });

    registerIpcHandle(ipcMain);

    process.on("uncaughtException", (e) =>
        logLine(`uncaughtException: ${e.stack || e}`)
    );
    process.on("unhandledRejection", (e: any) =>
        logLine(`unhandledRejection: ${e?.stack || e}`)
    );

    // すべてのウィンドウが閉じられたらアプリを終了する
    app.once("window-all-closed", () => app.quit());
}
