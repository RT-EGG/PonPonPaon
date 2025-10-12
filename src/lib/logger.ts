// main/logger.ts
import fs from "fs";
import path from "path";
import { app } from "electron";

export function logLine(msg: string) {
    try {
        const p = path.join(app.getPath("userData"), "logs");
        fs.mkdirSync(p, { recursive: true });
        const file = path.join(p, "main.log");
        const line = `[${new Date().toISOString()}] ${msg}\n`;
        fs.appendFileSync(file, line);
    } catch {
        /* 最後の砦なので握りつぶす */
    }
}
