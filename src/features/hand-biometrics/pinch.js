import { distanceBetween } from "../../core/math.js";

export function createPinchDetector(options = {}) {
    let isPinching = false;
    let lastPinchTime = 0;
    const cooldown = options.cooldown || 300;

    function detect(landmarks, palmScale) {
        if (!landmarks) return false;

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const dist = distanceBetween(thumbTip, indexTip);
        const threshold = palmScale * (options.thresholdRatio || 0.45);

        const now = performance.now();
        const currentlyPinching = dist < threshold;

        if (currentlyPinching && !isPinching && (now - lastPinchTime > cooldown)) {
            isPinching = true;
            lastPinchTime = now;
            return "start";
        } else if (!currentlyPinching && isPinching) {
            isPinching = false;
            return "end";
        }

        return currentlyPinching ? "pinching" : "none";
    }

    return { detect };
}
