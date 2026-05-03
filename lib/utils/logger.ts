export function logSourceError(sourceName: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[${sourceName}] ${message}`);
}
