import { Perlin } from "libnoise-ts/module/generator";
import Module from "libnoise-ts/module/Module";
import { Plane } from "libnoise-ts/model";
import SimplexNoise from "simplex-noise";

export interface NoisePicker {
  getValue(x: number, y: number): number;
}

function shiftRight(x: number) {
  return x + Number.MAX_SAFE_INTEGER / 4;
}
class SimplexAdapter {
  private simplex: SimplexNoise;
  private scale: number;
  constructor({ seed, scale = 300 }: { seed?: string; scale?: number }) {
    this.simplex = new SimplexNoise(seed);
    this.scale = scale;
  }
  getValue(x: number, y: number) {
    return this.simplex.noise2D(
      shiftRight(x) / this.scale,
      shiftRight(y) / this.scale
    );
  }
}

export const precipitationMap = new SimplexAdapter({
  seed: "precipitation",
});
export const temperatureMap = new SimplexAdapter({ seed: "temperature" });
export const displacementMap1 = new SimplexAdapter({
  seed: "displace1",
  scale: 3,
});
export const displacementMap2 = new SimplexAdapter({
  seed: "displace2",
  scale: 3,
});

export interface PerlinNoiseInput {
  frequency?: number;
  persistence?: number;
  lacunarity?: number;
  octaves?: number;
  seed?: number;
  quality?: number;
}

const DEFAULT_PERLIN_FREQUENCY = 1.0;
const DEFAULT_PERLIN_LACUNARITY = 2.0;
const DEFAULT_PERLIN_OCTAVE_COUNT = 6;
const DEFAULT_PERLIN_PERSISTENCE = 0.5;
const DEFAULT_PERLIN_SEED = 0;

function createPerlin({
  frequency = DEFAULT_PERLIN_FREQUENCY,
  lacunarity = DEFAULT_PERLIN_LACUNARITY,
  octaves = DEFAULT_PERLIN_OCTAVE_COUNT,
  persistence = DEFAULT_PERLIN_PERSISTENCE,
  seed = DEFAULT_PERLIN_SEED,
}: PerlinNoiseInput) {
  return new Perlin(frequency, lacunarity, octaves, persistence, seed);
}

const temperaturePerlin: Perlin = createPerlin({
  seed: 3000,
  frequency: 0.004,
  persistence: 0.01,
  octaves: 12,
});
const precipitationPerlin: Perlin = createPerlin({
  seed: 6000,
  frequency: 0.004,
  persistence: 0.1,
  octaves: 12,
});

class BetterPlane {
  private plane: Plane;
  constructor(noise: Module) {
    this.plane = new Plane(noise);
  }
  getValue(x: number, y: number) {
    return this.plane.getValue(shiftRight(x), shiftRight(y));
  }
}

export const temperatureNoise = new BetterPlane(temperaturePerlin);
export const precipitationNoise = new BetterPlane(precipitationPerlin);
