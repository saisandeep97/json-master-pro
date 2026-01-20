import JSON5 from 'json5';

export function fixJson(input: string): string {
    if (!input || !input.trim()) return input;

    let fixed = input;

    // 1. Python/Data Corrections (Must happen first)
    fixed = fixed.replace(/:\s*True\b/g, ': true');
    fixed = fixed.replace(/:\s*False\b/g, ': false');
    fixed = fixed.replace(/:\s*None\b/g, ': null');
    fixed = fixed.replace(/u'([^']*)'/g, '"$1"'); // Python unicode strings u'text' -> "text"
    fixed = fixed.replace(/'([^']*)'/g, '"$1"'); // Python single quotes 'text' -> "text"

    // 2. Fix trailing commas (Common issue)
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 3. Attempt JSON5 parse (Best case scenario)
    try {
        const parsed = JSON5.parse(fixed);
        return JSON.stringify(parsed, null, 2);
    } catch (e1) {
        // 4. Aggressive Fix (Fallback)
        // If JSON5 failed, we try to quote unquoted keys more aggressively
        // This regex matches "key": or key: and ensures key is quoted.
        // It uses a negative lookbehind/lookahead strategy or just brute force replacement of non-quoted keys.

        try {
            // Quote anything before a colon that isn't already quoted and doesn't look like a number
            // Note: This is imperfect but helps with { kebab-case-key: 1 }
            // Match: start of line or comma/brace, then whitespace, then NOT a quote, then colon

            // A safer specific strategies for keys:
            // Match unquoted keys including dashes/dots
            fixed = fixed.replace(/([{,]\s*)([^"'\s{},:][^"':,]*[^"'\s{},:])(\s*:)/g, '$1"$2"$3');

            const parsed = JSON5.parse(fixed);
            return JSON.stringify(parsed, null, 2);
        } catch (e2) {
            // If all else fails, return the partial fix so user can see what happened
            return fixed;
        }
    }
}
