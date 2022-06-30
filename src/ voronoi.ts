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

export function drawVoronoi(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "lightgrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const points = initPointsPoisson(canvas.width, canvas.height);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, canvas.width, canvas.height]);
  const polys = [...voronoi.cellPolygons()];
  drawSimple(voronoi, ctx, "white");

  polys.forEach((poly) => {
    poly.forEach(([x, y]) => {
      drawCircle(ctx, x, y, { color: "blue", radius: 4 });
    });
  });
  // drawSimple(delaunay, ctx);
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
