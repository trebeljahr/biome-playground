import { Perlin } from "libnoise-ts/module/generator";
import { Plane } from "libnoise-ts/builders";

interface PerlinNoiseInput {
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

const tempPerlin: Perlin = createPerlin({
  seed: 1000,
  frequency: 0.5,
  // persistence: 0.01,
});

const width = 256;
const height = 256;

export const temperaturePlane = new Plane(
  tempPerlin,
  width,
  height,
  true
);

temperaturePlane.build();


const canvas: any = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const arr = new Uint8ClampedArray(width * height);

for (let i = 0; i < arr.length; i += 4) {
  arr[i + 0] = 0;    // R value
  arr[i + 1] = 190;  // G value
  arr[i + 2] = 0;    // B value
  arr[i + 3] = 255;  // A value
}

const imageData = new ImageData(arr, width)
ctx.putImageData(imageData, 20, 20);