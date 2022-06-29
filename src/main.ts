import "./main.css";
import {
  biomes,
  determineBiome,
  highestTemperature,
  lowestTemperature,
} from "./biomePlayground";
import { clamp, map_range } from "./helpers";
import { humidPlane, tempPlane } from "./noise";
import { drawVoronoi } from "./ voronoi";
import {
  precipitationColorMap,
  RGBAColorMap,
  temperatureColorMap,
} from "./colorMap";

let gridCellWidth: number;
let gridCellHeight: number;
let arr: Uint8ClampedArray;

function getMousePosition(event: MouseEvent) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  console.log("Coordinate x: " + x, "Coordinate y: " + y);
  return { x, y };
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.addEventListener("mousedown", function (e) {
  let { x, y } = getMousePosition(e);

  const noise1 = tempPlane.getValue(x, y);
  const noise2 = humidPlane.getValue(x, y);

  const biome = determineBiome(noise1, noise2);
  console.log(biome.name);
});

const ctx = canvas.getContext("2d");

console.log(canvas.width);
console.log(canvas.height);
console.log(window.innerWidth);
console.log(window.innerHeight);

function getBiomeRgb(x: number, y: number) {
  const noise1 = tempPlane.getValue(x, y);
  const noise2 = humidPlane.getValue(x, y);

  const biome = determineBiome(noise1, noise2);
  return biome.rgb;
}

function getNoiseRgbPicker(noise: typeof tempPlane, colorMap?: RGBAColorMap) {
  if (colorMap) {
    console.log(colorMap);
  }
  const picker: ColorPicker = (x, y) => {
    const noiseVal = map_range(
      clamp(noise.getValue(x, y), -1, 1),
      -1,
      1,
      0,
      255
    );
    if (colorMap) {
      try {
        const [r, g, b] = colorMap[Math.floor(noiseVal)];
        return [r, g, b];
      } catch (err) {
        console.log(Math.floor(noiseVal));
        throw err;
      }
    }
    return [noiseVal, noiseVal, noiseVal];
  };
  return picker;
}

type ColorPicker = (x: number, y: number) => [number, number, number];

function drawNoise(pickRgb: ColorPicker, offsetX = 0, offsetY = 0) {
  let noiseArr: number[] = [];
  let iterations = 0;
  for (let i = 0; i < arr.length; i += 4) {
    iterations++;

    const x = ((iterations - 1) % gridCellWidth) + offsetX * gridCellWidth;
    const y = Math.floor(iterations / gridCellWidth) + offsetY * gridCellHeight;
    const [r, g, b] = pickRgb(x, y);

    arr[i + 0] = r; // R value
    arr[i + 1] = g; // G value
    arr[i + 2] = b; // B value
    arr[i + 3] = 255; // A value
  }

  const imageData = new ImageData(arr, gridCellWidth, gridCellHeight);
  ctx.putImageData(
    imageData,
    offsetX * gridCellWidth,
    offsetY * gridCellHeight
  );
  return noiseArr;
}

function drawOutline(
  x: number,
  y: number,
  width: number,
  height: number,
  color?: string
) {
  ctx.strokeStyle = color || "black";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, width, height);
}

function drawBiomeChart() {
  Object.values(biomes).map(({ temperature, humidity, color }) => {
    const maxTemp = map_range(
      temperature.max,
      lowestTemperature,
      highestTemperature,
      0,
      canvas.width
    );
    const minTemp = map_range(
      temperature.min,
      lowestTemperature,
      highestTemperature,
      0,
      canvas.width
    );
    const maxHumid = map_range(humidity.max, 0, 100, 0, canvas.width);
    const minHumid = map_range(humidity.min, 0, 100, 0, canvas.width);

    const y = map_range(
      temperature.min,
      lowestTemperature,
      highestTemperature,
      0,
      canvas.width
    );
    const x = map_range(humidity.min, 0, 100, 0, canvas.width);

    drawOutline(x, y, maxHumid - minHumid, maxTemp - minTemp);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, maxHumid - minHumid, maxTemp - minTemp);
  });
  drawOutline(0, 0, canvas.width, canvas.height);
}

const gridCells = 10;

function colorNoiseDistribution(colorPicker: ColorPicker) {
  for (let i = 0; i < gridCells; i++) {
    for (let j = 0; j < gridCells; j++) {
      drawNoise(colorPicker, i, j);
    }
  }
}

function resizeWindow() {
  // if (!lastResizeDone) return;
  // lastResizeDone = false;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  gridCellWidth = Math.ceil(canvas.width / gridCells);
  gridCellHeight = Math.ceil(canvas.height / gridCells);
  arr = new Uint8ClampedArray(gridCellWidth * gridCellHeight * 4);
  // ctx.fillStyle = "white";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // drawVoronoi(canvas);
  // drawBiomeChart();
  // colorNoiseDistribution(getBiomeRgb);
  // colorNoiseDistribution(getNoiseRgbPicker(tempPlane, temperatureColorMap));
  colorNoiseDistribution(getNoiseRgbPicker(humidPlane, precipitationColorMap));

  // console.log({ width: gridCellSize });

  // lastResizeDone = true;
}

resizeWindow();

window.onresize = resizeWindow;
