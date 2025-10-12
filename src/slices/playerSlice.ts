import { PlayStateType, VideoFileMeta } from "@/types/videoPlayer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
    filePath: string | null;
    fileMeta?: VideoFileMeta;
    playState: PlayStateType;
}

const initialState: State = {
    filePath: null,
    fileMeta: undefined,
    playState: PlayStateType.Stopped,
};

const slice = createSlice({
    name: "player",
    initialState: initialState,
    reducers: {
        openFile: (state, action: PayloadAction<string>) => {
            state.filePath = action.payload;
            state.playState = PlayStateType.Playing;
        },
        closeFile: (state) => {
            state.filePath = null;
            state.fileMeta = undefined;
        },
        setVideoMeta: (state, action: PayloadAction<VideoFileMeta>) => {
            state.fileMeta = action.payload;
        },
        updateVideoDuration: (state, action: PayloadAction<number>) => {
            if (state.fileMeta) {
                state.fileMeta.duration = action.payload;
            }
        },
        setPlayState: (state, action: PayloadAction<PlayStateType>) => {
            state.playState = action.payload;
        },
    },
});

export const {
    openFile,
    closeFile,
    setPlayState,
    setVideoMeta,
    updateVideoDuration,
} = slice.actions;

export default slice.reducer;
