import { Popup } from "@/shared/ui";
import React from "react";
import { FaVolumeMute, FaVolumeDown, FaVolumeUp } from "react-icons/fa";

interface Props {
    style?: React.CSSProperties;
    maxValue?: number;
    value: number;
    muted: boolean;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
}

const VolumeController: React.FunctionComponent<Props> = (props: Props) => {
    const { style, maxValue = 1.0, value, muted, setVolume, setMuted } = props;
    const ref = React.useRef<HTMLButtonElement | null>(null);
    const scaleRef = React.useRef<HTMLDivElement | null>(null);
    const popupRef = React.useRef<HTMLDivElement | null>(null);
    const [isMouseOverredBody, setIsMouseOverredBody] =
        React.useState<boolean>(false);
    const [isMouseOverriedPopup, setIsMouseOverredPopup] =
        React.useState<boolean>(false);
    const [isClicking, setIsClicking] = React.useState<boolean>(false);

    const getVolumeFromPosition = React.useCallback(
        (clientX: number) => {
            if (!scaleRef.current) {
                return 0;
            }

            const rect = scaleRef.current.getBoundingClientRect();
            const frac = Math.min(
                1,
                Math.max(0, (clientX - rect.left) / rect.width)
            );
            return frac * maxValue;
        },
        [scaleRef.current]
    );

    const percent = (value / maxValue) * 100;

    return (
        <div
            style={{
                ...style,
            }}
            onPointerLeave={() => {
                setIsMouseOverredBody(false);
            }}
        >
            <button
                ref={ref}
                style={{
                    cursor: "default",
                    border: "none",
                }}
                onClick={() => setMuted(!muted)}
                onPointerEnter={() => setIsMouseOverredBody(true)}
            >
                {muted ? (
                    <FaVolumeMute />
                ) : maxValue < 0.5 ? (
                    <FaVolumeDown />
                ) : (
                    <FaVolumeUp />
                )}
            </button>
            <Popup
                anchorRef={ref}
                anchorPoint={{
                    vertical: "top",
                    horizontal: "center",
                }}
                pivotPoint={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                isShown={
                    isMouseOverredBody || isMouseOverriedPopup || isClicking
                }
            >
                <div
                    ref={popupRef}
                    style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "white",
                        border: "1px solid black",
                        padding: "8px",
                    }}
                    onPointerEnter={() => setIsMouseOverredPopup(true)}
                    onPointerLeave={() => setIsMouseOverredPopup(false)}
                >
                    <FaVolumeDown />
                    <div
                        ref={scaleRef}
                        style={{
                            width: "100px",
                            height: "24px",
                            margin: "0px 8px",
                            background: "black",
                            clipPath: "polygon(0% 100%, 100% 100%, 100% 0%)",
                        }}
                        onPointerDown={(
                            e: React.PointerEvent<HTMLDivElement>
                        ) => {
                            if (e.button !== 0) {
                                return;
                            }

                            e.currentTarget.setPointerCapture(e.pointerId);
                            setIsClicking(true);
                            setVolume(getVolumeFromPosition(e.clientX));
                        }}
                        onPointerMove={(
                            e: React.PointerEvent<HTMLDivElement>
                        ) => {
                            if (!isClicking) {
                                return;
                            }
                            setVolume(getVolumeFromPosition(e.clientX));
                        }}
                        onPointerUp={(
                            e: React.PointerEvent<HTMLDivElement>
                        ) => {
                            e.currentTarget.releasePointerCapture(e.pointerId);
                            setIsClicking(false);
                        }}
                    >
                        <div
                            style={{
                                width: "100px",
                                height: "24px",
                                background: "system-ui",
                                clipPath:
                                    "polygon(0% 100%, 100% 100%, 100% 0%)",
                            }}
                        >
                            <div
                                style={{
                                    width: "100px",
                                    height: "100%",
                                    margin: "0px 8px",
                                    background:
                                        "linear-gradient(to right, #00FF00, #FF0000)",
                                    clipPath: `polygon(0% 100%, ${percent}% 100%, ${percent}% 0%)`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <FaVolumeUp />
                </div>
            </Popup>
            <Popup
                anchorRef={popupRef}
                anchorPoint={{
                    vertical: "top",
                    horizontal: "center",
                }}
                pivotPoint={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                isShown={isClicking}
            >
                <div
                    style={{
                        background: "white",
                        fontSize: "12px",
                        padding: "4px",
                    }}
                >
                    {`${(percent * maxValue).toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    })}%`}
                </div>
            </Popup>
        </div>
    );
};

export default VolumeController;
