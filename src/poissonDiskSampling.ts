import PoissonDiskSampling from "poisson-disk-sampling";

export const minDistance = 50;
export const maxDistance = 80;

export function getPoisson(width: number, height: number) {
  const poisson = new PoissonDiskSampling({
    shape: [width, height],
    minDistance,
    maxDistance,
    tries: 10,
  });
  poisson.fill();
  return poisson;
}

// console.log(poisson);
