import {formatCash} from "../helpers/utils.js";

export default function Spin({
                                 cash,
                                 handleSpinClick,
                                 isSpinComplete,
                                 displayWinnings,
                             }) {
    return (
        <div className="info_wrapper">
            <section className="info_box">
                <h1>LINES</h1>
                <div>7</div>
            </section>

            <section className="info_box larger">
                <h1>CASH</h1>
                <div>${formatCash(cash)}</div>
            </section>

            <section className="spin_button" onClick={handleSpinClick}>
                <h1>$1</h1>
                <h2>SPIN</h2>
            </section>

            <section className="info_box larger">
                <h1>WIN</h1>
                <div>
                    $
                    {isSpinComplete
                        ? formatCash(displayWinnings)
                        : "0.00"}
                </div>
            </section>

            <section className="info_box">
                <h1>BET</h1>
                <div>7</div>
            </section>
        </div>
    );
}
