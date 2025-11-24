import { PlayStateType, VideoFileMeta } from "@/types/videoPlayer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
    filePath: string | null;
    fileMeta?: VideoFileMeta;
    playState: PlayStateType;
    currentTime: number;
    muted: boolean;
    volume: number;
    gain: number;
}

export const initialState: State = {
    filePath: null,
    fileMeta: undefined,
    playState: PlayStateType.Stopped,
    currentTime: 0,
    muted: false,
    volume: 1.0,
    gain: 1.0,
};

const slice = createSlice({
    name: "player",
    initialState: initialState,
    reducers: {
        setVideoMeta: (state, action: PayloadAction<VideoFileMeta>) => {
            state.fileMeta = action.payload;
        },
        updateVideoDuration : (state, action: PayloadAction<number>) => {
            if (state.fileMeta) {
                state.fileMeta.duration = action.payload;
            }
        },
        onChangeState: (state, action: PayloadAction<PlayStateType>) => {
            state.playState = action.payload;
        },
        onStep: (state, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },
        onChangeVolume: (state, action: PayloadAction<number>) => {
            state.volume = action.payload;
        },
        onChangeMuted: (state, action: PayloadAction<boolean>) => {
            state.muted = action.payload;
        },
        onChangeGain: (state, action: PayloadAction<number>) => {
            state.gain = action.payload;
        },
        openFile: (state, action: PayloadAction<string>) => {
            state.filePath = action.payload;
            state.playState = PlayStateType.Playing;
        },
        closeFile: (state) => {
            state.filePath = null;
            state.fileMeta = undefined;
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

const actions = slice.actions;

export { actions };
export default slice.reducer;
