import React from "react";

interface Props {
    anchorRef: React.RefObject<HTMLElement | null>;
    anchorPoint?: {
        vertical: "top" | "bottom" | "center";
        horizontal: "left" | "right" | "center";
    };
    pivotPoint?: {
        vertical: "top" | "bottom" | "center";
        horizontal: "left" | "right" | "center";
    };
    isShown: boolean;
    children?: React.ReactNode;
}

const Popup: React.FunctionComponent<Props> = (props: Props) => {
    const {
        anchorRef,
        anchorPoint = {
            vertical: "bottom",
            horizontal: "left",
        },
        pivotPoint = {
            vertical: "top",
            horizontal: "left",
        },
        isShown,
        children,
    } = props;
    const [visible, setVisible] = React.useState<boolean>(false);
    // 子コンポーネントの移動分
    const [translate, setTranslate] =
        React.useState<string>("translate(0%, 0%)");
    // 親コンポーネントから計算される基準値
    const [topLeft, setTopLeft] = React.useState<{
        top: number;
        left: number;
    }>({ top: 0, left: 0 });

    const verticalPivotToTransformY = React.useCallback(
        (anchor: "top" | "bottom" | "center") => {
            switch (anchor) {
                case "top":
                    return 0;
                case "bottom":
                    return -100;
                case "center":
                    return -50;
            }
        },
        []
    );

    const horizontalPivotToTransformX = React.useCallback(
        (anchor: "left" | "right" | "center") => {
            switch (anchor) {
                case "left":
                    return 0;
                case "right":
                    return -100;
                case "center":
                    return -50;
            }
        },
        []
    );

    React.useEffect(() => {
        if (!anchorRef.current || !isShown) {
            return;
        }

        const translateX = horizontalPivotToTransformX(pivotPoint.horizontal);
        const translateY = verticalPivotToTransformY(pivotPoint.vertical);
        setTranslate(`translate(${translateX}%, ${translateY}%)`);

        let top = anchorRef.current.getBoundingClientRect().top;
        switch (anchorPoint.vertical) {
            case "bottom":
                top += anchorRef.current.getBoundingClientRect().height;
                break;
            case "center":
                top += anchorRef.current.getBoundingClientRect().height / 2;
                break;
        }
        let left = anchorRef.current.getBoundingClientRect().left;
        switch (anchorPoint.horizontal) {
            case "right":
                left += anchorRef.current.getBoundingClientRect().width;
                break;
            case "center":
                left += anchorRef.current.getBoundingClientRect().width / 2;
                break;
        }
        setTopLeft({ top, left });

        setVisible(!!anchorRef.current && isShown);
    }, [anchorRef, anchorRef.current, anchorPoint, pivotPoint]);

    if (!anchorRef.current || !isShown || !visible) {
        return <React.Fragment />;
    }

    const anchorRect = anchorRef.current.getBoundingClientRect();

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0)",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    transform: translate,
                    top: topLeft.top,
                    left: topLeft.left,
                    pointerEvents: "auto",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default Popup;
