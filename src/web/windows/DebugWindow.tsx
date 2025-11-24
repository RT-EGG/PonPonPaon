import React from 'react';
import { useSharedStateContext } from '../../contexts/SharedStateContext';

export const DebugWindow = () => {
    const { sharedState } = useSharedStateContext();

    if (!sharedState) {
        return (
            <div style={{ padding: '20px', color: 'white', backgroundColor: '#1e1e1e' }}>
                <h1>🐛 デバッグ</h1>
                <p>共有状態を読み込み中...</p>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '20px',
            boxSizing: 'border-box',
            fontFamily: 'Consolas, Monaco, monospace',
            overflow: 'auto'
        }}>
            <h1>🐛 デバッグウィンドウ</h1>
            
            <div style={{
                background: '#000000',
                color: '#00FF00',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'pre-wrap'
            }}>
                {JSON.stringify(sharedState, null, 2)}
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <button 
                    onClick={() => window.close()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007acc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    閉じる
                </button>
            </div>
        </div>
    );
};