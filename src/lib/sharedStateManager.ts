import { configureStore, Store } from "@reduxjs/toolkit";
import { BrowserWindow } from "electron";
import player from "@/slices/playerSlice";
import { RootState } from "@/store";

export class SharedStateManager {
    private store: Store;
    private windows: Set<BrowserWindow> = new Set();
    private listeners: Map<number, (state: RootState) => void> = new Map();

    constructor() {
        // メインプロセス用のマスターstore
        this.store = configureStore({
            reducer: {
                player,
            },
        });

        // storeの変更を監視し、全ウィンドウに同期
        this.store.subscribe(() => {
            this.broadcastState();
        });
    }

    // ウィンドウを登録
    registerWindow(window: BrowserWindow): void {
        this.windows.add(window);
        
        // ウィンドウが閉じられたときの清理
        window.on('closed', () => {
            this.windows.delete(window);
            this.listeners.delete(window.id);
        });

        // 初期状態を送信
        this.sendStateToWindow(window, this.getState());
    }

    // ウィンドウの登録を解除
    unregisterWindow(window: BrowserWindow): void {
        this.windows.delete(window);
        this.listeners.delete(window.id);
    }

    // 現在の状態を取得
    getState(): RootState {
        return this.store.getState();
    }

    // アクションをディスパッチ
    dispatch(action: any): void {
        this.store.dispatch(action);
    }

    // 特定のウィンドウに状態を送信
    private sendStateToWindow(window: BrowserWindow, state: RootState): void {
        if (!window.isDestroyed() && window.webContents) {
            window.webContents.send('state-sync', state);
        }
    }

    // 全ウィンドウに状態をブロードキャスト
    private broadcastState(): void {
        const state = this.getState();
        this.windows.forEach(window => {
            this.sendStateToWindow(window, state);
        });
    }

    // リスナーを追加
    addListener(windowId: number, listener: (state: RootState) => void): void {
        this.listeners.set(windowId, listener);
    }

    // リスナーを削除
    removeListener(windowId: number): void {
        this.listeners.delete(windowId);
    }
}

// シングルトンインスタンス
export const sharedStateManager = new SharedStateManager();