import { determineBiome } from "./biomePlayground";
import {
  precipitationColorMap,
  RGBAColorMap,
  temperatureColorMap,
} from "./colorMap";
import { clamp, map_range } from "./helpers";
import { NoiseSampler, precipitationMap, temperatureMap } from "./noise";

export type ColorSampler = (x: number, y: number) => [number, number, number];

export function getNoiseRgbPicker(
  noise: NoiseSampler,
  colorMap?: RGBAColorMap
) {
  const colorSampler: ColorSampler = (x, y) => {
    const noiseVal = clamp(noise.getValue(x, y), -1, 1);
    const colorVal = map_range(noiseVal, -1, 1, 0, colorMap.length || 255);
    if (colorMap) {
      const [r, g, b] = colorMap[Math.floor(colorVal)];
      return [r, g, b];
    }
    return [colorVal, colorVal, colorVal];
  };
  return colorSampler;
}

export const getTemperatureRgb = getNoiseRgbPicker(
  temperatureMap,
  temperatureColorMap
);

export const getPrecipitationRgb = getNoiseRgbPicker(
  precipitationMap,
  precipitationColorMap
);

export function getBiomeRgba(x: number, y: number) {
  const noise1 = temperatureMap.getValue(x, y);
  const noise2 = precipitationMap.getValue(x, y);

  return determineBiome(noise1, noise2).rgb;
}
export function getBiomeRgb(x: number, y: number) {
  const [r, g, b] = getBiomeRgba(x, y);
  return [r, g, b] as [number, number, number];
}
