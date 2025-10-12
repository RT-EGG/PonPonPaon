import * as React from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { Button } from "@/shared/ui";
import { PlayStateType, VideoPlayerHandle } from "@/types/videoPlayer";
import { useAppSelector } from "@/hooks";
import SeekBar from "./SeekBar";
import VolumeController from "./VolumeController";
import { Thumbnail } from "@/hooks/useVideoThumbnail";
import Sprite from "@/shared/ui/Sprite";

export interface ControllerProps {
    visible: boolean;
    playerHandle: VideoPlayerHandle | null;
    currentTime: number;
    volume: number;
    muted: boolean;
    onPointerOverSeek?: (clientX: number, seconds: number) => void;
    onPointerLeaveSeek?: () => void;
}

const formatFullTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${h}:${m}:${s}`;
};

export const VideoController = (props: ControllerProps) => {
    const {
        playerHandle,
        currentTime,
        volume,
        muted,
        onPointerOverSeek,
        onPointerLeaveSeek,
    } = props;
    if (!playerHandle) {
        return <React.Fragment />;
    }

    const { resume, pause, seek, setVolume, setMuted } = playerHandle;
    const { filePath, fileMeta, playState } = useAppSelector(
        (state) => state.player
    );
    const [isPlayingSeeking, setIsPlayingSeeking] =
        React.useState<boolean>(false);
    const seekBarRef = React.useRef<HTMLDivElement | null>(null);

    // if (!filePath) {
    //     return <React.Fragment />;
    // }

    const showPlayButton =
        (!filePath || // ファイルが読まれていなければ再生ボタン（disabled）
            playState !== PlayStateType.Playing) && // 再生中でなければ再生ボタン
        !isPlayingSeeking; // 再生中にシークしている最中は再生ボタン

    return (
        <div
            style={{
                display: "flex",
                flexFlow: "row nowrap",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    flexGrow: 0,
                }}
            >
                {showPlayButton ? (
                    <Button onClick={() => resume()} disabled={!filePath}>
                        <FaPlay />
                    </Button>
                ) : (
                    <Button onClick={() => pause()}>
                        <FaPause />
                    </Button>
                )}
            </div>
            <div
                ref={seekBarRef}
                style={{ flexGrow: 1 }}
                onPointerLeave={onPointerLeaveSeek}
            >
                <SeekBar
                    style={{
                        height: "8px",
                    }}
                    knobStyle={{
                        height: "16px",
                    }}
                    duration={fileMeta?.duration || 0}
                    currentTime={currentTime}
                    onStartSeek={() => {
                        if (playState === PlayStateType.Playing) {
                            setIsPlayingSeeking(true);
                            pause();
                        }
                    }}
                    onSeek={(time) => {
                        seek(time);
                    }}
                    onCommitSeek={(time) => {
                        seek(time);
                        if (isPlayingSeeking) {
                            setIsPlayingSeeking(false);
                            resume();
                        }
                    }}
                    onPointerOver={(x, time) => {
                        if (seekBarRef.current) {
                            onPointerOverSeek?.(
                                seekBarRef.current.clientLeft + x,
                                time
                            );
                        } else {
                            onPointerOverSeek?.(x, time);
                        }
                    }}
                    volume={volume}
                    muted={muted}
                />
            </div>
            <VolumeController
                style={{
                    flexGrow: 0,
                    marginRight: "8px",
                }}
                maxValue={2.0}
                value={volume}
                muted={muted}
                setVolume={(value) => setVolume?.(value)}
                setMuted={(value) => setMuted?.(value)}
            />
            <div
                style={{
                    flexGrow: 0,
                    fontSize: "12px",
                }}
            >
                {formatFullTime(currentTime)} /{" "}
                {formatFullTime(fileMeta?.duration ?? 0)}
            </div>
        </div>
    );
};

const VideoThumbnail = (props: {
    thumbnail?: Thumbnail;
    clientRef: HTMLDivElement | null;
    controllerRef: HTMLDivElement | null;
    x: number;
}) => {
    const { thumbnail, clientRef, controllerRef, x } = props;
    const [scale, setScale] = React.useState<number>(1.0);

    const calcScale = React.useCallback(
        (
            thumbnail: Thumbnail | undefined,
            clientRef: HTMLDivElement | null,
            controllerRef: HTMLDivElement | null
        ) => {
            if (!thumbnail || !clientRef || !controllerRef) {
                return 0.0;
            }

            return (clientRef.clientWidth / thumbnail.rect.width) * 0.2;
        },
        []
    );

    React.useEffect(() => {
        setScale(calcScale(thumbnail, clientRef, controllerRef));
    }, [thumbnail, clientRef, controllerRef]);

    React.useEffect(() => {
        if (!clientRef) {
            return;
        }

        const observer = new ResizeObserver(() => {
            setScale(calcScale(thumbnail, clientRef, controllerRef));
        });

        observer.observe(clientRef);
        return () => {
            observer.unobserve(clientRef);
        };
    }, [clientRef]);

    if (!thumbnail || !clientRef || !controllerRef) {
        return null;
    }

    const left = Math.min(
        clientRef.clientWidth - thumbnail.rect.width * scale,
        Math.max(0, x - thumbnail.rect.width * scale * 0.5)
    );

    return (
        <Sprite
            styles={{
                position: "absolute",
                left: `${left}px`,
                bottom: `${controllerRef.clientHeight}px`,
                width: `${thumbnail.rect.width}px`,
                height: `${thumbnail.rect.height}px`,
                transform: `scale(${scale}, ${scale})`,
                transformOrigin: "bottom center",
                opacity: 0.75,
            }}
            src={thumbnail.src}
            spriteLeft={thumbnail.rect.left}
            spriteTop={thumbnail.rect.top}
            spriteWidth={thumbnail.rect.width}
            spriteHeight={thumbnail.rect.height}
        />
    );
};

export interface OverlayProps extends Omit<ControllerProps, "visible"> {
    getThumbnail: (seconds: number) => Thumbnail | undefined;
}

const VideoOverlay = (props: OverlayProps) => {
    const { getThumbnail } = props;

    const [thumbX, setThumbX] = React.useState<number>(0);
    const clientRef = React.useRef<HTMLDivElement | null>(null);
    const controllerRef = React.useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = React.useState<boolean>(false);
    const [thumbnail, setThumbnail] = React.useState<Thumbnail | null>(null);
    const [thumbnailVisible, setThumbnailVisible] =
        React.useState<boolean>(false);

    React.useEffect(() => {
        setThumbnail(null);
    }, [visible]);

    return (
        <div
            ref={clientRef}
            style={{
                position: "absolute",
                inset: 0,
                // pointerEvents: "none",
            }}
            onPointerEnter={() => setVisible(true)}
            onPointerLeave={() => setVisible(false)}
        >
            {clientRef.current && visible && (
                <React.Fragment>
                    <div
                        ref={controllerRef}
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "Canvas",
                            // opacity: 0.5,
                            pointerEvents: "auto",
                        }}
                    >
                        <VideoController
                            visible={visible}
                            onPointerOverSeek={(x, sec) => {
                                setThumbX(x);
                                const thumbnail = getThumbnail(sec);
                                setThumbnail(thumbnail ?? null);
                                setThumbnailVisible(true);
                            }}
                            onPointerLeaveSeek={() => {
                                setThumbnailVisible(false);
                            }}
                            {...props}
                        />
                    </div>
                    {thumbnailVisible && (
                        <VideoThumbnail
                            clientRef={clientRef.current}
                            controllerRef={controllerRef.current}
                            thumbnail={thumbnail ?? undefined}
                            x={thumbX}
                        />
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

export default VideoOverlay;
