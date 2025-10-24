import React from "react";
import images from "../helpers/images.js";

export default function Reel({ reelIndex, symbols, offset, duration, spinning }) {
    return (
        <div className="reel">
            <div
                className="symbols"
                style={{
                    transform: `translateY(-${offset}px)`,
                    transition: spinning ? `transform ${duration / 1000}s linear` : "none",
                    willChange: "transform",
                }}
            >
                {symbols.map((symbol, i) => symbol !== 'Empty' ? <img
                        src={images[symbol]}
                        alt="symbol"
                        key={i}
                        id={
                            reelIndex === 0
                                ? i - 30 >= 0
                                    ? `reel_0_line_${i - 30}`
                                    : undefined
                                : reelIndex === 1
                                    ? i - 45 >= 0
                                        ? `reel_1_line_${i - 45}`
                                        : undefined
                                    : i - 60 >= 0
                                        ? `reel_2_line_${i - 60}`
                                        : undefined
                        }
                    /> : <div style={{width: '100%', height: 100}}></div>
                )}
            </div>
        </div>
    );
}
