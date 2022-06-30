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

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  { radius = 1, color = "black" }
) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
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

function lineFromPoints(P: Point2D, Q: Point2D) {
  let a = Q[1] - P[1];
  let b = P[0] - Q[0];
  let c = a * P[0] + b * P[1];
  return [a, b, c];
}

// Function which converts the input line to its
// perpendicular bisector. It also inputs the points
// whose mid-point lies on the bisector
function perpendicularBisectorFromLine(P, Q, a, b, c) {
  let mid_point = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];

  // c = -bx + ay
  c = -b * mid_point[0] + a * mid_point[1];

  let temp = a;
  a = -b;
  b = temp;
  return [a, b, c];
}

// Returns the intersection point of two lines
function lineLineIntersection(a1, b1, c1, a2, b2, c2) {
  let determinant = a1 * b2 - a2 * b1;
  if (determinant == 0) {
    // The lines are parallel. This is simplified
    // by returning a pair of FLT_MAX
    return [10.0 ** 19, 10.0 ** 19] as Point2D;
  } else {
    let x = (b2 * c1 - b1 * c2) / determinant;
    let y = (a1 * c2 - a2 * c1) / determinant;
    return [x, y] as Point2D;
  }
}

export type Triangle = [Point2D, Point2D, Point2D];

export function findCircumCenter([P, Q, R]: Triangle) {
  // Line PQ is represented as ax + by = c
  let PQ_line = lineFromPoints(P, Q);
  let a = PQ_line[0];
  let b = PQ_line[1];
  let c = PQ_line[2];

  // Line QR is represented as ex + fy = g
  let QR_line = lineFromPoints(Q, R);
  let e = QR_line[0];
  let f = QR_line[1];
  let g = QR_line[2];

  // Converting lines PQ and QR to perpendicular
  // vbisectors. After this, L = ax + by = c
  // M = ex + fy = g
  let PQ_perpendicular = perpendicularBisectorFromLine(P, Q, a, b, c);
  a = PQ_perpendicular[0];
  b = PQ_perpendicular[1];
  c = PQ_perpendicular[2];

  let QR_perpendicular = perpendicularBisectorFromLine(Q, R, e, f, g);
  e = QR_perpendicular[0];
  f = QR_perpendicular[1];
  g = QR_perpendicular[2];

  // The point of intersection of L and M gives
  // the circumcenter
  let circumcenter: Point2D = lineLineIntersection(a, b, c, e, f, g);

  return circumcenter;
}
