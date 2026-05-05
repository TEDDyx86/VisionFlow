/**
 * Saves an object to LocalStorage as JSON.
 */
export function saveJSON(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.warn("Failed to save to localStorage:", e);
        return false;
    }
}

/**
 * Loads and parses JSON from LocalStorage.
 */
export function loadJSON(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn("Failed to load from localStorage:", e);
        return defaultValue;
    }
}
