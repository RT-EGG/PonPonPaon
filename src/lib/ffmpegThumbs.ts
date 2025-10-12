// src/main/thumbs.ts
import { spawn } from "child_process";
import { app } from "electron";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { imageSize } from "image-size";
import { resolveFfmpegPath } from "./ffmpeg";
import { logLine } from "./logger";

// export type ThumbParams_ = {
//     stepSec: number; // 例: 1
//     tileH: number; // 例: 160
//     cols: number; // 例: 10
//     rows: number; // 例: 10
//     durationSec: number; // Renderer 側で取得した duration を渡す
//     quality?: number; // 2(高)～6(低)。デフォ 4
//     pattern?: string;
//     args?: string[];
// };

export type ThumbResult = {
    dir: string;
    spritePattern: string; // 'sprite_%03d.jpg'
    vttPath: string;
    tileW: number;
    tileH: number;
    cols: number;
    rows: number;
    stepSec: number;
};

export function hashKey(filePath: string): string {
    const st = fs.statSync(filePath);
    const h = crypto.createHash("sha1");
    h.update(String(st.size));
    h.update("|");
    h.update(String(st.mtimeMs));
    h.update("|");
    h.update(filePath);
    return h.digest("hex");
}

// export async function buildThumbnails(
//     inputPath: string,
//     p: ThumbParams_
// ): Promise<ThumbResult> {
//     const ffmpeg = await resolveFfmpegPath();
//     const key = hashKey(inputPath);
//     const outDir = path.join(app.getPath("userData"), "thumb-cache", key);
//     const pattern = p.pattern ?? "sprite_%03d.jpg";
//     const sprite0 = path.join(outDir, "sprite_001.jpg");
//     const vttPath = path.join(outDir, "thumb.vtt");
//     const q = p.quality ?? 4;

//     // 既存キャッシュがあれば再利用
//     if (fs.existsSync(sprite0) && fs.existsSync(vttPath)) {
//         const size = imageSize(fs.readFileSync(sprite0));
//         const tileW = Math.floor((size.width ?? 0) / p.cols);
//         return {
//             dir: outDir,
//             spritePattern: pattern,
//             vttPath,
//             tileW,
//             tileH: p.tileH,
//             cols: p.cols,
//             rows: p.rows,
//             stepSec: p.stepSec,
//         };
//     }

//     fs.mkdirSync(outDir, { recursive: true });

//     // ffmpeg コマンド（例）:
//     // fps=STEP で等間隔にフレームを拾い、scale=-2:TILEH、tile=COLSxROWS で 1 枚のスプライト化
//     const vf = `fps=${p.stepSec > 0 ? 1 / p.stepSec : 1},scale=-2:${p.tileH}:flags=bicubic,tile=${p.cols}x${p.rows}`;
//     const args = p.args ?? [
//         "-hide_banner",
//         "-loglevel",
//         "error",
//         "-i",
//         inputPath,
//         "-vf",
//         vf,
//         "-q:v",
//         String(q),
//         path.join(outDir, pattern),
//     ];

//     await new Promise<void>((resolve, reject) => {
//         const proc = spawn(ffmpeg, args, { windowsHide: true });
//         proc.on("error", reject);
//         proc.on("exit", (code) =>
//             code === 0 ? resolve() : reject(new Error("ffmpeg exit " + code))
//         );
//     });

//     // 1枚目でタイルサイズを求める
//     const dim = imageSize(fs.readFileSync(sprite0));
//     if (!dim.width || !dim.height)
//         throw new Error("failed to read sprite size");
//     const tileW = Math.floor(dim.width / p.cols);
//     // rows は高さの分割数なので tileH は指定値そのままでOK（念のため割ってもよい）
//     // const tileH = Math.floor(dim.height / p.rows);

//     // VTT を生成
//     const cues: string[] = [];
//     cues.push("WEBVTT", "");
//     const perSheet = p.cols * p.rows;

//     const totalFrames = Math.max(1, Math.ceil(p.durationSec / p.stepSec));
//     for (let i = 0; i < totalFrames; i++) {
//         const t0 = i * p.stepSec;
//         const t1 = Math.min((i + 1) * p.stepSec, p.durationSec);

//         const sheet = Math.floor(i / perSheet);
//         const idxInSheet = i % perSheet;
//         const cx = idxInSheet % p.cols;
//         const cy = Math.floor(idxInSheet / p.cols);

