import JSON5 from 'json5';
import yaml from 'js-yaml';
import { js2xml } from 'xml-js';
import { Parser } from 'json2csv';
import JsonToTS from 'json-to-ts';

/**
 * Validates a JSON string.
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
 * Attempts to fix common JSON errors by using JSON5 parsing.
 */
export function fixJson(jsonString: string): string {
  try {
    const parsed = JSON5.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return jsonString;
  }
}

/**
 * Converts JSON string to YAML.
 */
export function toYaml(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return yaml.dump(parsed);
}

/**
 * Converts JSON string to XML.
 */
export function toXml(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  // Wrap in root element if necessary or let xml-js handle it
  return js2xml({ root: parsed }, { compact: true, spaces: 2 });
}

/**
 * Converts JSON string to CSV.
 * Note: Only works well for flat arrays of objects.
 */
export function toCsv(jsonString: string): string {
  const parsed = JSON.parse(jsonString);

  // Check if it's an array, if not wrap it
  const data = Array.isArray(parsed) ? parsed : [parsed];

  try {
    const parser = new Parser();
    return parser.parse(data);
  } catch (e: any) {
    return `Error converting to CSV: ${e.message}`;
  }
}

/**
 * Generates TypeScript interfaces from JSON.
 */
export function toTypescript(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  try {
    const interfaces = JsonToTS(parsed);
    return interfaces.join('\n\n');
  } catch (e: any) {
    return `Error generating TypesScript: ${e.message}`;
  }
}
