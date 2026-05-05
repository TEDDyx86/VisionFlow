/**
 * Shows a temporary notification toast.
 */
export function showNotification(el, message, duration = 2200) {
    if (!el) return;
    el.textContent = message;
    el.style.display = "block";
    
    if (el._timer) clearTimeout(el._timer);
    el._timer = setTimeout(() => {
        el.style.display = "none";
    }, duration);
}

/**
 * Updates status text and CSS classes.
 */
export function setStatusText(el, text, tone = "") {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("detectado", "perdido");
    if (tone) {
        el.classList.add(tone);
    }
}

/**
 * Toggles a modal visibility.
 */
export function toggleModal(el, visible) {
    if (!el) return;
    if (visible) {
        el.classList.remove("hidden");
    } else {
        el.classList.add("hidden");
    }
}
