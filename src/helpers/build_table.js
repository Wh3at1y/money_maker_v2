export default function buildRangeTable(weights) {
    const table = [];
    let current = 1;
    for (const [symbol, count] of Object.entries(weights)) {
        table.push({
            symbol,
            range: [current, current + count - 1]
        });
        current += count;
    }
    return table;
}