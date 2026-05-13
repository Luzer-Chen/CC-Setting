export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
