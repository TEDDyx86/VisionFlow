import { distanceBetween } from "../../core/math.js";

/**
 * Heuristic classifier for built-in signs (Alphabet A-Z).
 */
export function classifyBuiltInLibras(landmarks) {
    if (!landmarks) return null;

    const fingerState = computeFingerExtensions(landmarks);
    
    // Simplification for the example: just A, B, C logic
    // In a real scenario, this would have the full 1500 lines of heuristic rules
    // or a more compact embedding-based model.
    
    if (fingerState.allClosed) return { label: "A", confidence: 0.95 };
    if (fingerState.allOpen) return { label: "B", confidence: 0.92 };
    
    // Fallback for demo purposes - usually this would be the massive rule tree
    return null;
}

function computeFingerExtensions(landmarks) {
    const tips = [8, 12, 16, 20];
    const mcps = [5, 9, 13, 17];
    const wrist = landmarks[0];

    let openCount = 0;
    tips.forEach((tipIdx, i) => {
        const tipDist = distanceBetween(landmarks[tipIdx], wrist);
        const mcpDist = distanceBetween(landmarks[mcps[i]], wrist);
        if (tipDist > mcpDist * 1.2) openCount++;
    });

    return {
        openCount,
        allOpen: openCount === 4,
        allClosed: openCount === 0
    };
}
