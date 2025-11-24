const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
    target: "web",
    entry: "./src/web/index.tsx",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "renderer.js",
        publicPath: "/",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/web/index.html",
            filename: "index.html",
        }),
    ],
    mode: isDev ? "development" : "production",
    devtool: isDev ? "source-map" : false,
    devServer: {
        port: 3000,
        host: 'localhost',
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        hot: true,
        compress: true,
        historyApiFallback: true,
        allowedHosts: 'all',
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
        // ローカルファイルアクセスを許可
        client: {
            webSocketURL: 'ws://localhost:3000/ws',
        },
        // セキュリティ設定を開発環境用に調整
        allowedHosts: 'all',
    },
};