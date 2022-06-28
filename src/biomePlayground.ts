interface MinMax {
  min: number;
  max: number;
}

interface Biome {
  temperature: MinMax;
  humidity: MinMax;
  color: string;
  name: string;
}

export const biomes: Biome[] = [
  {
    name: "iceDesert",
    temperature: { min: -15, max: 0 },
    humidity: { min: 0, max: 20 },
    color: "lightblue",
  },
  {
    name: "tundra",
    temperature: { min: -15, max: 0 },
    humidity: { min: 20, max: 40 },
    color: "aquamarine",
  },
  {
    name: "snow",
    temperature: { min: -15, max: 0 },
    humidity: { min: 40, max: 75 },
    color: "Gainsboro",
  },
  {
    name: "meadow",
    temperature: { min: 0, max: 20 },
    humidity: { min: 0, max: 35 },
    color: "GreenYellow",
  },
  {
    name: "forest",
    temperature: { min: 0, max: 20 },
    humidity: { min: 35, max: 75 },
    color: "ForestGreen",
  },
  {
    name: "desert",
    temperature: { min: 20, max: 50 },
    humidity: { min: 0, max: 40 },
    color: "Moccasin",
  },
  {
    name: "rainforest",
    temperature: { min: 20, max: 50 },
    humidity: { min: 40, max: 75 },
    color: "DarkGreen",
  },
  {
    name: "beach",
    temperature: { min: -15, max: 60 },
    humidity: { min: 75, max: 80 },
    color: "LemonChiffon",
  },
  {
    name: "ocean",
    temperature: { min: -15, max: 60 },
    humidity: { min: 80, max: 100 },
    color: "SteelBlue",
  },
];
