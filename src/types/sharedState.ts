import { RootState } from "@/store";

export interface SharedStateAPI {
    getState(): Promise<RootState>;
    dispatch(action: any): Promise<void>;
    subscribe(listener: (state: RootState) => void): () => void;
}

export interface StateSync {
    type: 'STATE_SYNC';
    payload: RootState;
}

export interface StateAction {
    type: string;
    payload?: any;
}