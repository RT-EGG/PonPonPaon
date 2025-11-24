import * as React from "react";
import Main from "./Main";
import { DebugWindow } from "./windows/DebugWindow";
import { SettingsWindow } from "./windows/SettingsWindow";
import { useSharedStateContext } from "../contexts/SharedStateContext";
import { useWindowType } from "../hooks/useWindowType";
import { WindowType } from "@/types/window";

export const App = () => {
    const { sharedState } = useSharedStateContext();
    const windowType = useWindowType();
    
    const renderWindow = React.useCallback(() => {
        switch (windowType) {
            case WindowType.Main:
                return <Main state={sharedState} />;
            case WindowType.Debug:
                return <DebugWindow />;
        }

        return <Main state={sharedState} />;
    }, [windowType, sharedState]);

    return (
        <div className="container" style={{ height: "100%" }}>
            {renderWindow()}
        </div>
    );
};
