import { configureStore } from "@reduxjs/toolkit";
import player from "@/slices/playerSlice";
import videoController from "@/slices/videoControllerSlice";

export const store = configureStore({
    reducer: {
        player,
        videoController,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
