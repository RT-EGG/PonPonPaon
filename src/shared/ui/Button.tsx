import * as React from "react";

interface Props {
    children?: React.ReactNode;
    disabled?: boolean;
    onClick: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: React.FunctionComponent<Props> = (props: Props) => {
    const { children, disabled, onClick } = props;

    return (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

export default Button;
