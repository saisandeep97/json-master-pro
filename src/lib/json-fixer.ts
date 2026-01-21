import JSON5 from 'json5';

export function fixJson(input: string): string {
    if (!input || !input.trim()) return input;

    let fixed = input;

    // 1. Python/Data Corrections (Legacy support)
    fixed = fixed.replace(/:\s*True\b/g, ': true');
    fixed = fixed.replace(/:\s*False\b/g, ': false');
    fixed = fixed.replace(/:\s*None\b/g, ': null');
    fixed = fixed.replace(/u'([^']*)'/g, '"$1"');

    // 2. Fix Quotes (Smart handling of mixed quotes)
    // Handle "key": "value' pattern (double start, single end)
    fixed = fixed.replace(/"([^"\\]*(?:\\.[^"\\]*)*)'/g, '"$1"');
    // Handle 'key': 'value" pattern (single start, double end)
    fixed = fixed.replace(/'([^'\\]*(?:\\.[^'\\]*)*)"/g, '"$1"');
    // Handle 'key': 'value' (all single)
    fixed = fixed.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

    // 3. Fix trailing commas before we try parsing
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

    // 4. Balance Braces/Brackets
    // We scan the code to count unclosed scopes, ignoring text inside strings
    const stack: string[] = [];
    let inString = false;
    let escape = false;
    let quoteChar = '';

    for (let i = 0; i < fixed.length; i++) {
        const char = fixed[i];

        if (inString) {
            if (escape) {
                escape = false;
            } else if (char === '\\') {
                escape = true;
            } else if (char === quoteChar) {
                inString = false;
            }
        } else {
            if (char === '"') {
                inString = true;
                quoteChar = '"';
            } else if (char === '{') {
                stack.push('}');
            } else if (char === '[') {
                stack.push(']');
            } else if (char === '}' || char === ']') {
                const expected = stack[stack.length - 1];
                if (expected === char) {
                    stack.pop();
                } else {
                    // Mismatched closing brace? Ignore or let parser fail?
                    // We'll let it be for now, as removing is dangerous without more context
                }
            }
        }
    }

    // Append missing closing braces
    while (stack.length > 0) {
        fixed += stack.pop();
    }

    // 5. Attempt JSON5 parse
    try {
        const parsed = JSON5.parse(fixed);
        return JSON.stringify(parsed, null, 2);
    } catch (e1) {
        // 6. Aggressive Key Quoting (Fallback)
        try {
            // Match unquoted keys including dashes/dots
            fixed = fixed.replace(/([{,]\s*)([^"'\s{},:][^"':,]*[^"'\s{},:])(\s*:)/g, '$1"$2"$3');
            const parsed = JSON5.parse(fixed);
            return JSON.stringify(parsed, null, 2);
        } catch (e2) {
            return fixed;
        }
    }
}
