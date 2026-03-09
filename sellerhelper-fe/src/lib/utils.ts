/**
 * Merges class names. Supports string, undefined, null, false, and Record<string, boolean>.
 * No external dependencies.
 */
export function cn(
  ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  const parts: string[] = [];
  for (const x of inputs) {
    if (x == null || x === false) continue;
    if (typeof x === 'string') {
      if (x.trim()) parts.push(x.trim());
    } else if (typeof x === 'object' && !Array.isArray(x)) {
      for (const [k, v] of Object.entries(x)) {
        if (v && k) parts.push(k);
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
