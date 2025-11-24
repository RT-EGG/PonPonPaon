import { Menu, MenuItemConstructorOptions, BrowserWindow } from "electron";
import { createSubWindow } from "./windowManager";

export function createApplicationMenu(mainWindow: BrowserWindow): Menu {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'ファイル',
            submenu: [
                {
                    label: 'ファイルを開く...',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        // ファイル選択ダイアログを開く処理
                        mainWindow.webContents.send('menu-action', 'open-file');
                    }
                },
                { type: 'separator' },
                {
                    label: '終了',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        if (process.platform !== 'darwin') {
                            require('electron').app.quit();
                        }
                    }
                }
            ]
        },
        {
            label: 'ウィンドウ',
            submenu: [
                {
                    label: '新しいウィンドウを作成',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        try {
                            const subWindow = createSubWindow('debug');
                            console.log('Sub window created with ID:', subWindow.id);
                        } catch (error) {
                            console.error('Failed to create sub window:', error);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: '最小化',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: '閉じる',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                }
            ]
        },
        {
            label: '表示',
            submenu: [
                {
                    label: '再読み込み',
                    accelerator: 'CmdOrCtrl+R',
                    click: (_, focusedWindow) => {
                        if (focusedWindow && focusedWindow instanceof BrowserWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {
                    label: '開発者ツール',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: (_, focusedWindow) => {
                        if (focusedWindow && focusedWindow instanceof BrowserWindow) {
                            focusedWindow.webContents.toggleDevTools();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: '実際のサイズ',
                    accelerator: 'CmdOrCtrl+0',
                    role: 'resetZoom'
                },
                {
                    label: '拡大',
                    accelerator: 'CmdOrCtrl+Plus',
                    role: 'zoomIn'
                },
                {
                    label: '縮小',
                    accelerator: 'CmdOrCtrl+-',
                    role: 'zoomOut'
                },
                { type: 'separator' },
                {
                    label: '全画面表示',
                    accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
                    role: 'togglefullscreen'
                }
            ]
        }
    ];

    // macOSの場合、アプリケーション名のメニューを追加
    if (process.platform === 'darwin') {
        template.unshift({
            label: 'PonPonPaon',
            submenu: [
                {
                    label: 'PonPonPaonについて',
                    role: 'about'
                },
                { type: 'separator' },
                {
                    label: 'サービス',
                    role: 'services',
                    submenu: []
                },
                { type: 'separator' },
                {
                    label: 'PonPonPaonを隠す',
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: '他を隠す',
                    accelerator: 'Command+Alt+H',
                    role: 'hideOthers'
                },
                {
                    label: 'すべて表示',
                    role: 'unhide'
                },
                { type: 'separator' },
                {
                    label: '終了',
                    accelerator: 'Command+Q',
                    click: () => {
                        require('electron').app.quit();
                    }
                }
            ]
        });
    }

    return Menu.buildFromTemplate(template);
}