import { distanceBetween } from "../../core/math.js";

/**
 * Creates a normalized embedding of hand landmarks.
 */
export function createEmbedding(landmarks) {
    if (!landmarks) return null;
    const wrist = landmarks[0];
    return landmarks.map(p => ({
        x: p.x - wrist.x,
        y: p.y - wrist.y,
        z: p.z - wrist.z
    }));
}

/**
 * Calculates distance between two embeddings.
 */
export function embeddingDistance(emb1, emb2) {
    let total = 0;
    for (let i = 0; i < emb1.length; i++) {
        total += distanceBetween(emb1[i], emb2[i]);
    }
    return total / emb1.length;
}

/**
 * Finds the best matching template.
 */
export function matchTemplate(embedding, templates, threshold = 0.15) {
    let bestMatch = null;
    let minDist = Infinity;

    templates.forEach(t => {
        const dist = embeddingDistance(embedding, t.embedding);
        if (dist < minDist) {
            minDist = dist;
            bestMatch = t;
        }
    });

    if (bestMatch && minDist < threshold) {
        return { 
            label: bestMatch.label, 
            confidence: Math.max(0.1, 1 - (minDist / threshold)) 
        };
    }
    return null;
}
