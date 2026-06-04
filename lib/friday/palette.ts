// Median-cut color quantization. Given all the RGB pixels seen across the clip,
// it produces a small palette that matches the SOURCE's actual colors (adaptive)
// and a fast nearest-color lookup. This keeps clean pixel art (e.g. a NES scene)
// looking faithful, instead of forcing it onto a wrong fixed palette.

export type RGB = [number, number, number];

type Box = { colors: RGB[] };

export class Palette {
  readonly colors: RGB[];
  readonly hex: string[];
  // 6-bit-per-channel cache: 262144 slots → palette index.
  private cache = new Int32Array(262144).fill(-1);

  constructor(colors: RGB[]) {
    this.colors = colors.length ? colors : [[0, 0, 0]];
    this.hex = this.colors.map(([r, g, b]) => rgbToHex(r, g, b));
  }

  indexOf(r: number, g: number, b: number): number {
    const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
    const cached = this.cache[key];
    if (cached >= 0) return cached;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.colors.length; i++) {
      const [cr, cg, cb] = this.colors[i];
      const d = (cr - r) ** 2 + (cg - g) ** 2 + (cb - b) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    this.cache[key] = best;
    return best;
  }
}

/** Build an adaptive palette of up to `maxColors` colors from samples. */
export function medianCut(samples: RGB[], maxColors = 128): Palette {
  if (samples.length === 0) return new Palette([[0, 0, 0]]);

  let boxes: Box[] = [{ colors: samples }];
  while (boxes.length < maxColors) {
    let target = -1;
    let targetRange = -1;
    let targetChannel = 0;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].colors.length <= 1) continue;
      const { range, channel } = boxRange(boxes[i]);
      if (range > targetRange) {
        targetRange = range;
        target = i;
        targetChannel = channel;
      }
    }
    if (target < 0) break;

    const box = boxes[target];
    box.colors.sort((a, b) => a[targetChannel] - b[targetChannel]);
    const mid = box.colors.length >> 1;
    boxes.splice(
      target,
      1,
      { colors: box.colors.slice(0, mid) },
      { colors: box.colors.slice(mid) },
    );
  }

  return new Palette(boxes.map((box) => averageColor(box.colors)));
}

function boxRange(box: Box): { range: number; channel: number } {
  const min: RGB = [255, 255, 255];
  const max: RGB = [0, 0, 0];
  for (const c of box.colors) {
    for (let k = 0; k < 3; k++) {
      if (c[k] < min[k]) min[k] = c[k];
      if (c[k] > max[k]) max[k] = c[k];
    }
  }
  const ranges = [max[0] - min[0], (max[1] - min[1]) * 1.2, max[2] - min[2]];
  let channel = 0;
  let range = ranges[0];
  if (ranges[1] > range) {
    range = ranges[1];
    channel = 1;
  }
  if (ranges[2] > range) {
    range = ranges[2];
    channel = 2;
  }
  return { range, channel };
}

function averageColor(colors: RGB[]): RGB {
  let r = 0,
    g = 0,
    b = 0;
  for (const c of colors) {
    r += c[0];
    g += c[1];
    b += c[2];
  }
  const n = colors.length || 1;
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
}
