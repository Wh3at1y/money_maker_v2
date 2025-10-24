import {useEffect, useRef, useState, Fragment} from "react";
import slotMachineResults from "./helpers/symbol_weights.js";
import "animate.css";
import "./App.css";
import Reel from "./components/Reels.jsx";
import {clearHighlights, formatCash, wait} from "./helpers/utils.js";
import Spin from "./components/Spin.jsx";

import soundManager from "./helpers/sounds.js";
import countSound from "./assets/sounds/counting.wav";
import winSound from "./assets/sounds/winning.wav";

function animateCashWin(start, end, setValue, onComplete, soundManager, playSound = true) {
    const total = end - start;
    if (total <= 0) {
        setValue(end);
        if (onComplete) onComplete();
        return { cancel: () => {} };
    }

    const duration =
        total < 20 ? 800 :
            total < 200 ? 1500 :
                3000; // big wins take longer

    const tickMs = 30;
    const steps = Math.max(1, Math.floor(duration / tickMs));
    const increment = total / steps;

    let current = start;
    let step = 0;
    let timer = null;
    let safety = null;

    if (playSound) {
        // ensure any previous count instances are stopped, then play one
        soundManager.stop("count");
        soundManager.play("count");
    }

    const finish = () => {
        if (timer) clearInterval(timer);
        if (safety) clearTimeout(safety);
        setValue(end);
        if (playSound) soundManager.stop("count");
        if (onComplete) onComplete();
    };

    timer = setInterval(() => {
        step++;
        current += increment;
        if (step >= steps) {
            finish();
        } else {
            setValue(current);
        }
    }, tickMs);

    // safety in case interval misses
    safety = setTimeout(finish, duration + 100);

    // return a cancel function so caller can stop mid-animation if needed
    return {
        cancel: () => {
            if (timer) clearInterval(timer);
            if (safety) clearTimeout(safety);
            if (playSound) soundManager.stop("count");
        }
    };
}



const initialSpin = slotMachineResults();

export default function App() {
    const [spinCount, setSpinCount] = useState(0);
    const [currentSpin, setCurrentSpin] = useState(initialSpin);
    const [spinning, setSpinning] = useState([false, false, false]);
    const [offsets, setOffsets] = useState([0, 0, 0]);
    const [durations, setDurations] = useState([1000, 1500, 2000]);
    const [isSpinComplete, setIsSpinComplete] = useState(false);
    const [isButtonLocked, setIsButtonLocked] = useState(false);
    const [displayWinnings, setDisplayWinnings] = useState(0);

    const [cash, setCash] = useState(100);
    const spinTimeouts = useRef([]);
    const symbolHeight = 100;

    useEffect(() => {
        soundManager.load("count", countSound, 0.6);
        soundManager.load("finished", winSound, 0.7);
    }, []);

    const startSpinAnimation = (reelIndex, totalSymbols, duration) => {
        setDurations((prev) => Object.assign([...prev], {[reelIndex]: duration}));
        setSpinning((prev) => Object.assign([...prev], {[reelIndex]: true}));

        const totalScroll = totalSymbols * symbolHeight;
        setOffsets((prev) => Object.assign([...prev], {[reelIndex]: totalScroll}));

        const timeoutId = setTimeout(() => {
            setSpinning((prev) => Object.assign([...prev], {[reelIndex]: false}));
            if (reelIndex === 2) setIsSpinComplete(true);
        }, duration);

        spinTimeouts.current.push(timeoutId);
    };

    const handleSpinClick = () => {
        if (isButtonLocked) return;

        // Fast-stop if reels are spinning
        if (spinning.some(Boolean)) {
            spinTimeouts.current.forEach(clearTimeout);
            spinTimeouts.current = [];
            setSpinning([false, false, false]);
            setIsSpinComplete(true);
            return;
        }

        setDisplayWinnings(0)

        if (cash < 7) {
            alert("Not enough cash to spin!");
            return;
        }

        setCash((prev) => prev - 7);
        clearHighlights();
        setIsSpinComplete(false);
        setSpinCount((p) => p + 1);

        spinTimeouts.current.forEach(clearTimeout);
        spinTimeouts.current = [];

        const spin = slotMachineResults();
        setCurrentSpin(spin);
        const totalSymbolsPerReel = [30, 45, 60];
        const durationsMs = [1000, 1500, 2000];

        setOffsets([0, 0, 0]);
        setSpinning([false, false, false]);
        setDurations(durationsMs);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                totalSymbolsPerReel.forEach((count, i) =>
                    startSpinAnimation(i, count, durationsMs[i])
                );
            });
        });
    };

    // Handle win highlight loop
    useEffect(() => {
        let cancelled = false;

        async function highlightWins() {
            if (isSpinComplete && currentSpin.winningLines.length && spinCount) {
                const winAmount = currentSpin.winnings;
                if (winAmount > 0) {
                    const newCash = cash + winAmount;

                    // Play counting sound only for the cash counter
                    const cashAnimation = animateCashWin(
                        cash,
                        newCash,
                        setCash,
                        () => {
                            soundManager.play("finished");
                        },
                        soundManager,
                        true // play sound
                    );

                    // Display total winnings separately, no sound
                    const winAnimation = animateCashWin(
                        0,
                        winAmount,
                        setDisplayWinnings,
                        null,
                        soundManager,
                        false // no sound for this one
                    );
                }
                const mappedLines = currentSpin.winningLines.map((line) =>
                    line.positions.map((p) => `reel_${p.reel}_line_${p.line}`)
                );

                const colors = ["#ff000038", "#b47a054a", "#0079ff38", "#0987134a"];

                while (!cancelled) {
                    for (let i = 0; i < mappedLines.length; i++) {
                        if (cancelled) return;
                        clearHighlights();

                        mappedLines[i].forEach((id) => {
                            const el = document.getElementById(id);
                            if (!el) return;
                            el.style.backgroundColor = colors[i % colors.length];
                            el.classList.add(
                                "animate__animated",
                                "animate__pulse",
                                "animate__repeat-2",
                                "animate__fast"
                            );
                        });

                        await wait(1500);

                        mappedLines[i].forEach((id) => {
                            const el = document.getElementById(id);
                            if (el)
                                el.classList.remove(
                                    "animate__animated",
                                    "animate__pulse",
                                    "animate__repeat-2",
                                    "animate__fast"
                                );
                        });
                        await wait(50);
                    }
                }
            }
        }

        void highlightWins();

        return () => {
            cancelled = true;
            clearHighlights();
        };
    }, [isSpinComplete, spinCount]);

    // Button lockout after spin completes
    useEffect(() => {
        if (isSpinComplete) {
            setIsButtonLocked(true);
            const timer = setTimeout(() => setIsButtonLocked(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isSpinComplete]);

    return (
        <div className="slot_wrapper">
            <section className="reels_container">
                {[0, 1, 2].map((i) => (
                    <Fragment key={i}>
                        <Reel
                            reelIndex={i}
                            symbols={currentSpin.results.reels[i].symbols.all}
                            offset={offsets[i]}
                            duration={durations[i]}
                            spinning={spinning[i]}
                        />
                        {i < 2 && (
                            <section className="reel_lines">
                                <hr/>
                                <hr/>
                                <hr/>
                            </section>
                        )}
                    </Fragment>
                ))}
            </section>

            <Spin cash={cash} handleSpinClick={handleSpinClick}
                  isSpinComplete={isSpinComplete} displayWinnings={displayWinnings}/>
        </div>
    );
}
