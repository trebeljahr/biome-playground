import { Delaunay, Voronoi } from "d3-delaunay";
import {
  drawCircle,
  initPointsPoisson,
  Point2D,
  subdividePoints,
} from "./helpers";

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
  ctx.lineWidth = 2;
  ctx.strokeStyle = "yellow";
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

export function drawVoronoi(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const [width, height] = [canvas.width * 2, canvas.height * 2];
  const points = initPointsPoisson(width, height).map(
    ([x, y]) => [x - canvas.width * 0.5, y - canvas.height * 0.5] as Point2D
  );
  const delaunay: Delaunay<Point2D> = Delaunay.from(points);
  const centroids = computeCentroids(delaunay);
  centroids.forEach(([x, y]) => {
    drawCircle(ctx, x, y, { color: "green", radius: 4 });
  });
  drawCellBoundaries(ctx, delaunay, centroids);

  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const polys = [...voronoi.cellPolygons()];
  drawSimple(voronoi, ctx, "white");

  polys.forEach((poly) => {
    poly.forEach(([x, y]) => {
      drawCircle(ctx, x, y, { color: "blue", radius: 4 });
    });
  });
  drawSimple(delaunay, ctx);
  ctx.beginPath();
  ctx.fillStyle = "red";
  delaunay.renderPoints(ctx, 4);
  ctx.fill();
  ctx.closePath();

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
