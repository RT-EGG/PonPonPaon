import React from 'react';
import { useSharedStateContext } from '../../contexts/SharedStateContext';

export const SettingsWindow = () => {
    const { sharedState } = useSharedStateContext();

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <h1>⚙️ 設定</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h2>ビデオ設定</h2>
                <p>現在のファイル: {sharedState?.player.filePath || 'なし'}</p>
                <p>再生状態: {sharedState?.player.playState || 'stopped'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>アプリケーション設定</h2>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    <input type="checkbox" /> 自動再生を有効にする
                </label>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    <input type="checkbox" /> 字幕を表示する
                </label>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    音量: <input type="range" min="0" max="100" defaultValue="50" />
                </label>
            </div>

            <button 
                onClick={() => window.close()}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                閉じる
            </button>
        </div>
    );
};