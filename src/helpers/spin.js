function spinReel(virtualReel) {
    const totalStops = virtualReel.length;
    const stopIndex = Math.floor(Math.random() * totalStops); // 0–127

    // Compute top, middle, bottom symbols (wrap around)
    const top = virtualReel[(stopIndex - 1 + totalStops) % totalStops];
    const middle = virtualReel[stopIndex];
    const bottom = virtualReel[(stopIndex + 1) % totalStops];

    return {
        stopIndex,
        symbols: { top, middle, bottom }
    };
}


export default function spinMachine(reel1, reel2, reel3) {
    const r1 = spinReel(reel1);
    const r2 = spinReel(reel2);
    const r3 = spinReel(reel3);

    return {
        reels: [r1, r2, r3],
        grid: {
            line1: [r1.symbols.top,    r2.symbols.top,    r3.symbols.top],
            line2: [r1.symbols.middle, r2.symbols.middle, r3.symbols.middle],
            line3: [r1.symbols.bottom, r2.symbols.bottom, r3.symbols.bottom]
        }
    };
}
