import { Delaunay } from "d3-delaunay";
import { getPoisson } from "./poissonDiskSampling";

function initPointsRandomly(width: number, height: number) {
  const points: [number, number][] = [];
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    points.push([x, y]);
  }
  return points;
}

function initPointsPoisson(width: number, height: number) {
  const poisson = getPoisson(width, height);
  return poisson.getAllPoints() as [number, number][];
}

export function drawVoronoi(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  const points = initPointsPoisson(canvas.width, canvas.height);
  ctx.fillStyle = "black";

  points.forEach((point) => {
    ctx.fillRect(point[0], point[1], 3, 3);
  });
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, canvas.width, canvas.height]);
  // ctx.strokeStyle = "black";
  // voronoi.render(ctx);
  const polys = [...voronoi.cellPolygons()];
  console.log(polys);

  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  polys.forEach((poly, i) => {
    // ctx.fillStyle = randomColor();
    ctx.beginPath();

    for (let [x, y] of poly) {
      // ctx.fillRect(x, y, 5, 5);

      ctx.lineWidth = 5;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}
