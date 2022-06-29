import { clamp, map_range } from "./helpers";

interface MinMax {
  min: number;
  max: number;
}

interface Biome {
  temperature: MinMax;
  precipitation: MinMax;
  color: string;
  name: string;
  rgb: [number, number, number];
}

let counter = 0;
export function determineBiome(
  noise1: number,
  noise2: number
): Biome | undefined {
  const temperature = clamp(
    Math.floor(map_range(noise1, -1, 1, lowestTemperature, highestTemperature)),
    lowestTemperature + 1,
    highestTemperature
  );
  const precipitation = clamp(
    Math.floor(map_range(noise2, -1, 1, 0, 100)),
    1,
    100
  );
  const biome = biomes.find((biome) => {
    return (
      temperature > biome.temperature.min &&
      temperature <= biome.temperature.max &&
      precipitation > biome.precipitation.min &&
      precipitation <= biome.precipitation.max
    );
  });
  if (!biome) {
    if (counter % 1000 === 0) {
      console.log(noise1, noise2, temperature, precipitation);
    }
    counter++;
  }
  //   console.log(biome);
  return biome;
}

export const lowestTemperature = -20;
export const highestTemperature = 50;
export const lowestPrecipitation = 0;
export const highestPrecipitation = 100;

export const biomes: Biome[] = [
  {
    name: "iceDesert",
    temperature: {
      min: lowestTemperature,
      max: -10,
    },
    precipitation: {
      min: lowestPrecipitation,
      max: 35,
    },
    color: "lightblue",
    rgb: [173, 216, 230],
  },
  {
    name: "tundra",
    temperature: {
      min: lowestTemperature,
      max: -10,
    },
    precipitation: {
      min: 35,
      max: 75,
    },
    color: "aquamarine",
    rgb: [127, 255, 212],
  },
  {
    name: "snow",
    temperature: {
      min: -10,
      max: 0,
    },
    precipitation: {
      min: lowestPrecipitation,
      max: 75,
    },
    color: "Gainsboro",
    rgb: [220, 220, 220],
  },
  {
    name: "meadow",
    temperature: {
      min: lowestPrecipitation,
      max: 20,
    },
    precipitation: {
      min: lowestPrecipitation,
      max: 35,
    },
    color: "GreenYellow",
    rgb: [173, 255, 47],
  },
  {
    name: "forest",
    temperature: {
      min: lowestPrecipitation,
      max: 20,
    },
    precipitation: {
      min: 35,
      max: 75,
    },
    color: "ForestGreen",
    rgb: [34, 139, 34],
  },
  {
    name: "desert",
    temperature: {
      min: 20,
      max: highestTemperature,
    },
    precipitation: {
      min: lowestPrecipitation,
      max: 40,
    },
    color: "Moccasin",
    rgb: [255, 228, 181],
  },
  {
    name: "rainforest",
    temperature: {
      min: 20,
      max: highestTemperature,
    },
    precipitation: {
      min: 40,
      max: 75,
    },
    color: "DarkGreen",
    rgb: [1, 100, 1],
  },
  {
    name: "beach",
    temperature: {
      min: lowestTemperature,
      max: highestTemperature,
    },
    precipitation: {
      min: 75,
      max: 80,
    },
    color: "LemonChiffon",
    rgb: [255, 250, 205],
  },
  {
    name: "ocean",
    temperature: {
      min: lowestTemperature,
      max: highestTemperature,
    },
    precipitation: {
      min: 80,
      max: highestPrecipitation,
    },
    color: "SteelBlue",
    rgb: [70, 130, 180],
  },
];

console.log(
  biomes.map((biome) => {
    const d = document.createElement("div");
    d.style.color = biome.color;
    document.body.appendChild(d);
    const rgb = window.getComputedStyle(d).color;
    document.body.removeChild(d);
    return { ...biome, rgb };
  })
);
