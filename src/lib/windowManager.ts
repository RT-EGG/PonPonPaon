import { BrowserWindow } from "electron";
import path from "path";
import { sharedStateManager } from "./sharedStateManager";
import { WindowType } from "@/types/window";

export function createSubWindow(type: WindowType = 'main'): BrowserWindow {
    const subWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false, // 最初は非表示
    });

    // ウィンドウをSharedStateManagerに登録
    sharedStateManager.registerWindow(subWindow);

    // ハッシュを使ってウィンドウタイプを指定
    const indexPath = path.join(__dirname, "index.html");
    const urlWithHash = `file://${indexPath}#${type}`;
    
    subWindow.loadURL(urlWithHash);
    
    // 開発環境では開発者ツールも開く
    if (process.env.NODE_ENV === "development") {
        subWindow.webContents.openDevTools();
    }

    // ロード完了後に表示
    subWindow.once('ready-to-show', () => {
        subWindow.show();
    });

    console.log(`[WindowManager] ${type}ウィンドウ作成完了: ID=${subWindow.id}, URL: ${urlWithHash}`);
    return subWindow;
}

// 便利関数
export function createDebugWindow(): BrowserWindow {
    return createSubWindow('debug');
}

export function createSettingsWindow(): BrowserWindow {
    return createSubWindow('settings');
}

export function createPlaylistWindow(): BrowserWindow {
    return createSubWindow('playlist');
}