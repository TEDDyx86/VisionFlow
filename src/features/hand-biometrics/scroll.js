import { clamp } from "../../core/math.js";

export function createScrollController(options = {}) {
    const neutralLow = options.neutralLow || 0.38;
    const neutralHigh = options.neutralHigh || 0.62;
    const speedMultiplier = options.speed || 15;

    function update(handY) {
        let delta = 0;
        
        if (handY < neutralLow) {
            // Scroll up
            const intensity = (neutralLow - handY) / neutralLow;
            delta = -intensity * speedMultiplier;
        } else if (handY > neutralHigh) {
            // Scroll down
            const intensity = (handY - neutralHigh) / (1 - neutralHigh);
            delta = intensity * speedMultiplier;
        }

        if (Math.abs(delta) > 0.5) {
            window.scrollBy({
                top: delta,
                behavior: "auto"
            });
            return delta < 0 ? "up" : "down";
        }

        return "none";
    }

    return { update };
}
