/**
 * Factory for managing camera and MediaPipe Hands instance.
 */
export function createCameraManager(videoEl, onResults, options = {}) {
    let cameraInstance = null;
    let handsInstance = null;
    let isRunning = false;

    async function start() {
        if (isRunning) return;

        if (typeof Hands !== "function" || typeof Camera !== "function") {
            throw new Error("MediaPipe libraries not loaded");
        }

        handsInstance = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsInstance.setOptions({
            maxNumHands: 1,
            modelComplexity: options.modelComplexity ?? 1,
            minDetectionConfidence: options.minDetectionConfidence ?? 0.6,
            minTrackingConfidence: options.minTrackingConfidence ?? 0.6,
            staticImageMode: false
        });

        handsInstance.onResults(onResults);

        cameraInstance = new Camera(videoEl, {
            width: options.width ?? 640,
            height: options.height ?? 480,
            onFrame: async () => {
                if (isRunning && handsInstance) {
                    await handsInstance.send({ image: videoEl });
                }
            }
        });

        await cameraInstance.start();
        isRunning = true;
        return { cameraInstance, handsInstance };
    }

    function stop() {
        if (cameraInstance) {
            cameraInstance.stop();
        }
        cameraInstance = null;
        handsInstance = null;
        isRunning = false;
    }

    return {
        start,
        stop,
        get isRunning() { return isRunning; }
    };
}
