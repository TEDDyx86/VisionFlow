import { clamp, distanceBetween } from "./math.js";
import { HAND_CONNECTIONS } from "./constants.js";

/**
 * Calculates the scale of the palm based on wrist and MCP joints.
 */
export function getPalmScale(landmarks) {
    const wrist = landmarks[0];
    const indexMcp = landmarks[5];
    const middleMcp = landmarks[9];
    const pinkyMcp = landmarks[17];

    if (!wrist || !indexMcp || !middleMcp || !pinkyMcp) {
        return 0.18; // Fallback
    }

    const horizontalSpan = distanceBetween(indexMcp, pinkyMcp);
    const verticalSpan = distanceBetween(wrist, middleMcp);
    return clamp(Math.max(horizontalSpan, verticalSpan, 0.08), 0.08, 0.34);
}

/**
 * Draws the hand landmarks and connections on a canvas.
 */
export function drawLandmarks(ctx, canvas, landmarks, options = {}) {
    if (!ctx || !canvas || !landmarks) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = landmarks.map((point) => ({
        x: (1 - point.x) * canvas.width,
        y: point.y * canvas.height
    }));

    // Draw connections
    ctx.strokeStyle = options.lineColor || "rgba(31, 111, 120, 0.75)";
    ctx.lineWidth = options.lineWidth || 2;
    
    for (const [from, to] of HAND_CONNECTIONS) {
        const p1 = points[from];
        const p2 = points[to];
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    // Draw joints
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.fillStyle = i === 8 ? (options.tipColor || "#f4a261") : (options.jointColor || "#1f6f78");
        ctx.beginPath();
        ctx.arc(p.x, p.y, i === 8 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Clears the landmarks canvas.
 */
export function clearLandmarks(ctx, canvas) {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Syncs canvas dimensions with viewport.
 */
export function setCanvasSize(canvas) {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
