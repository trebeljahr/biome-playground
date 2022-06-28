import "./main.css";
import { Perlin } from "libnoise-ts/module/generator";
import { Plane as PlaneBuilder } from "libnoise-ts/builders";
import { Plane } from "libnoise-ts/model";
import { biomes } from "./biomePlayground";

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
  seed: Math.random(),
  frequency: 0.02,
  persistence: 0.001,
});

const width = 16;

export const temperaturePlane = new PlaneBuilder(
  tempPerlin,
  width,
  width,
  true
);

const noisePlane = new Plane(tempPerlin);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

console.log(canvas.width);
console.log(canvas.height);
console.log(window.innerWidth);
console.log(window.innerHeight);

const arr = new Uint8ClampedArray(width * width * 4);

function map_range(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

Plane;

temperaturePlane.build();

function drawNoise(offsetX = 0, offsetY = 0) {
  // temperaturePlane.setBounds(
  //   offsetX,
  //   offsetY,
  //   offsetX + width,
  //   offsetY + height
  // );
  // temperaturePlane.build();
  let noiseArr: number[] = [];
  let iterations = 0;
  for (let i = 0; i < arr.length; i += 4) {
    iterations++;
    const x =
      ((iterations - 1) % width) +
      offsetX * width +
      Number.MIN_SAFE_INTEGER / 2;
    const y =
      Math.floor(iterations / width) +
      offsetY * width +
      Number.MIN_SAFE_INTEGER / 2;
    // console.log({ x, y });
    const noise = noisePlane.getValue(x, y);

    noiseArr.push(noise);
    // const noise = temperaturePlane.noiseMap.getValue(x, y);
    // console.log(noise);
    const rgb = Math.floor(map_range(noise, 0, 1, 0, 255));
    // console.log(rgb, iterations);

    arr[i + 0] = rgb; // R value
    arr[i + 1] = rgb; // G value
    arr[i + 2] = rgb; // B value
    arr[i + 3] = 255; // A value
  }

  const imageData = new ImageData(arr, width);
  ctx.putImageData(imageData, offsetX * width, offsetY * width);
  // colors.forEach((color, i) => {
  //   console.log(color);
  //   ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
  //   ctx.fillRect(Math.floor(i / width) * 16, (i % width) * 16, 16, 16);
  // });
  return noiseArr;
}

function compare(a: number[], b: number[]) {
  return a.every((e, i) => b[i] === e) && b.every((e, i) => a[i] === e);
}

function drawOutline(x, y, width, height) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, width, height);
}
function drawBiomes() {
  Object.values(biomes).map(({ temperature, humidity, color }) => {
    const maxTemp = map_range(temperature.max, -15, 50, 0, canvas.width);
    const minTemp = map_range(temperature.min, -15, 50, 0, canvas.width);
    const maxHumid = map_range(humidity.max, 0, 100, 0, canvas.width);
    const minHumid = map_range(humidity.min, 0, 100, 0, canvas.width);

    const y = map_range(temperature.min, -15, 50, 0, canvas.width);
    const x = map_range(humidity.min, 0, 100, 0, canvas.width);

    drawOutline(x, y, maxHumid - minHumid, maxTemp - minTemp);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, maxHumid - minHumid, maxTemp - minTemp);
  });
  drawOutline(0, 0, canvas.width, canvas.height);
}

function resizeWindow() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  drawBiomes();
  // for (let i = 0; i < 4 * 16; i++) {
  //   for (let j = 0; j < 4 * 16; j++) {
  //     drawNoise(i, j);
  //   }
  // }

  // const noiseArr3 = drawNoise(2);
  // console.log(noiseArr);
  // console.log(noiseArr2);
  // console.log(noiseArr3);

  // console.log("Same?", compare([...noiseArr], noiseArr2));
  // console.log("Same?", compare([...noiseArr], noiseArr3));
}

resizeWindow();

window.onresize = resizeWindow;
