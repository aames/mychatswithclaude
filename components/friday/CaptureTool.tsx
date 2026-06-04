'use client';

import { useCallback, useRef, useState } from 'react';
import { imageDataToAscii } from '@/lib/friday/ascii';
import { bytesToBase64 } from '@/lib/friday/clip';
import { createBitcrusher } from '@/lib/friday/bitcrush';
import type { FridayClip, FridayFrame } from '@/lib/friday/types';

const COLS = 80;
const ROWS = 45;
const FPS = 15;

type Status = 'idle' | 'recording' | 'done';

// Captures whatever tab you share via getDisplayMedia, turning its VIDEO into
// color-ASCII frames and its AUDIO into a bitcrushed (8-bit-style) recording.
// Both are content-agnostic transforms of YOUR captured stream.
export function CaptureTool() {
  const [status, setStatus] = useState<Status>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(10);
  const [bits, setBits] = useState(6);
  const [reduction, setReduction] = useState(6);

  const clipRef = useRef<FridayClip | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const say = (m: string) => setLog((l) => [...l, m]);

  const start = useCallback(async () => {
    setLog([]);
    setStatus('recording');
    clipRef.current = null;
    audioBlobRef.current = null;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: FPS },
        audio: true,
      });
    } catch {
      say('✗ Capture cancelled or denied.');
      setStatus('idle');
      return;
    }

    say('● Capturing — pick the YouTube tab and SHARE TAB AUDIO.');

    // --- video → ascii frames ---
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    await video.play();

    const scratch = document.createElement('canvas');
    scratch.width = COLS;
    scratch.height = ROWS;
    const sctx = scratch.getContext('2d', { willReadFrequently: true })!;

    const palette: string[] = [];
    const paletteIndex = new Map<string, number>();
    const internColor = (hex: string): number => {
      let i = paletteIndex.get(hex);
      if (i === undefined) {
        i = palette.length;
        palette.push(hex);
        paletteIndex.set(hex, i);
      }
      return i;
    };

    const frames: FridayFrame[] = [];
    const captureFrame = () => {
      sctx.drawImage(video, 0, 0, COLS, ROWS);
      const img = sctx.getImageData(0, 0, COLS, ROWS);
      const resolved = imageDataToAscii(img, COLS, ROWS);
      const keys = new Uint8Array(COLS * ROWS);
      for (let i = 0; i < keys.length; i++) {
        keys[i] = internColor(quantize(resolved.colors[i]));
      }
      frames.push({ c: resolved.chars, k: bytesToBase64(keys) });
    };

    // --- audio → bitcrushed recording ---
    const audioTracks = stream.getAudioTracks();
    let recorder: MediaRecorder | null = null;
    const chunks: BlobPart[] = [];
    if (audioTracks.length) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const actx = new AC();
      const srcNode = actx.createMediaStreamSource(
        new MediaStream(audioTracks),
      );
      const crusher = await createBitcrusher(actx, { bits, reduction });
      const dest = actx.createMediaStreamDestination();
      srcNode.connect(crusher).connect(dest);
      recorder = new MediaRecorder(dest.stream, {
        mimeType: pickMime(),
      });
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.start();
      say('♪ Audio routed through bitcrusher (8-bit).');
    } else {
      say('⚠ No audio track shared — visuals only. Re-share with tab audio.');
    }

    const interval = window.setInterval(captureFrame, 1000 / FPS);

    // Stop after N seconds (or if the user stops sharing).
    const stopAll = () => {
      window.clearInterval(interval);
      stream.getTracks().forEach((t) => t.stop());
      recorder?.stop();
    };
    stream.getVideoTracks()[0].addEventListener('ended', stopAll);
    window.setTimeout(stopAll, seconds * 1000);

    await new Promise<void>((resolve) => {
      if (!recorder) {
        window.setTimeout(resolve, seconds * 1000 + 50);
        return;
      }
      recorder.onstop = () => {
        audioBlobRef.current = new Blob(chunks, { type: pickMime() });
        resolve();
      };
    });

    clipRef.current = { cols: COLS, rows: ROWS, fps: FPS, palette, frames };
    say(`✓ Done: ${frames.length} frames, ${palette.length} colors.`);
    setStatus('done');
  }, [seconds, bits, reduction]);

  const downloadClip = () => {
    if (!clipRef.current) return;
    downloadBlob(
      new Blob([JSON.stringify(clipRef.current)], { type: 'application/json' }),
      'clip.json',
    );
  };
  const downloadAudio = () => {
    if (!audioBlobRef.current) return;
    downloadBlob(audioBlobRef.current, 'audio.webm');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl mb-2">/friday capture</h1>
        <p className="text-green-600 text-sm mb-6">
          Share a browser tab (e.g. a YouTube video) <b>with tab audio</b>. Its
          video becomes color-ASCII frames; its audio is bitcrushed to 8-bit.
          Download both files into <code>public/friday/</code> and commit.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <label className="flex flex-col gap-1">
            seconds
            <input
              type="number"
              min={1}
              max={30}
              value={seconds}
              onChange={(e) => setSeconds(+e.target.value)}
              className="bg-green-950/40 border border-green-800 px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            bits (1–16)
            <input
              type="number"
              min={1}
              max={16}
              value={bits}
              onChange={(e) => setBits(+e.target.value)}
              className="bg-green-950/40 border border-green-800 px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            rate÷ (1–32)
            <input
              type="number"
              min={1}
              max={32}
              value={reduction}
              onChange={(e) => setReduction(+e.target.value)}
              className="bg-green-950/40 border border-green-800 px-2 py-1"
            />
          </label>
        </div>

        <button
          onClick={start}
          disabled={status === 'recording'}
          className="border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black disabled:opacity-40 transition-colors"
        >
          {status === 'recording' ? '● RECORDING…' : '▶ START CAPTURE'}
        </button>

        {status === 'done' && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={downloadClip}
              className="border border-green-500 px-3 py-2 hover:bg-green-500 hover:text-black"
            >
              ⬇ clip.json
            </button>
            <button
              onClick={downloadAudio}
              disabled={!audioBlobRef.current}
              className="border border-green-500 px-3 py-2 hover:bg-green-500 hover:text-black disabled:opacity-40"
            >
              ⬇ audio.webm
            </button>
          </div>
        )}

        <pre className="mt-6 text-xs text-green-500 whitespace-pre-wrap">
          {log.join('\n')}
        </pre>
      </div>
    </div>
  );
}

// Quantize a hex color to a coarser grid to keep the palette small.
function quantize(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const q = (n: number) => (Math.round(n / 32) * 32).toString(16).padStart(2, '0');
  return '#' + q(r) + q(g) + q(b);
}

function pickMime(): string {
  const opts = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
  for (const o of opts) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(o))
      return o;
  }
  return 'audio/webm';
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
