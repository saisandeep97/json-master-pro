import JSON5 from 'json5';

/**
 * Validates a JSON string.
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateJson(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}

/**
 * Formats a JSON string with 2-space indentation.
 * Assumes input is valid JSON (or will throw).
 */
export function formatJson(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, 2);
}

/**
 * Minifies a JSON string.
 */
export function minifyJson(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
}

/**
 * Attempts to fix common JSON errors:
 * 1. Trailing commas
 * 2. Single quotes -> Double quotes (for keys and string values)
 * 3. Unquoted keys -> Quoted keys
 */
/**
 * Attempts to fix common JSON errors by using JSON5 parsing.
 * JSON5 supports trailing commas, unquoted keys, and single quotes.
 */
export function fixJson(jsonString: string): string {
  try {
    // Use JSON5 to parse the "relaxed" JSON
    const parsed = JSON5.parse(jsonString);
    // Convert back to strict standard JSON
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // If even JSON5 can't parse it, we can't fix it easily.
    // Return original so user can debug.
    return jsonString;
  }
}
