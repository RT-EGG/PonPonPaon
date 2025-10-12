import React from "react";

export interface Props {
    styles?: React.CSSProperties;
    src: string;
    spriteLeft: number;
    spriteTop: number;
    spriteWidth: number;
    spriteHeight: number;
}

const Sprite: React.FunctionComponent<Props> = (props: Props) => {
    const { styles, src, spriteLeft, spriteTop, spriteWidth, spriteHeight } =
        props;

    return (
        <div
            style={{
                width: `${spriteWidth}px`,
                height: `${spriteHeight}px`,
                backgroundImage: `url(${src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: `-${spriteLeft}px -${spriteTop}px`,
                ...styles,
            }}
        />
    );
};

export default Sprite;
