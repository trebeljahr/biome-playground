import PoissonDiskSampling from "poisson-disk-sampling";

export function getPoisson(width: number, height: number) {
  const poisson = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: 80,
    maxDistance: 100,
    tries: 10,
  });
  poisson.fill();
  return poisson;
}

// console.log(poisson);
