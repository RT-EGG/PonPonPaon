import React from "react";

interface Props {
    disabled?: boolean;
    style?: React.CSSProperties;
    knobStyle?: React.CSSProperties;
    duration: number; // in seconds
    currentTime: number; // in seconds
    volume: number; // 0.0 - 1.0
    muted: boolean;
    onStartSeek: () => void;
    onSeek: (time: number) => void;
    onCommitSeek: (time: number) => void;
    onPointerOver?: (clientX: number, time: number) => void;
}

const SeekBar: React.FunctionComponent<Props> = (props: Props) => {
    const {
        disabled,
        style,
        knobStyle,
        duration,
        currentTime,
        onStartSeek,
        onSeek,
        onCommitSeek,
        onPointerOver,
    } = props;

    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const [previewTime, setPreviewTime] = React.useState<number | null>(null);

    const clamp = (v: number, min = 0, max = 1) =>
        Math.min(max, Math.max(min, v));

    const toSec = React.useCallback(
        (clientX: number) => {
            const rect = trackRef.current!.getBoundingClientRect();
            const frac = clamp((clientX - rect.left) / rect.width);
            return frac * (duration || 0);
        },
        [trackRef.current, duration]
    );

    const pointerEvents = {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setIsDragging(true);
            onStartSeek();
            const sec = toSec(e.clientX);
            onSeek(sec);
            setPreviewTime(sec);
        },
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
            const sec = toSec(e.clientX);
            onPointerOver?.(e.clientX, sec);
            if (!isDragging) {
                return;
            }
            onSeek(sec);
            setPreviewTime(sec);
        },
        onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isDragging) {
                return;
            }
            e.currentTarget.releasePointerCapture(e.pointerId);
            onCommitSeek(toSec(e.clientX));
            setIsDragging(false);
            setPreviewTime(null);
        },
    };

    const frac =
        duration > 0 ? clamp((previewTime ?? currentTime) / duration) : 0;

    return (
        <div
            ref={trackRef}
            role={"slider"}
            style={{
                position: "relative",
                margin: 8,
                borderRadius: 999,
                background: "rgba(128,128,128,1.0)",
                cursor: "default",
                userSelect: "none",
                ...style,
            }}
            {...pointerEvents}
        >
            {/* played */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    width: `${frac * 100}%`,
                    background: "rgba(64,128,255,1.0)",
                    borderRadius: 999,
                    pointerEvents: "none",
                    cursor: "default",
                }}
            />
            {/* Knob */}
            <div
                style={{
                    position: "absolute",
                    width: 8,
                    left: `${frac * 100}%`,
                    transform: "translate(-50%, -25%)",
                    background: "rgba(255,255,255,1.0)",
                    boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                    borderRadius: 999,
                    cursor: "default",
                    ...knobStyle,
                }}
                {...pointerEvents}
            />
        </div>
    );
};

export default SeekBar;
