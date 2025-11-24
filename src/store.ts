import { configureStore } from "@reduxjs/toolkit";
import player, { initialState as playerInitialState } from "@/slices/playerSlice";

export const store = configureStore({
    reducer: {
        player,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export const initialRootState: RootState = {
    player: playerInitialState,
};
