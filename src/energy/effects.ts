export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function beatProgress(time: number, start: number, duration: number) {
  return clamp01((time - start) / duration);
}

export function pulse(time: number, speed = 3) {
  return 0.5 + Math.sin(time * speed) * 0.5;
}
