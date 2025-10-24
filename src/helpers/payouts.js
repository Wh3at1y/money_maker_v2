export const payouts = {
    'MoneyMaker': 0,
    'Wild': 0,
    'Seven': 20,
    'Cherry': 3,
    'TripleBar': 14,
    'DoubleBar': 7,
    'Bar': 5,
    'Empty': 0
};

function evaluateLineWithWild(line) {
    // Convert objects to symbol strings
    const symbols = line.map(s => typeof s === 'string' ? s : s.symbol);

    if (symbols.includes('Empty')) return 0;

    const symbolsWithoutWild = symbols.filter(s => s !== 'Wild');
    const uniqueSymbols = [...new Set(symbolsWithoutWild)];

    // All wilds → MoneyMaker payout
    if (symbolsWithoutWild.length === 0) return payouts['MoneyMaker'];

    // All non-wild symbols match → payout
    if (uniqueSymbols.length === 1) {
        const symbol = uniqueSymbols[0];
        if (payouts[symbol] !== undefined) return payouts[symbol];
        console.error(`Unknown symbol: ${symbol}`);
        return 0;
    }

    const barSet = new Set(['Bar', 'DoubleBar', 'TripleBar']);
    const allAreBarsOrWilds = symbolsWithoutWild.every(s => barSet.has(s));
    if (allAreBarsOrWilds) {
        return 5; // mixed bar payout
    }

    // No win
    return 0;
}

const paylines = [
    { name: 'Top Line', positions: [{line:0,reel:0},{line:0,reel:1},{line:0,reel:2}] },
    { name: 'Middle Line', positions: [{line:1,reel:0},{line:1,reel:1},{line:1,reel:2}] },
    { name: 'Bottom Line', positions: [{line:2,reel:0},{line:2,reel:1},{line:2,reel:2}] },
    { name: 'Diagonal TL→BR', positions: [{line:0,reel:0},{line:1,reel:1},{line:2,reel:2}] },
    { name: 'Diagonal BL→TR', positions: [{line:2,reel:0},{line:1,reel:1},{line:0,reel:2}] },
    { name: 'V Top', positions: [{line:0,reel:0},{line:1,reel:1},{line:0,reel:2}] },
    { name: 'V Middle-Up', positions: [{line:1,reel:0},{line:0,reel:1},{line:1,reel:2}] },
    { name: 'V Bottom', positions: [{line:2,reel:0},{line:1,reel:1},{line:2,reel:2}] },
    { name: 'V Middle-Down', positions: [{line:1,reel:0},{line:2,reel:1},{line:1,reel:2}] }
];

export function evaluatePaylines(gridObject) {
    const grid = [
        gridObject.line1,
        gridObject.line2,
        gridObject.line3
    ];

    let totalWinnings = 0;
    const winningLines = [];

    paylines.forEach((payline) => {
        const lineSymbols = payline.positions.map(p => grid[p.line][p.reel]);
        const payout = evaluateLineWithWild(lineSymbols);

        if (payout > 0) {
            totalWinnings += payout;
            winningLines.push({
                name: payline.name,
                payout,
                symbols: lineSymbols.map(s => typeof s === 'string' ? s : s.symbol),
                positions: payline.positions
            });
        }
    });

    return {
        winnings: totalWinnings,
        winningLines
    };
}