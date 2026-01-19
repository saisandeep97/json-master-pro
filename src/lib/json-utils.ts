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
  export function fixJson(jsonString: string): string {
    let fixed = jsonString;
  
    // 1. Remove trailing commas in objects and arrays
    // Matches a comma followed by closing brace/bracket, ignoring whitespace
    fixed = fixed.replace(/,\s*([\]}])/g, '$1');
  
    // 2. Wrap unquoted keys in double quotes
    // This is naive and matches words followed by colon.
    // e.g. { key: 1 } -> { "key": 1 }
    // We try to be careful not to match inside strings, but simple regex is limited.
    // A more robust way involves a tokenizer, but this works for 90% of "copy-paste object" cases.
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
  
    // 3. Replace single quotes with double quotes
    // CAUTION: This might break strings that contain ' inside.
    // We simple-replace ' with " at start/end of values/keys
    // This looks for 'string' and tries to replace it.
    fixed = fixed.replace(/'([^']*)'/g, '"$1"');
    
    // 4. One more pass at trailing commas just in case the previous replacers introduced/revealed some?
    // (Actually the first pass should be enough, but let's re-run parse to verify or maybe use a library in v2)
    
    // Try to parse to see if it worked. If not, maybe we can't fix it easily.
    try {
      const parsed = JSON.parse(fixed);
      return JSON.stringify(parsed, null, 2); // Return prettified
    } catch (e) {
      // If our naive fix didn't make it valid, return the modified string anyway
      // so the user can see what we did, or maybe return original?
      // Let's return the "attempted fix" so they can inspect.
      return fixed;
    }
  }
