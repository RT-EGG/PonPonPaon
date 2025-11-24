import React from "react";
import VideoPlayer from "./components/VideoPlayer";
import VideoController from "./components/VideoController";
import { VideoPlayerHandle } from "@/types/videoPlayer";
import { useSharedStateContext } from "../contexts/SharedStateContext";
import useVideoThumbnail, { Thumbnail } from "@/hooks/useVideoThumbnail";
import { RootState } from "@/store";
//import { loadProfile } from "@/hooks/useVideoProfile";
import { openFile, actions as playerActions } from "@/slices/playerSlice";

export interface Props {
    state: RootState;
}

const Main: React.FunctionComponent<Props> = (props: Props) => {
    const [handle, setHandle] = React.useState<VideoPlayerHandle | null>(null);
    const playerRef = React.useCallback((inst: VideoPlayerHandle | null) => {
        setHandle(inst);
    }, []);
   
    const { sharedState, dispatch } = useSharedStateContext();
    const {
        filePath,
        fileMeta,
        currentTime,
        volume,
        gain,
        muted,
    } = sharedState.player;
    
    const [thumbnails, setThumbnails] = React.useState<Thumbnail[]>([]);
    const thumbActions = useVideoThumbnail((thumbs) => {
        setThumbnails(thumbs);
    });

    React.useEffect(() => {
        if (!!filePath && fileMeta) {
            (async () => {
                await thumbActions.load(filePath, fileMeta.duration);
                //await loadProfile(filePath);
            })();
        }
    }, [filePath, fileMeta]);

        React.useEffect(() => {
            window.appBridge.onOpenFiles((newFiles) => {
                if (newFiles.length > 0) {
                    dispatch(openFile(newFiles[0]));
                }
            });
    
            window.appBridge.ready();
    
            const onDragOver = (e: DragEvent) => {
                e.preventDefault();
            };
            const onDrop = (e: DragEvent) => {
                e.preventDefault();
                const newFiles = Array.from(e.dataTransfer?.files ?? []).map(
                    (f) => window.appBridge.getPathForFile(f) ?? ""
                );
                if (newFiles.length > 0) {
                    dispatch(openFile(newFiles[0]));
                }
            };
            window.addEventListener("dragover", onDragOver);
            window.addEventListener("drop", onDrop);
            return () => {
                window.removeEventListener("dragover", onDragOver);
                window.removeEventListener("drop", onDrop);
            };
        }, [dispatch]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <VideoPlayer
                ref={playerRef}
                filePath={filePath ?? undefined}
                onStep={seconds => dispatch(playerActions.onStep(seconds))}
                onChangeVolume={volume => dispatch(playerActions.onChangeVolume(volume))}
                onChangeGain={gain => dispatch(playerActions.onChangeGain(gain))}
                onChangeMuted={muted => dispatch(playerActions.onChangeMuted(muted))}
                onPlayStateChange={state => dispatch(playerActions.onChangeState(state))}
                onMetadataLoaded={meta => dispatch(playerActions.setVideoMeta(meta))}
                onChangeDuration={duration => dispatch(playerActions.updateVideoDuration(duration))}
            />
            <VideoController
                playerHandle={handle}
                currentTime={currentTime}
                volume={volume}
                gain={gain}
                muted={muted}
                getThumbnail={(seconds) =>
                    thumbActions.getThumbnailAt(thumbnails, seconds)
                }
            />
        </div>
    );
}

export default Main;
