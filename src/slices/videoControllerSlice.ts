import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
    isPlaying: boolean;
}

const initialState: State = {
    isPlaying: false,
};

const slice = createSlice({
    name: "videoController",
    initialState: initialState,
    reducers: {
        play: (state) => {
            state.isPlaying = true;
        },
        pause: (state) => {
            state.isPlaying = false;
        },
    },
});

export const { play, pause } = slice.actions;

export default slice.reducer;
