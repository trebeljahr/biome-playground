import { determineBiome } from "./biomePlayground";
import {
  precipitationColorMap,
  RGBAColorMap,
  temperatureColorMap,
} from "./colorMap";
import { clamp, map_range } from "./helpers";
import { NoisePicker, precipitationMap, temperatureMap } from "./noise";

export type ColorPicker = (x: number, y: number) => [number, number, number];

export function getNoiseRgbPicker(noise: NoisePicker, colorMap?: RGBAColorMap) {
  if (colorMap) {
    console.log(colorMap);
  }
  const picker: ColorPicker = (x, y) => {
    const noiseVal = map_range(
      clamp(noise.getValue(x, y), -1, 1),
      -1,
      1,
      0,
      colorMap.length || 255
    );
    if (colorMap) {
      try {
        const [r, g, b] = colorMap[Math.floor(noiseVal)];
        return [r, g, b];
      } catch (err) {
        console.log(Math.floor(noiseVal));
        throw err;
      }
    }
    return [noiseVal, noiseVal, noiseVal];
  };
  return picker;
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
