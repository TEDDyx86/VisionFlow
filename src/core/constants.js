export const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
];

export const STORAGE_KEYS = {
    BIOMETRICS: "visionflow-lite-settings-v1",
    LIBRAS_SETTINGS: "visionflow-libras-settings-v1",
    LIBRAS_TEMPLATES: "visionflow-libras-templates-v1",
    LIBRAS_TRANSCRIPT: "visionflow-libras-transcript-v1"
};

export const CONFIG_DEFAULTS = {
    CAMERA_WIDTH: 640,
    CAMERA_HEIGHT: 480,
    MAX_FPS: 42,
    CURSOR_ADAPTIVE_DIVISOR: 900
};
