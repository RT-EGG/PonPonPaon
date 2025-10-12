import { ThumbParams } from "@/lib/ffmpegThumbs";
import React from "react";

export const Status = {
    idle: "idle",
    processing: "processing",
    finished: "finished",
    cancelled: "cancelled",
};
export type Status = (typeof Status)[keyof typeof Status];

export interface Thumbnail {
    src: string;
    rect: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
}

function useVideoThumbnail(onLoadedChunk: (thumbnails: Thumbnail[]) => void) {
    const status = React.useRef<Status>(Status.idle);

    const stepSec = 1;
    const tileHeight = 160;
    const rowCount = 10;
    const colCount = 10;
    const secPerImage = rowCount * colCount * stepSec; // 1枚に含まれる秒数

    const load = React.useCallback(
        async (filePath: string, duration: number) => {
            if (status.current === Status.processing) {
                await cancel();
            }

            let dimension: { width: number; height: number } | undefined =
                undefined;
            let thumbs: Thumbnail[] = [];
            let period = 0; // 読み込み完了枚数

            status.current = Status.processing;

            const outputDir = await window.thumbs.getOutputDir(filePath);
            while (status.current === Status.processing) {
                const startSec = period * secPerImage;
                if (startSec >= duration) {
                    break;
                }
                const periodDuration = Math.min(
                    secPerImage,
                    duration - startSec
                );
                if (periodDuration <= 1.0e-5) {
                    break;
                }

                const outputPath = `${outputDir}\\${("000" + period).slice(-4)}.jpg`;
                const url = await window.files.pathToFileUrl(outputPath);

                if (!(await window.files.exists(outputPath))) {
                    await window.thumbs.build(filePath, outputPath, {
                        stepSec: stepSec,
                        startSec: startSec,
                        durationSec: periodDuration,
                        tileHeight: tileHeight,
                        colCount: colCount,
                        rowCount: rowCount,
                        quality: 4,
                    });
                }

                if (!dimension) {
                    const size = await window.thumbs.getImageSize(outputPath);
                    dimension = {
                        width: size.width / colCount,
                        height: size.height / rowCount,
                    };
                }

                if (!dimension) {
                    break;
                }

                thumbs = [
                    ...thumbs,
                    ...[...Array(rowCount)].reduce(
                        (prev: Thumbnail[], _, row) => {
                            return [
                                ...prev,
                                ...[...Array(colCount)].map(
                                    (_, col) =>
                                        ({
                                            src: url,
                                            rect: {
                                                left: col * dimension!.width,
                                                top: row * dimension!.height,
                                                width: dimension!.width,
                                                height: dimension!.height,
                                            },
                                        }) as Thumbnail
                                ),
                            ];
                        },
                        []
                    ),
                ];

                onLoadedChunk(thumbs);

                period = period + 1;
            }

            status.current = Status.finished;
        },
        []
    );

    const cancel = React.useCallback(async () => {
        status.current = Status.cancelled;
    }, []);

    const getThumbnailAt = React.useCallback(
        (thumbnails: Thumbnail[], second: number) => {
            if (thumbnails.length === 0) {
                return undefined;
            }

            const index = Math.max(
                0,
                Math.min(
                    thumbnails.length - 1,
                    Math.trunc(Math.round(second / stepSec))
                )
            );
            return thumbnails[index];
        },
        []
    );

    return {
        load,
        cancel,
        getThumbnailAt,
    };
}

export default useVideoThumbnail;
