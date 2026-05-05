/**
 * Clamps a value between a minimum and maximum range.
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the Euclidean distance between two 2D/3D points.
 */
export function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}
