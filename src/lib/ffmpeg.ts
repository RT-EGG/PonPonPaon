// src/main/ffmpegPath.ts
import { app } from "electron";
import { existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";

function which(cmd: string): string | null {
    try {
        const out = execSync(
            process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`,
            {
                stdio: ["ignore", "pipe", "ignore"],
                encoding: "utf8",
            }
        );
        return (
            out
                .split(/\r?\n/)
                .map((s) => s.trim())
                .find(Boolean) || null
        );
    } catch {
        return null;
    }
}

export async function resolveFfmpegPath(): Promise<string> {
    // 1) ENV 優先（配布でも使える）
    const env = process.env.FFMPEG_PATH;
    if (env && existsSync(env)) return env;

    // 2) dev: ffmpeg-static を“実行時 require”で解決（external 済み前提）
    if (!app.isPackaged) {
        const r: NodeJS.Require =
            (global as any).__non_webpack_require__ || require;
        try {
            const p = r("ffmpeg-static") as unknown as string; // ← 絶対パスが返る
            if (p && path.isAbsolute(p) && existsSync(p)) return p;
        } catch {
            /* fallthrough */
        }

        // （必要時のみ）dynamic import フォールバック
        try {
            // @vite-ignore は webpack でも無害
            const mod: any = await import(/* @vite-ignore */ "ffmpeg-static");
            const p: string = mod?.default || mod;
            if (p && path.isAbsolute(p) && existsSync(p)) return p;
        } catch {
            /* fallthrough */
        }
    }

    // 3) PATH から探す（配布時）
    const bin = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
    const sys = which(bin);
    if (sys) return sys;

    throw new Error(
        "FFmpeg not found. Set FFMPEG_PATH or install ffmpeg (ensure it's on PATH)."
    );
}
