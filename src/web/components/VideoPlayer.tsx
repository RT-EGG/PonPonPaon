import React from "react";
import { PlayStateType, VideoPlayerHandle } from "@/types/videoPlayer";
import useVideoGain from "@/hooks/useVideoGain";

export interface Props {
    ref?: React.Ref<VideoPlayerHandle>;
    filePath?: string; // 外部から渡されるfilePath
    onStep?: (seconds: number) => void;
    onChangeVolume?: (volume: number) => void;
    onChangeGain?: (gain: number) => void;
    onChangeMuted?: (muted: boolean) => void;
    onPlayStateChange?: (state: PlayStateType) => void;
    onMetadataLoaded?: (meta: { duration: number; width: number; height: number }) => void;
    onChangeDuration?: (duration: number) => void;
}

function VideoPlayer(props: Props) {
    const { 
        ref, 
        filePath,
        onStep, 
        onChangeVolume, 
        onChangeGain,
        onChangeMuted,
        onPlayStateChange,
        onMetadataLoaded,
        onChangeDuration,
    } = props;

    // ローカル状態
    const [loading, setLoading] = React.useState(false);

    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const gainController = useVideoGain(videoRef);

    React.useEffect(() => {
        if (!!filePath) {
            gainController.resume();
        }
    }, [filePath, gainController]);

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
                onStep?.(seconds);
            },
            setVolume: (volume: number) => {
                if (videoRef.current) {
                    videoRef.current.volume = volume;
                }
                // gainController.setLinear(volume);
            },
            setGain: (gain: number) => {
                gainController.setLinear(gain);
                onChangeGain?.(gain);
            },
            setMuted: (isMuted: boolean) => {
                if (videoRef.current) {
                    videoRef.current.muted = isMuted;
                }
                onChangeMuted?.(isMuted);
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
                    const metadata = {
                        duration: video.duration,
                        width: video.videoWidth,
                        height: video.videoHeight,
                    };
                    onChangeDuration?.(video.duration);
                    onMetadataLoaded?.(metadata);
                    setLoading(false);
                },
            },
            {
                target: "durationchange",
                handler: () => {
                    onChangeDuration?.(video.duration);
                },
            },
            {
                target: "timeupdate",
                handler: () => onStep?.(video.currentTime),
            },
            {
                target: "play",
                handler: () => onPlayStateChange?.(PlayStateType.Playing),
            },
            {
                target: "pause",
                handler: () => onPlayStateChange?.(PlayStateType.Paused),
            },
            {
                target: "ended",
                handler: () => onPlayStateChange?.(PlayStateType.Stopped),
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
