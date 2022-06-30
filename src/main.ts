import "./main.css";
import {
  biomes,
  determineBiome,
  highestPrecipitation,
  highestTemperature,
  lowestPrecipitation,
  lowestTemperature,
} from "./biomePlayground";
import { clamp, map_range } from "./helpers";
import {
  NoisePicker,
  precipitationNoise,
  precipitationMap,
  temperatureNoise,
  temperatureMap,
} from "./noise";
import { drawVoronoi } from "./ voronoi";
import {
  precipitationColorMap,
  RGBAColorMap,
  temperatureColorMap,
} from "./colorMap";
import * as dat from "dat.gui";
import {
  ColorPicker,
  getBiomeRgb,
  getNoiseRgbPicker,
  getPrecipitationRgb,
  getTemperatureRgb,
} from "./colorPicker";

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

  const noise1 = temperatureNoise.getValue(x, y);
  const noise2 = precipitationNoise.getValue(x, y);

  const biome = determineBiome(noise1, noise2);
  console.log(biome.name);
});

const ctx = canvas.getContext("2d");

console.log(canvas.width);
console.log(canvas.height);
console.log(window.innerWidth);
console.log(window.innerHeight);

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

const gui = new dat.GUI({ name: "Biome Playground" });

const parameters: Record<string, { on: boolean; draw: () => void }> = {
  PrecipitationMap: { on: false, draw: drawPrecipitationMap },
  TemperatureMap: { on: false, draw: drawTemperatureMap },
  Voronoi: { on: true, draw: drawVoronoiMap },
  Biomes: { on: false, draw: drawBiomeMap },
  BiomeChart: { on: false, draw: drawBiomeDistributionChart },
};

const stateFolder = gui.addFolder("States");

Object.keys(parameters).forEach((paramName) => {
  stateFolder
    .add(parameters[paramName], "on")
    .name(paramName)
    .listen()
    .onChange(() => {
      setChecked(paramName);
      clearCanvas();
    })
    .updateDisplay()
    .onFinishChange(drawThings);
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setChecked(key: string) {
  for (let param in parameters) {
    parameters[param].on = false;
  }
  parameters[key].on = true;
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

function drawVoronoiMap() {
  drawVoronoi(canvas);
}

function drawTemperatureMap() {
  colorNoiseDistribution(getTemperatureRgb);
}

function drawPrecipitationMap() {
  colorNoiseDistribution(getPrecipitationRgb);
}

function drawBiomeMap() {
  colorNoiseDistribution(getBiomeRgb);
}

function drawBiomeDistributionChart() {
  Object.values(biomes).map(({ temperature, precipitation, color }) => {
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
    const maxHumid = map_range(
      precipitation.max,
      lowestPrecipitation,
      highestPrecipitation,
      0,
      canvas.width
    );
    const minHumid = map_range(
      precipitation.min,
      lowestPrecipitation,
      highestPrecipitation,
      0,
      canvas.width
    );

    const y = map_range(
      temperature.min,
      lowestTemperature,
      highestTemperature,
      0,
      canvas.width
    );
    const x = map_range(
      precipitation.min,
      lowestPrecipitation,
      highestPrecipitation,
      0,
      canvas.width
    );

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

function drawThings() {
  Object.values(parameters).forEach(({ on, draw }) => {
    if (on) {
      draw();
    }
  });
}

function resizeWindow() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  gridCellWidth = Math.ceil(canvas.width / gridCells);
  gridCellHeight = Math.ceil(canvas.height / gridCells);
  arr = new Uint8ClampedArray(gridCellWidth * gridCellHeight * 4);
  drawThings();
}

resizeWindow();

window.onresize = resizeWindow;
