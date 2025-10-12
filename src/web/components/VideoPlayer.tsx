import React from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { PlayStateType, VideoPlayerHandle } from "@/types/videoPlayer";
import {
    setVideoMeta,
    updateVideoDuration,
    setPlayState,
} from "@/slices/playerSlice";
import useVideoGain from "@/hooks/useVideoGain";

export interface Props {
    ref?: React.Ref<VideoPlayerHandle>;
    onStep: (seconds: number) => void;
    onChangeVolume: (volume: number) => void;
    onChangeMuted: (muted: boolean) => void;
}

function VideoPlayer(props: Props) {
    const { ref, onStep, onChangeVolume, onChangeMuted } = props;

    const dispatch = useAppDispatch();
    const filePath = useAppSelector((state) => state.player.filePath);

    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const gainController = useVideoGain(videoRef);

    React.useEffect(() => {
        if (!!filePath) {
            gainController.resume();
        }
    }, [filePath]);

    React.useImperativeHandle(
        ref,
        () => ({
            resume: async () => {
                gainController.resume();
                await videoRef.current?.play().catch(() => {});
            },
            pause: () => {
                videoRef.current?.pause();
            },
            seek: (seconds: number) => {
                if (videoRef.current) {
                    videoRef.current.currentTime = seconds;
                }
                onStep(seconds);
            },
            setVolume: (volume: number) => {
                gainController.setLinear(volume);
            },
            setMuted: (muted: boolean) => {
                if (videoRef.current) {
                    videoRef.current.muted = muted;
                }
                onChangeMuted(muted);
            },
            getGain: () => gainController.getGain(),
        }),
        []
    );

    React.useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        const events: {
            target: keyof GlobalEventHandlersEventMap;
            handler: () => void;
        }[] = [
            {
                target: "loadedmetadata",
                handler: () => {
                    dispatch(
                        setVideoMeta({
                            duration: video.duration,
                            width: video.videoWidth,
                            height: video.videoHeight,
                        })
                    );
                },
            },
            {
                target: "durationchange",
                handler: () => {
                    dispatch(updateVideoDuration(video.duration));
                },
            },
            {
                target: "play",
                handler: () => dispatch(setPlayState(PlayStateType.Playing)),
            },
            {
                target: "pause",
                handler: () => dispatch(setPlayState(PlayStateType.Paused)),
            },
            {
                target: "ended",
                handler: () => dispatch(setPlayState(PlayStateType.Stopped)),
            },
            {
                target: "volumechange",
                handler: () => {
                    if (onChangeVolume) {
                        onChangeVolume(video.volume);
                    }
                },
            },
        ];

        events.forEach((event) => {
            video.addEventListener(event.target, event.handler);
        });

        const step = () => {
            onStep(video.currentTime);
            video.requestVideoFrameCallback(step);
        };
        onStep(0);
        video.requestVideoFrameCallback(step);

        return () => {
            events.forEach((event) => {
                video.removeEventListener(event.target, event.handler);
            });
        };
    }, [videoRef.current]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
            }}
        >
            <video
                ref={videoRef}
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#000000",
                    flexGrow: 1,
                    flexShrink: 1,
                    minWidth: 0,
                    minHeight: 0,
                }}
                src={filePath ?? ""}
                autoPlay
            />
        </div>
    );
}

export default VideoPlayer;
