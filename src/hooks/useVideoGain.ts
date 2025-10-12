import React from "react";

function useVideoGain(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const contextRef = React.useRef<AudioContext | null>(null);
    const sourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);
    const gainRef = React.useRef<GainNode | null>(null);
    const [ready, setReady] = React.useState<boolean>(false);

    React.useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            return;
        }

        contextRef.current = contextRef.current || new AudioContext();

        // 既存の接続を解除する
        try {
            sourceRef.current?.disconnect();
        } catch {}

        sourceRef.current =
            sourceRef.current ??
            contextRef.current.createMediaElementSource(video);

        // GainNode作成
        gainRef.current = gainRef.current || contextRef.current.createGain();
        gainRef.current.gain.value = 1.0;

        // 接続
        sourceRef.current?.connect(gainRef.current);
        gainRef.current.connect(contextRef.current.destination);

        video.volume = 1.0;

        setReady(true);

        return () => {
            try {
                sourceRef.current?.disconnect();
            } catch {}
        };
    }, [videoRef, videoRef.current]);

    const resume = React.useCallback(async () => {
        if (contextRef.current && contextRef.current.state !== "running") {
            await contextRef.current.resume();
        }
    }, []);

    // 直線ゲイン（0..∞, 1=等倍）
    const setLinear = React.useCallback((g: number) => {
        if (gainRef.current) {
            gainRef.current.gain.value = Math.max(0, g);
        }
    }, []);

    // dB 指定（例: -50〜+12 dB）
    const setDb = React.useCallback((db: number) => {
        if (gainRef.current) {
            gainRef.current.gain.value = Math.pow(10, db / 20);
        }
    }, []);

    // 0..1 を知覚カーブで dB にマップ（UI用）
    const setPerceptual01 = React.useCallback(
        (t: number, minDb = -50, maxDb = 12) => {
            const clamped = Math.min(1, Math.max(0, t));
            const db = minDb + (maxDb - minDb) * clamped;
            if (gainRef.current) {
                gainRef.current.gain.value = Math.pow(10, db / 20);
            }
        },
        []
    );

    return {
        ready,
        resume, // クリック等のユーザー操作で呼ぶ
        setLinear, // 例: 0〜2（+6dB）をUIに
        setDb, // dBで直接
        setPerceptual01, // 0..1スライダーを自然なカーブに
        getGain: () => gainRef.current?.gain.value ?? 1,
        context: contextRef.current,
    };
}

export default useVideoGain;
