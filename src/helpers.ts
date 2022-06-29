export function map_range(
  value: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function compare(a: number[], b: number[]) {
  return a.every((e, i) => b[i] === e) && b.every((e, i) => a[i] === e);
}

export function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
