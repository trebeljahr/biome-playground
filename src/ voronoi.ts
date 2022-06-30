import { Delaunay, Voronoi } from "d3-delaunay";
import { findCircumCenter, map_range, Triangle } from "./helpers";
import {
  drawCircle,
  initPointsPoisson,
  Point2D,
  subdividePoints,
} from "./helpers";
import { precipitationColorMap, temperatureColorMap } from "./colorMap";
import { getBiomeRgb, getBiomeRgba } from "./colorPicker";
import { maxDistance, minDistance } from "./poissonDiskSampling";

interface Renderer {
  render(ctx: CanvasRenderingContext2D): void;
}

function drawSimple(
  thingToRender: Renderer,
  ctx: CanvasRenderingContext2D,
  color = "black"
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  thingToRender.render(ctx);
  ctx.stroke();
  ctx.closePath();
}

function triangleOfEdge(e) {
  return Math.floor(e / 3);
}

function drawCellBoundaries(
  ctx: CanvasRenderingContext2D,
  delaunay: Delaunay<Point2D>,
  providedCenters?: Point2D[],
  color = "white"
) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  const centers = providedCenters || computeCentroids(delaunay);
  for (let e = 0; e < delaunay.halfedges.length; e++) {
    if (e < delaunay.halfedges[e]) {
      const [x1, y1] = centers[triangleOfEdge(e)];
      const [x2, y2] = centers[triangleOfEdge(delaunay.halfedges[e])];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

function computeCentroid(triangle: Triangle) {
  const [[x1, y1], [x2, y2], [x3, y3]] = triangle;
  const centroid: Point2D = [(x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3];
  return centroid;
}

function computeCentroids(delaunay: Delaunay<Point2D>) {
  return [...delaunay.trianglePolygons()].map(computeCentroid);
}

function nextHalfedge(e: number) {
  return e % 3 === 2 ? e - 2 : e + 1;
}

function edgesAroundPoint(delaunay: Delaunay<Point2D>, start: number) {
  const result = [];
  let incoming = start;
  do {
    result.push(incoming);
    const outgoing = nextHalfedge(incoming);
    incoming = delaunay.halfedges[outgoing];
  } while (incoming !== -1 && incoming !== start);
  return result;
}

function drawCellColors(
  ctx: CanvasRenderingContext2D,
  delaunay: Delaunay<Point2D>,
  colorFn: (index: number) => string
) {
  let seen = new Set(); // of region ids
  for (let e = 0; e < delaunay.halfedges.length; e++) {
    const r = delaunay.triangles[nextHalfedge(e)];
    if (!seen.has(r)) {
      seen.add(r);
      let vertices = edgesAroundPoint(delaunay, e).map(
        (e) => computeCentroids(delaunay)[triangleOfEdge(e)]
      );
      ctx.strokeStyle = ctx.fillStyle = colorFn(r);
      ctx.beginPath();
      ctx.lineWidth = 1;
      const [xStart, yStart] = vertices[0];
      ctx.moveTo(xStart, yStart);
      for (let i = 1; i < vertices.length; i++) {
        const [x, y] = vertices[i];
        ctx.lineTo(x, y);
      }
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
  }
}

function colorBasedOnMap(
  delaunay: Delaunay<Point2D>,
  colorMap = temperatureColorMap
) {
  return function temperatureColor(i: number) {
    const colorMapIndex = Math.floor(
      map_range(i, 0, delaunay.triangles.length, 0, temperatureColorMap.length)
    );
    return convertRGBAToStringRGBA(colorMap[colorMapIndex]);
  };
}

function convertRGBAToStringRGBA([r, g, b, a]: [
  number,
  number,
  number,
  number
]) {
  return `rgba(${r},${g},${b},${a})`;
}

function colorBasedOnBiome(points: Point2D[]) {
  return function biomeColor(r: number) {
    const [x, y] = points[r];
    return convertRGBAToStringRGBA(getBiomeRgba(x, y));
  };
}

const delaunayTiles: Record<string, Delaunay<Point2D>> = {};

export enum VoronoiModes {
  Biomes,
  Centroid,
  Delaunay,
}

function drawDelaunayPoints(
  ctx: CanvasRenderingContext2D,
  delaunay: Delaunay<Point2D>
) {
  ctx.beginPath();
  ctx.fillStyle = "red";
  delaunay.renderPoints(ctx, 4);
  ctx.fill();
  ctx.closePath();
}

const subdivisions = 5;
let lowerEdge: number = -1;
let upperEdge: number = subdivisions;

document.addEventListener("keypress", (event) => {
  event.code === "KeyV" && lowerEdge--;
  event.code === "KeyB" && lowerEdge++;

  event.code === "KeyN" && upperEdge--;
  event.code === "KeyM" && upperEdge++;

  console.log(lowerEdge, upperEdge);
  if (["KeyV", "KeyB", "KeyN", "KeyM"].includes(event.code)) {
    drawVoronoi(document.getElementById("canvas") as HTMLCanvasElement);
  }
});

let allPoints: Record<string, Point2D[]> = {};

let colorIndex = 0;
let needsRendering: string[] = [];
export function drawVoronoi(
  canvas: HTMLCanvasElement,
  mode: VoronoiModes = VoronoiModes.Centroid
) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const [width, height] = [
    canvas.width / subdivisions,
    canvas.height / subdivisions,
  ];

  for (let i = lowerEdge; i <= upperEdge; i++) {
    for (let j = lowerEdge; j <= upperEdge; j++) {
      const key = `${i},${j}`;
      if (!allPoints[key]) {
        needsRendering.push(key);
        allPoints[key] = initPointsPoisson(width, height).map(
          ([x, y]) => [x + i * width, y + j * height] as Point2D
        );
      }
    }
  }

  needsRendering.forEach((key) => {
    const [xOff, yOff] = key.split(",").map((strNum) => parseInt(strNum));
    if (
      xOff > lowerEdge &&
      yOff > lowerEdge &&
      xOff < upperEdge &&
      yOff < upperEdge
    ) {
      const points: Point2D[] = [];

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const keyWithOffset = `${i + xOff},${j + yOff}`;
          points.push(...allPoints[keyWithOffset]);
        }
      }
      const delaunay: Delaunay<Point2D> = Delaunay.from(points);
      const voronoi = delaunay.voronoi([
        width * xOff,
        height * yOff,
        width * (xOff + 1),
        height * (yOff + 1),
      ]);
      // drawSimple(voronoi, ctx);
      const polys = [...voronoi.cellPolygons()];
      // const centroids = computeCentroids(delaunay);
      // const currentColor = convertRGBAToStringRGBA(
      //   temperatureColorMap[colorIndex]
      // );
      // colorIndex = (colorIndex + 15) % temperatureColorMap.length;
      // centroids.forEach(([x, y]) => {
      //   drawCircle(ctx, x, y, { color: currentColor, radius: 4 });
      // });
      polys.forEach((poly, i) => {
        console.log(poly);
        console.log(poly.index);
        const triangle = delaunay.trianglePolygon(poly.index) as Triangle;
        console.log(triangle);
        const [x, y] = findCircumCenter(triangle);
        ctx.fillStyle = ctx.strokeStyle = convertRGBAToStringRGBA(
          getBiomeRgba(x, y)
        );
        ctx.beginPath();

        const [startX, startY] = poly[0];
        ctx.moveTo(startX, startY);

        for (let [x, y] of poly) {
          ctx.lineWidth = 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        // poly.forEach(([x, y]) => {
        //   drawCircle(ctx, x, y, { color: "blue", radius: 4 });
        // });
      });

      // delaunay.points.forEach() {

      // }
      // const centroids = computeCentroids(delaunay);
      // drawCellBoundaries(ctx, delaunay, centroids, "green");
    }
  });
  needsRendering = [];

  // const points = initPointsPoisson(width, height).map(
  //   ([x, y]) => [x + width, y + height] as Point2D
  // );

  // const minDistanceX = width / 10;
  // const minDistanceY = height / 10;

  // const pointsOnTheEdge = points.filter(([x, y]) => {
  //   if (x - minDistanceX < width) {
  //     drawCircle(ctx, x, y, { color: "green", radius: 8 });
  //     return true;
  //   }
  //   if (y - minDistanceY < height) {
  //     drawCircle(ctx, x, y, { color: "limegreen", radius: 9 });
  //     return true;
  //   }
  //   if (x + minDistanceY > width + width) {
  //     drawCircle(ctx, x, y, { color: "yellow", radius: 10 });
  //     return true;
  //   }
  //   if (y + minDistanceY > height + height) {
  //     drawCircle(ctx, x, y, { color: "orange", radius: 11 });

  //     return true;
  //   }
  //   return false;
  // });

  // const points2 = initPointsPoisson(width, height)
  //   .map(([x, y]) => [x + width, y] as Point2D)
  //   .concat(points); //.filter(([, y]) => y - minDistanceY < height));
  // const delaunay2: Delaunay<Point2D> = Delaunay.from(points2);
  // const centroids = computeCentroids(delaunay2);
  // drawCellBoundaries(ctx, delaunay2, centroids, "green");
  // centroids.forEach(([x, y]) => {
  //   drawCircle(ctx, x, y, { color: "blue", radius: 4 });
  // });
  // drawDelaunayPoints(ctx, delaunay2);

  // const delaunay: Delaunay<Point2D> = Delaunay.from(points);

  // switch (mode) {
  //   case VoronoiModes.Biomes:
  //     drawCellColors(ctx, delaunay, colorBasedOnBiome(points));
  //     break;
  //   case VoronoiModes.Centroid:
  //     const centroids = computeCentroids(delaunay);
  //     drawCellBoundaries(ctx, delaunay, centroids);
  //     centroids.forEach(([x, y]) => {
  //       drawCircle(ctx, x, y, { color: "blue", radius: 4 });
  //     });
  //     drawDelaunayPoints(ctx, delaunay);

  //     break;
  //   case VoronoiModes.Delaunay:
  //     drawSimple(delaunay, ctx);
  //     drawDelaunayPoints(ctx, delaunay);

  //     break;
  // }

  // const voronoi = delaunay.voronoi([0, 0, width, height]);
  // drawSimple(voronoi, ctx, "white");

  // const subdividedPolys = polys.slice(0, 5).map((poly) => {
  //   return subdividePoints(poly);
  // });
  // console.log({ polys });
  // console.log({ subdividedPolys });
  // // console.log(polys);
  // ctx.strokeStyle = "black";
  // drawMultiPoly(ctx, subdividedPolys);
  // ctx.strokeStyle = "red";
  // drawMultiPoly(ctx, polys.slice(0, 5));
}

function drawMultiPoly(ctx: CanvasRenderingContext2D, polys: Point2D[][]) {
  polys.forEach((poly, i) => {
    // ctx.fillStyle = randomColor();
    ctx.beginPath();

    for (let [x, y] of poly) {
      // ctx.fillRect(x, y, 5, 5);
      ctx.lineWidth = 1;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  });
}

function drawDeduplicated() {
  // const polyPoints = polys.flat(1);
  // const pointSet = new Set();
  // const dedupPolyPoints = polyPoints.filter((point) => {
  //   const stringPoint = JSON.stringify(point);
  //   if (pointSet.has(stringPoint)) {
  //     return false;
  //   } else {
  //     pointSet.add(stringPoint);
  //     return true;
  //   }
  // });
  // console.log({ setLength: dedupPolyPoints.length });
  // console.log({ arrayLength: polys.flat().length });
  // ctx.beginPath();
  // ctx.fillStyle = "white";
  // ctx.strokeStyle = "black";
  // ctx.moveTo(...dedupPolyPoints[0]);
  // subdividePoints(dedupPolyPoints).forEach((point) => {
  //   ctx.lineTo(...point);
  // });
  // ctx.stroke();
  // ctx.closePath();
}
