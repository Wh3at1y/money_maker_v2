import buildRangeTable from './build_table.js'
import spinMachine from "./spin.js";
import {evaluatePaylines, payouts } from "./payouts.js";

function getSymbolWeights(rtp) {
    if (rtp >= 0.95) return {
        'MoneyMaker': 1, 'Wild': 1, 'Seven': 5, 'Cherry': 10,
        'TripleBar': 15, 'DoubleBar': 24, 'Bar': 70, 'Empty': 150
    };
    else if (rtp >= 0.85) return {
        'MoneyMaker': 1, 'Wild': 1, 'Seven': 3, 'Cherry': 8,
        'TripleBar': 12, 'DoubleBar': 22, 'Bar': 80, 'Empty': 180
    };
    else return {
            'MoneyMaker': 1, 'Wild': 0.5, 'Seven': 2, 'Cherry': 6,
            'TripleBar': 10, 'DoubleBar': 20, 'Bar': 88, 'Empty': 200
        };
}

function printGrid(grid) {
    const displayGrid = {
        line1: grid.line1.map(s => typeof s === 'string' ? s : s.symbol),
        line2: grid.line2.map(s => typeof s === 'string' ? s : s.symbol),
        line3: grid.line3.map(s => typeof s === 'string' ? s : s.symbol)
    };

    console.log('--- Slot Grid ---');
    console.log('Top    :', displayGrid.line1.join('  '));
    console.log('Middle :', displayGrid.line2.join('  '));
    console.log('Bottom :', displayGrid.line3.join('  '));
}

const addImagesToReel = (top, middle, bottom, index, weights) => {
    const weightedSymbols = [];
    for (const [symbol, weight] of Object.entries(weights)) {
        for (let i = 0; i < weight; i++) weightedSymbols.push(symbol);
    }

    let symbolsToReturn = [top.symbol, middle.symbol, bottom.symbol];

    for (let i = 0; i < index; i++) {
        const randomSymbol = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
        symbolsToReturn = [randomSymbol, ...symbolsToReturn];
    }

    return symbolsToReturn;
};
export default function slotMachineResults () {
    const weights = getSymbolWeights(0.8);
    const reel = buildRangeTable(weights);
    const spunMachine = spinMachine(reel, reel, reel)

    printGrid(spunMachine.grid)

    spunMachine.reels[0].symbols.all = addImagesToReel(spunMachine.reels[0].symbols.top, spunMachine.reels[0].symbols.middle, spunMachine.reels[0].symbols.bottom, 30, weights);
    spunMachine.reels[1].symbols.all = addImagesToReel(spunMachine.reels[1].symbols.top, spunMachine.reels[1].symbols.middle, spunMachine.reels[1].symbols.bottom, 45, weights);
    spunMachine.reels[2].symbols.all = addImagesToReel(spunMachine.reels[2].symbols.top, spunMachine.reels[2].symbols.middle, spunMachine.reels[2].symbols.bottom, 60, weights);


    const {winnings, winningLines} = evaluatePaylines(spunMachine.grid)
    return {
        results: spunMachine,
        winnings,
        winningLines
    }
}

