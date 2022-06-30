import { Delaunay, Voronoi } from "d3-delaunay";
import { map_range } from "./helpers";
import {
  drawCircle,
  initPointsPoisson,
  Point2D,
  subdividePoints,
} from "./helpers";
import { precipitationColorMap, temperatureColorMap } from "./colorMap";
import { getBiomeRgb, getBiomeRgba } from "./colorPicker";

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
  providedCenters?: Point2D[]
) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
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

function computeCentroids(delaunay: Delaunay<Point2D>) {
  return [...delaunay.trianglePolygons()].map((triangle) => {
    const [[x1, y1], [x2, y2], [x3, y3]] = triangle;
    const centroid: Point2D = [(x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3];
    return centroid;
  });
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

export function drawVoronoi(
  canvas: HTMLCanvasElement,
  mode: VoronoiModes = VoronoiModes.Centroid
) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const [width, height] = [canvas.width * 2, canvas.height * 2];
  const points = initPointsPoisson(width, height).map(
    ([x, y]) => [x - canvas.width * 0.5, y - canvas.height * 0.5] as Point2D
  );
  const delaunay: Delaunay<Point2D> = Delaunay.from(points);

  switch (mode) {
    case VoronoiModes.Biomes:
      drawCellColors(ctx, delaunay, colorBasedOnBiome(points));
      break;
    case VoronoiModes.Centroid:
      const centroids = computeCentroids(delaunay);
      drawCellBoundaries(ctx, delaunay, centroids);
      centroids.forEach(([x, y]) => {
        drawCircle(ctx, x, y, { color: "blue", radius: 4 });
      });
      drawDelaunayPoints(ctx, delaunay);

      break;
    case VoronoiModes.Delaunay:
      drawSimple(delaunay, ctx);
      drawDelaunayPoints(ctx, delaunay);

      break;
  }

  // const voronoi = delaunay.voronoi([0, 0, width, height]);
  // drawSimple(voronoi, ctx, "white");

  // const polys = [...voronoi.cellPolygons()];
  // polys.forEach((poly) => {
  //   poly.forEach(([x, y]) => {
  //     drawCircle(ctx, x, y, { color: "blue", radius: 4 });
  //   });
  // });

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
