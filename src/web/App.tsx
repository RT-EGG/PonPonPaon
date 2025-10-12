import * as React from "react";
import "./App.css";
import { openFile } from "../slices/playerSlice";
import { useAppDispatch } from "../hooks";
import Main from "./Main";

export const App = () => {
    const dispatch = useAppDispatch();
    React.useEffect(() => {
        window.appBridge.onOpenFiles((newFiles) => {
            if (newFiles.length > 0) {
                dispatch(openFile(newFiles[0]));
            }
        });

        window.appBridge.ready();

        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
        };
        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            const newFiles = Array.from(e.dataTransfer?.files ?? []).map(
                (f) => window.appBridge.getPathForFile(f) ?? ""
            );
            // ここで開く処理
            if (newFiles.length > 0) {
                dispatch(openFile(newFiles[0]));
            }
        };
        window.addEventListener("dragover", onDragOver);
        window.addEventListener("drop", onDrop);
        return () => {
            window.removeEventListener("dragover", onDragOver);
            window.removeEventListener("drop", onDrop);
        };
    }, []);

    return (
        <div className="container" style={{ height: "100%" }}>
            <Main />
        </div>
    );
};
