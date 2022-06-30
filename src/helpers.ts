import { displacementMap1, displacementMap2 } from "./noise";
import { getPoisson } from "./poissonDiskSampling";

export type Point2D = [number, number];

export function map_range(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

const scale = 10;
export function subdivideEdge([x1, y1]: Point2D, [x2, y2]: Point2D) {
  // subdivisions: number = 10
  const subdivisionCount =
    distanceSquared([x1, y1], [x2, y2]) / (scale * scale);
  // console.log(subdivisionCount);
  const newPoints: Point2D[] = [];
  for (let i = 0; i < subdivisionCount; i++) {
    const x = map_range(i, 0, subdivisionCount, x1, x2);
    const y = map_range(i, 0, subdivisionCount, y1, y2);
    const offX = i === 0 ? 0 : displacementMap1.getValue(x * 300, y * 300) * 5;
    const offY = i === 0 ? 0 : displacementMap2.getValue(x * 300, y * 300) * 5;

    newPoints.push([x + offX, y + offY]);
  }

  // console.log(newPoints);
  return newPoints;
}

export function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.arc(x, y, 1, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
}

export function subdividePoints(pointList: Point2D[]) {
  return pointList.reduce((agg, point1, index) => {
    if (index === pointList.length - 1) return [...agg, point1];

    const point2 = pointList[index + 1];
    const newPoints = subdivideEdge(point1, point2);
    return [...agg, ...newPoints];
  }, [] as Point2D[]);
}

export function initPointsPoisson(width: number, height: number) {
  const poisson = getPoisson(width, height);
  return poisson.getAllPoints() as Point2D[];
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function compare(a: number[], b: number[]) {
  return a.every((e, i) => b[i] === e) && b.every((e, i) => a[i] === e);
}

export function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function testingSets() {
  const pointsA: Point2D[] = [
    [100, 200],
    [300, 400],
    [500, 600],
  ];
  const pointsB: Point2D[] = [...pointsA].reverse();
  console.log({ a: subdividePoints(pointsA) });
  console.log({ b: subdividePoints(pointsB) });

  const pointsASet = new Set(
    subdividePoints(pointsA).map((point) => JSON.stringify(point))
  );
  const pointsBSet = new Set(
    subdividePoints(pointsB).map((point) => JSON.stringify(point))
  );

  console.log({ pointsASet });
  console.log({ pointsBSet });

  const areEqual =
    [...pointsASet].every((point) => pointsBSet.has(point)) &&
    pointsASet.size === pointsBSet.size;
  console.log("Are Equal?", areEqual);
}

export function initPointsRandomly(width: number, height: number) {
  const points: Point2D[] = [];
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    points.push([x, y]);
  }
  return points;
}

export function distanceSquared([x1, y1]: Point2D, [x2, y2]: Point2D) {
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}
