export function isIntegerString(value: string): boolean {
  const parsed = Number.parseInt(value, 10);
  return !isNaN(parsed) && parsed.toString() === value;
}
