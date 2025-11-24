export const WindowType = {
    Main: "main",
    Debug: "debug",
};
export type WindowType = (typeof WindowType)[keyof typeof WindowType];