import "./main.css";
import { biomes, determineBiome } from "./biomePlayground";
import { map_range } from "./helpers";
import { humidPlane, tempPlane } from "./noise";

let gridCellSize: number;
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

function drawNoise(offsetX = 0, offsetY = 0) {
  let noiseArr: number[] = [];
  let iterations = 0;
  console.log(offsetX, offsetY);
  for (let i = 0; i < arr.length; i += 4) {
    iterations++;
    const x = ((iterations - 1) % gridCellSize) + offsetX * gridCellSize;
    const y = Math.floor(iterations / gridCellSize) + offsetY * gridCellSize;
    const noise1 = tempPlane.getValue(x, y);
    const noise2 = humidPlane.getValue(x, y);

    const biome = determineBiome(noise1, noise2);
    noiseArr.push(noise1);
    const rgb = Math.floor(map_range(noise1, -1, 1, 0, 255));

    arr[i + 0] = biome?.rgb[0] || rgb; // R value
    arr[i + 1] = biome?.rgb[1] || rgb; // G value
    arr[i + 2] = biome?.rgb[2] || rgb; // B value
    arr[i + 3] = 255; // A value
  }

  const imageData = new ImageData(arr, gridCellSize);
  ctx.putImageData(imageData, offsetX * gridCellSize, offsetY * gridCellSize);
  return noiseArr;
}

function drawOutline(x: number, y: number, width: number, height: number) {
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

const gridCells = 4;
let lastResizeDone = true;
function resizeWindow() {
  // if (!lastResizeDone) return;
  // lastResizeDone = false;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  gridCellSize = Math.floor(Math.min(canvas.width, canvas.height) / gridCells);
  arr = new Uint8ClampedArray(gridCellSize * gridCellSize * 4);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // drawBiomes();
  // console.log({ width: gridCellSize });
  for (let i = 0; i < gridCells; i++) {
    for (let j = 0; j < gridCells; j++) {
      drawNoise(i, j);
    }
  }
  // lastResizeDone = true;
}

resizeWindow();

window.onresize = resizeWindow;
