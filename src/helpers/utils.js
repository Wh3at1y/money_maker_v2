export const clearHighlights = () => {
    const highlighted = document.querySelectorAll("[id^='reel_']");
    highlighted.forEach((el) => {
        el.style.backgroundColor = "transparent";
        el.classList.remove(
            "animate__animated",
            "animate__pulse",
            "animate__repeat-2",
            "animate__fast"
        );
    });
};

export const formatCash = (cash) => cash.toFixed(2);

export const wait = (ms) => new Promise((res) => setTimeout(res, ms));
