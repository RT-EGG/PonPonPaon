const path = require("path");

const isDev = process.env.NODE_ENV === "development";

module.exports = [
    // メインプロセス用の設定
    {
        target: "electron-main",
        entry: "./src/main.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "main.js",
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        mode: isDev ? "development" : "production",
        node: {
            __dirname: false,
            __filename: false,
        },
        externals: ["fsevents", { "ffmpeg-static": "commonjs ffmpeg-static" }],
    },
    // プリロードスクリプト用の設定
    {
        target: "electron-preload",
        entry: "./src/preload.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "preload.js",
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        mode: isDev ? "development" : "production",
        node: {
            __dirname: false,
            __filename: false,
        },
    },
];