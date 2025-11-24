import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { RootState, initialRootState } from "@/store";

interface SharedStateContextType {
    sharedState: RootState;
    isInitialized: boolean;
    dispatch: (action: any) => Promise<void>;
}

const SharedStateContext = createContext<SharedStateContextType | null>(null);

export const useSharedStateContext = (): SharedStateContextType => {
    const context = useContext(SharedStateContext);
    if (!context) {
        throw new Error("useSharedStateContext must be used within a SharedStateProvider");
    }
    return context;
};

interface SharedStateProviderProps {
    children: React.ReactNode;
}

export const SharedStateProvider: React.FC<SharedStateProviderProps> = ({ children }) => {
    const [sharedState, setSharedState] = useState<RootState>(initialRootState);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeSharedState = async () => {
            try {
                // 初期状態を取得
                const initialState = await window.sharedState.getState();
                setSharedState(initialState);
                setIsInitialized(true);

                // 状態の変更を監視
                unsubscribe = window.sharedState.subscribe((newState: RootState) => {
                    setSharedState(newState);
                });
            } catch (error) {
                console.error("Failed to initialize shared state:", error);
                setIsInitialized(true); // エラーが発生しても初期化完了とする
            }
        };

        initializeSharedState();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const dispatch = useCallback(async (action: any) => {
        try {
            await window.sharedState.dispatch(action);
        } catch (error) {
            console.error("Failed to dispatch shared action:", error);
            // フォールバック処理があれば実装
        }
    }, []);

    const value: SharedStateContextType = {
        sharedState,
        isInitialized,
        dispatch,
    };

    return (
        <SharedStateContext.Provider value={value}>
            {children}
        </SharedStateContext.Provider>
    );
};