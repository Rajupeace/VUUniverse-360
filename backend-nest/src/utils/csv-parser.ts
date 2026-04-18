/**
 * CSV Parser utility - mirrors the original backend/utils/csvParser.js
 */
export function parseCSV(content: string): Record<string, string>[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length === 0 || (values.length === 1 && !values[0])) continue;

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        results.push(row);
    }

    return results;
}
