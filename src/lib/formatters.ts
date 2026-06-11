export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function formatKwh(value: number) {
  return `${value.toFixed(1)} kWh`;
}

export function formatKg(value: number) {
  return `${value.toFixed(2)} kg`;
}

export function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
