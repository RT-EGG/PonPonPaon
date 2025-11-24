import { WindowType } from '@/types/window';
import { useState, useEffect } from 'react';


export function useWindowType(): WindowType {
    const [windowType, setWindowType] = useState<WindowType>('main');

    useEffect(() => {
        // URLのハッシュを確認
        const hash = window.location.hash.replace('#', '');
        if (hash && ['main', 'debug', 'settings', 'playlist'].includes(hash)) {
            setWindowType(hash as WindowType);
        }
        
        // URLのクエリパラメータも確認
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('windowType') as WindowType;
        if (type && ['main', 'debug', 'settings', 'playlist'].includes(type)) {
            setWindowType(type);
        }
        
        console.log(`[useWindowType] Window type determined: ${windowType}`);
    }, []);

    return windowType;
}