import { clamp } from "../../core/math.js";

export function createCursorController(cursorEl) {
    const state = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        visible: false
    };

    function updatePosition(rawX, rawY, smoothFactor) {
        // Linear interpolation for smoothing
        state.x += (rawX - state.x) * (1 - smoothFactor);
        state.y += (rawY - state.y) * (1 - smoothFactor);

        if (cursorEl) {
            cursorEl.style.left = `${state.x}px`;
            cursorEl.style.top = `${state.y}px`;
        }
    }

    function setVisible(visible) {
        state.visible = visible;
        if (cursorEl) {
            cursorEl.style.display = visible ? "block" : "none";
        }
    }

    return {
        updatePosition,
        setVisible,
        get x() { return state.x; },
        get y() { return state.y; }
    };
}
