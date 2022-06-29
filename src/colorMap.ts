import colormap from "colormap";

export type RGBAColorMap = [number, number, number, number][];

export const precipitationColorMap = colormap({
  colormap: "yignbu",
  nshades: 256,
  format: "rgba",
  alpha: 1,
});

export const temperatureColorMap = colormap({
  colormap: "rainbow",
  nshades: 256,
  format: "rgba",
  alpha: 1,
});
