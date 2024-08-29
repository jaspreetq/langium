export function normalizeCode(code: string): string {
    return code
        .split('\n')
        .map(line => line.trim())     // Trim each line
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n');                  // Join lines with a single newline character
}