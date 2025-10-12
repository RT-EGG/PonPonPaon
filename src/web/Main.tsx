import React from "react";
import VideoPlayer from "./components/VideoPlayer";
import VideoController from "./components/VideoController";
import { VideoPlayerHandle } from "@/types/videoPlayer";
import { useAppSelector } from "@/hooks";
import useVideoThumbnail, { Thumbnail } from "@/hooks/useVideoThumbnail";
import { loadProfile } from "@/hooks/useVideoProfile";

export default () => {
    const [handle, setHandle] = React.useState<VideoPlayerHandle | null>(null);
    const [currentTime, setCurrentTime] = React.useState<number>(0);
    const [muted, setMuted] = React.useState<boolean>(false);
    const playerRef = React.useCallback((inst: VideoPlayerHandle | null) => {
        setHandle(inst);
    }, []);
    const { filePath, fileMeta } = useAppSelector((state) => state.player);
    const [thumbnails, setThumbnails] = React.useState<Thumbnail[]>([]);
    const thumbActions = useVideoThumbnail((thumbs) => {
        setThumbnails(thumbs);
    });

    const gain = handle?.getGain() ?? 1.0;

    React.useEffect(() => {
        if (!!filePath && fileMeta) {
            (async () => {
                await thumbActions.load(filePath, fileMeta.duration);
                await loadProfile(filePath);
            })();
        }
    }, [filePath, fileMeta]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <VideoPlayer
                ref={playerRef}
                onStep={setCurrentTime}
                onChangeVolume={() => {}}
                onChangeMuted={setMuted}
            />
            <VideoController
                playerHandle={handle}
                currentTime={currentTime}
                volume={gain}
                muted={muted}
                getThumbnail={(seconds) =>
                    thumbActions.getThumbnailAt(thumbnails, seconds)
                }
            />
        </div>
    );
};
