export interface VideoPlayerHandle {
    resume: () => void;
    pause: () => void;
    seek: (seconds: number) => void;
    setVolume?: (volume: number) => void; // 0.0 - 1.0
    setMuted?: (muted: boolean) => void;
    getGain: () => number;
}

export const PlayStateType = {
    Playing: "playing",
    Paused: "paused",
    Stopped: "stopped",
};
export type PlayStateType = (typeof PlayStateType)[keyof typeof PlayStateType];

export interface VideoFileMeta {
    duration: number; // in seconds
    width: number; // in pixels
    height: number; // in pixels
}
