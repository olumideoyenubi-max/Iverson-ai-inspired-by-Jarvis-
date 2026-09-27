export type MotionWatcherOptions = {
  video: HTMLVideoElement;
  sensitivity?: number; // 0..100, higher = less sensitive
  onMotion?: (score: number) => void;
  onFrame?: (score: number) => void;
  intervalMs?: number;
};

export type MotionWatcher = {
  stop: () => void;
};

export function startMotionWatcher(opts: MotionWatcherOptions): MotionWatcher {
  const { video, onMotion, onFrame, sensitivity = 25, intervalMs = 220 } = opts;
  const width = 64;
  const height = 48;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let prevFrame: Uint8ClampedArray | null = null;
  let stopped = false;
  let lastMotionTime = 0;

  const tick = () => {
    if (stopped) return;
    if (!ctx || video.readyState < 2) {
      setTimeout(tick, intervalMs);
      return;
    }
    try {
      ctx.drawImage(video, 0, 0, width, height);
      const frame = ctx.getImageData(0, 0, width, height).data;
      if (prevFrame) {
        let diffSum = 0;
        for (let i = 0; i < frame.length; i += 4) {
          const dr = Math.abs(frame[i] - prevFrame[i]);
          const dg = Math.abs(frame[i + 1] - prevFrame[i + 1]);
          const db = Math.abs(frame[i + 2] - prevFrame[i + 2]);
          diffSum += dr + dg + db;
        }
        const avgDiff = diffSum / (width * height * 3);
        onFrame?.(avgDiff);
        const threshold = Math.max(2, 30 - sensitivity * 0.25);
        const now = Date.now();
        if (avgDiff > threshold && now - lastMotionTime > 1500) {
          lastMotionTime = now;
          onMotion?.(avgDiff);
        }
      }
      prevFrame = frame;
    } catch {
      /* ignore transient decode errors */
    }
    setTimeout(tick, intervalMs);
  };

  tick();

  return {
    stop: () => {
      stopped = true;
    },
  };
}

export async function requestCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
}
