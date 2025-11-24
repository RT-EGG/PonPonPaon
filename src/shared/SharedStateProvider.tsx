import { useSharedState } from "@/hooks/useSharedState";
import { RootState } from "@/store";
import React from "react";
import { useSharedStateContext } from "../contexts/SharedStateContext";

export interface SharedStateContextType {
    state: RootState;
    dispatch: (action: any) => Promise<void>;
}

export const SharedStateContext = React.createContext<SharedStateContextType | undefined>(undefined);

interface Props {
    children: React.ReactNode;
}

const SharedStateProvider: React.FC<Props> = ({ children }) => {
    const {
        sharedState,
        isInitialized,
        dispatch,
    } = useSharedStateContext();

    return (
        sharedState && isInitialized && (
            <SharedStateContext.Provider 
                value={{
                    state: sharedState,
                    dispatch 
                }}
            >
                {children}
            </SharedStateContext.Provider>
        )
    );
};

export default SharedStateProvider;