//         const x = cx * tileW;
//         const y = cy * p.tileH;

//         const spriteName = `sprite_${String(sheet).padStart(3, "0")}.jpg`;
//         cues.push(`${fmt(t0)} --> ${fmt(t1)}`);
//         cues.push(`${spriteName}#xywh=${x},${y},${tileW},${p.tileH}`);
//         cues.push("");
//     }
//     fs.writeFileSync(vttPath, cues.join("\n"), "utf8");

//     return {
//         dir: outDir,
//         spritePattern: pattern,
//         vttPath,
//         tileW,
//         tileH: p.tileH,
//         cols: p.cols,
//         rows: p.rows,
//         stepSec: p.stepSec,
//     };
// }

export type ThumbParams = {
    stepSec: number; // 例: 1
    startSec: number;
    durationSec: number; // Renderer 側で取得した duration を渡す
    tileHeight: number; // 例: 160
    colCount: number; // 例: 10
    rowCount: number; // 例: 10
    quality: number; // 2(高)～6(低)。デフォ 4
};

export async function buildThumbnail(
    inputPath: string,
    outputPath: string,
    p: ThumbParams
): Promise<boolean> {
    const ffmpeg = await resolveFfmpegPath();

    const dir = path.dirname(outputPath);
    logLine(`directory: ${outputPath}, ${dir}`);

    fs.mkdirSync(dir, { recursive: true });

    // ffmpeg コマンド（例）:
    // fps=STEP で等間隔にフレームを拾い、scale=-2:TILEH、tile=COLSxROWS で 1 枚のスプライト化
    const vf = `fps=${p.stepSec > 0 ? 1 / p.stepSec : 1},scale=-2:${p.tileHeight}:flags=bicubic,tile=${p.colCount}x${p.rowCount}`;
    const args = [
        "-ss",
        String(p.startSec),
        "-hide_banner",
        "-loglevel",
        "error",
        "-t",
        String(p.durationSec),
        "-i",
        inputPath,
        "-vf",
        vf,
        "-q:v",
        String(p.quality),
        outputPath,
    ];

    try {
        await new Promise<void>((resolve, reject) => {
            const proc = spawn(ffmpeg, args, { windowsHide: true });
            proc.on("error", reject);
            proc.on("exit", (code) =>
                code === 0
                    ? resolve()
                    : reject(new Error("ffmpeg exit " + code))
            );
        });
    } catch {
        return false;
    }
    return true;

    // 1枚目でタイルサイズを求める
    // const dim = imageSize(fs.readFileSync(sprite0));
    // if (!dim.width || !dim.height)
    //     throw new Error("failed to read sprite size");
    // const tileW = Math.floor(dim.width / p.cols);
    // rows は高さの分割数なので tileH は指定値そのままでOK（念のため割ってもよい）
    // const tileH = Math.floor(dim.height / p.rows);

    // VTT を生成
    // const cues: string[] = [];
    // cues.push("WEBVTT", "");
    // const perSheet = p.cols * p.rows;

    // const totalFrames = Math.max(1, Math.ceil(p.durationSec / p.stepSec));
    // for (let i = 0; i < totalFrames; i++) {
    //     const t0 = i * p.stepSec;
    //     const t1 = Math.min((i + 1) * p.stepSec, p.durationSec);

    //     const sheet = Math.floor(i / perSheet);
    //     const idxInSheet = i % perSheet;
    //     const cx = idxInSheet % p.cols;
    //     const cy = Math.floor(idxInSheet / p.cols);

    //     const x = cx * tileW;
    //     const y = cy * p.tileH;

    //     const spriteName = `sprite_${String(sheet).padStart(3, "0")}.jpg`;
    //     cues.push(`${fmt(t0)} --> ${fmt(t1)}`);
    //     cues.push(`${spriteName}#xywh=${x},${y},${tileW},${p.tileH}`);
    //     cues.push("");
    // }
    // fs.writeFileSync(vttPath, cues.join("\n"), "utf8");

    // return {
    //     dir: outDir,
    //     spritePattern: pattern,
    //     vttPath,
    //     tileW,
    //     tileH: p.tileH,
    //     cols: p.cols,
    //     rows: p.rows,
    //     stepSec: p.stepSec,
    // };
}

function fmt(sec: number) {
    const s = Math.max(0, sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${ss.toFixed(3).padStart(6, "0")}`;
}
