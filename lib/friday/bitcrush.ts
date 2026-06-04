// A generic "chiptune-ifier": a bitcrusher (bit-depth reduction) + sample-rate
// decimation, the classic recipe for an 8-bit/retro audio texture. This is a
// content-agnostic audio EFFECT — it processes whatever audio is fed into it
// (in our case, the tab audio you capture), it does not generate any melody.
//
// Implemented as an AudioWorklet when available, with a ScriptProcessor
// fallback for older browsers.

const WORKLET_NAME = 'bitcrusher-processor';

const WORKLET_SRC = `
class BitcrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bits', defaultValue: 6, minValue: 1, maxValue: 16 },
      { name: 'reduction', defaultValue: 6, minValue: 1, maxValue: 32 },
    ];
  }
  constructor() {
    super();
    this._phase = 0;
    this._last = 0;
  }
  process(inputs, outputs, params) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || input.length === 0) return true;
    const bits = params.bits.length > 1 ? null : params.bits[0];
    const red = params.reduction.length > 1 ? null : params.reduction[0];
    for (let ch = 0; ch < output.length; ch++) {
      const inCh = input[ch] || input[0];
      const outCh = output[ch];
      let phase = this._phase;
      let last = this._last;
      for (let i = 0; i < outCh.length; i++) {
        const b = bits ?? params.bits[i];
        const r = red ?? params.reduction[i];
        const step = Math.pow(0.5, b);
        phase += 1;
        if (phase >= r) {
          phase -= r;
          last = step * Math.floor(inCh[i] / step + 0.5);
        }
        outCh[i] = last;
      }
      if (ch === output.length - 1) {
        this._phase = phase;
        this._last = last;
      }
    }
    return true;
  }
}
registerProcessor('${WORKLET_NAME}', BitcrusherProcessor);
`;

export type CrushSettings = { bits: number; reduction: number };

export async function createBitcrusher(
  ctx: AudioContext,
  settings: CrushSettings = { bits: 6, reduction: 6 },
): Promise<AudioNode> {
  if (ctx.audioWorklet) {
    try {
      const blob = new Blob([WORKLET_SRC], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(ctx, WORKLET_NAME);
      (node.parameters.get('bits') as AudioParam).value = settings.bits;
      (node.parameters.get('reduction') as AudioParam).value =
        settings.reduction;
      return node;
    } catch {
      // fall through to ScriptProcessor
    }
  }
  return createScriptProcessorCrusher(ctx, settings);
}

function createScriptProcessorCrusher(
  ctx: AudioContext,
  settings: CrushSettings,
): AudioNode {
  const node = ctx.createScriptProcessor(4096, 1, 1);
  let phase = 0;
  let last = 0;
  const step = Math.pow(0.5, settings.bits);
  node.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < input.length; i++) {
      phase += 1;
      if (phase >= settings.reduction) {
        phase -= settings.reduction;
        last = step * Math.floor(input[i] / step + 0.5);
      }
      output[i] = last;
    }
  };
  return node;
}
