'use client';

import { useCallback, useRef, useState } from 'react';
import { bytesToBase64 } from '@/lib/friday/clip';
import { createBitcrusher } from '@/lib/friday/bitcrush';
import { medianCut } from '@/lib/friday/palette';
import type { RGB } from '@/lib/friday/palette';
import type { FridayClip, FridayFrame } from '@/lib/friday/types';

const FPS = 15;

type Status = 'idle' | 'recording' | 'done';

// Captures whatever tab you share via getDisplayMedia, turning its VIDEO into
// faithful high-res pixel-art frames (adaptive palette sampled from the source)
// and its AUDIO into a bitcrushed (8-bit-style) recording. Content-agnostic
// transforms of YOUR captured stream.
export function CaptureTool() {
  const [status, setStatus] = useState<Status>('idle');
  const [log, setLog] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(60);
  const [bits, setBits] = useState(6);
  const [reduction, setReduction] = useState(6);
  const [cols, setCols] = useState(256); // NES-native width
  const [colors, setColors] = useState(128);

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

    // --- video → pixel frames ---
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    await video.play();

    // Square pixel cells: rows follow the real source aspect ratio.
    const COLS = cols;
    const vw = video.videoWidth || 16;
    const vh = video.videoHeight || 9;
    const ROWS = Math.max(8, Math.round(COLS * (vh / vw)));
    say(`▦ grid ${COLS}×${ROWS} (source ${vw}×${vh})`);

    // Smooth downscale: draw video → small canvas with interpolation on.
    const scratch = document.createElement('canvas');
    scratch.width = COLS;
    scratch.height = ROWS;
    const sctx = scratch.getContext('2d', { willReadFrequently: true })!;
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';

    // Pass 1: store raw RGB per frame + collect color samples for the palette.
    const rawFrames: Uint8ClampedArray[] = [];
    const samples: RGB[] = [];
    const captureFrame = () => {
      sctx.drawImage(video, 0, 0, COLS, ROWS);
      const img = sctx.getImageData(0, 0, COLS, ROWS).data;
      rawFrames.push(new Uint8ClampedArray(img));
      // Subsample (every 5th pixel) to keep median-cut fast on long clips.
      for (let i = 0; i < img.length; i += 4 * 5) {
        samples.push([img[i], img[i + 1], img[i + 2]]);
      }
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

    // Pass 2: build an ADAPTIVE palette from the source's own colors, then map
    // every pixel to its nearest palette entry. No dithering — keep it crisp.
    say(`◐ Building ${colors}-color palette from ${samples.length} samples…`);
    const pal = medianCut(samples, colors);
    const frames: FridayFrame[] = rawFrames.map((img) => {
      const keys = new Uint8Array(COLS * ROWS);
      for (let p = 0; p < COLS * ROWS; p++) {
        const o = p * 4;
        keys[p] = pal.indexOf(img[o], img[o + 1], img[o + 2]);
      }
      return { k: bytesToBase64(keys) };
    });

    clipRef.current = {
      mode: 'pixel',
      cols: COLS,
      rows: ROWS,
      fps: FPS,
      palette: pal.hex,
      frames,
    };
    say(
      `✓ Done: ${frames.length} frames, ${pal.hex.length} colors @ ${COLS}×${ROWS}.`,
    );
    setStatus('done');
  }, [seconds, bits, reduction, cols, colors]);

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
          video becomes retro pixel-art frames; its audio is bitcrushed to
          8-bit. Download both files into <code>public/friday/</code> and commit.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
          <label className="flex flex-col gap-1">
            seconds
            <input
              type="number"
              min={1}
              max={120}
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
          <label className="flex flex-col gap-1">
            width px (128–384)
            <input
              type="number"
              min={128}
              max={384}
              step={16}
              value={cols}
              onChange={(e) => setCols(+e.target.value)}
              className="bg-green-950/40 border border-green-800 px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            colors (16–256)
            <input
              type="number"
              min={16}
              max={256}
              step={16}
              value={colors}
              onChange={(e) => setColors(+e.target.value)}
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
