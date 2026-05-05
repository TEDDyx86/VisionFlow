import { createCameraManager } from "../../core/camera-manager.js";
import { drawLandmarks, clearLandmarks, getPalmScale, setCanvasSize } from "../../core/hand-geometry.js";
import { createCursorController } from "./cursor.js";
import { createPinchDetector } from "./pinch.js";
import { createScrollController } from "./scroll.js";
import { createAudioManager } from "../../core/audio.js";
import { saveJSON, loadJSON } from "../../core/storage.js";
import { setStatusText, showNotification, toggleModal } from "../../core/ui.js";
import { STORAGE_KEYS } from "../../core/constants.js";

(function init() {
    const dom = {
        video: document.getElementById("videoElement"),
        landmarkCanvas: document.getElementById("landmarkCanvas"),
        effectsCanvas: document.getElementById("effectsCanvas"),
        cursor: document.getElementById("hand-cursor"),
        toast: document.getElementById("notification-toast"),
        
        // Status
        cameraStatus: document.getElementById("camera-status"),
        handStatus: document.getElementById("hand-status"),
        metricsStatus: document.getElementById("metrics-status"),
        
        // Buttons
        toggleCameraBtn: document.getElementById("toggle-camera"),
        toggleLandmarksBtn: document.getElementById("toggle-landmarks"),
        resetSettingsBtn: document.getElementById("reset-settings"),
        
        // Settings
        sliderSmoothing: document.getElementById("slider-smoothing"),
        valSmoothing: document.getElementById("val-smoothing"),
        sliderPinch: document.getElementById("slider-pinch"),
        valPinch: document.getElementById("val-pinch"),
        sliderScroll: document.getElementById("slider-scroll"),
        valScroll: document.getElementById("val-scroll"),
        
        // Modais
        consentModal: document.getElementById("consent-modal"),
        acceptConsentBtn: document.getElementById("accept-consent"),
        denyConsentBtn: document.getElementById("deny-consent")
    };

    const state = {
        config: loadJSON(STORAGE_KEYS.BIOMETRICS, {
            smoothing: 0.65,
            pinchThreshold: 0.45,
            scrollSpeed: 15,
            showLandmarks: true
        }),
        cameraActive: false,
        handPresent: false,
        lastResults: null,
        stats: {
            fps: 0,
            clicks: 0,
            uptime: 0
        }
    };

    const ctxLandmarks = dom.landmarkCanvas.getContext("2d");
    const audio = createAudioManager();
    const cursor = createCursorController(dom.cursor);
    const pinch = createPinchDetector({ 
        thresholdRatio: state.config.pinchThreshold,
        cooldown: 350 
    });
    const scroll = createScrollController({ 
        speed: state.config.scrollSpeed 
    });

    const cameraManager = createCameraManager(dom.video, onResults);

    function onResults(results) {
        state.lastResults = results;
        const hand = results.multiHandLandmarks?.[0];
        
        if (hand) {
            if (!state.handPresent) {
                state.handPresent = true;
                setStatusText(dom.handStatus, "Detectada", "detectado");
                cursor.setVisible(true);
            }

            const palmScale = getPalmScale(hand);
            const indexTip = hand[8];
            
            // Update Cursor
            cursor.updatePosition(
                (1 - indexTip.x) * window.innerWidth,
                indexTip.y * window.innerHeight,
                state.config.smoothing
            );

            // Detect Pinch
            const pinchEvent = pinch.detect(hand, palmScale);
            if (pinchEvent === "start") {
                state.stats.clicks++;
                audio.playSound("click");
                dom.cursor.classList.add("pinch");
                triggerClick(cursor.x, cursor.y);
            } else if (pinchEvent === "end") {
                dom.cursor.classList.remove("pinch");
            }

            // Update Scroll
            scroll.update(indexTip.y);

            // Render
            if (state.config.showLandmarks) {
                drawLandmarks(ctxLandmarks, dom.landmarkCanvas, hand);
            } else {
                clearLandmarks(ctxLandmarks, dom.landmarkCanvas);
            }
        } else {
            if (state.handPresent) {
                state.handPresent = false;
                setStatusText(dom.handStatus, "Perdida", "perdido");
                cursor.setVisible(false);
                clearLandmarks(ctxLandmarks, dom.landmarkCanvas);
            }
        }
    }

    function triggerClick(x, y) {
        const el = document.elementFromPoint(x, y);
        if (el) {
            el.click();
            showNotification(dom.toast, "Clique detectado!");
        }
    }

    // Events
    dom.toggleCameraBtn.addEventListener("click", async () => {
        if (cameraManager.isRunning) {
            cameraManager.stop();
            setStatusText(dom.cameraStatus, "Desligada", "perdido");
            dom.toggleCameraBtn.textContent = "Iniciar Câmera";
        } else {
            toggleModal(dom.consentModal, true);
        }
    });

    dom.acceptConsentBtn.addEventListener("click", async () => {
        toggleModal(dom.consentModal, false);
        try {
            await cameraManager.start();
            setStatusText(dom.cameraStatus, "Ativa", "detectado");
            dom.toggleCameraBtn.textContent = "Parar Câmera";
        } catch (e) {
            showNotification(dom.toast, "Erro ao acessar câmera");
        }
    });

    dom.denyConsentBtn.addEventListener("click", () => {
        toggleModal(dom.consentModal, false);
    });

    dom.toggleLandmarksBtn.addEventListener("click", () => {
        state.config.showLandmarks = !state.config.showLandmarks;
        saveJSON(STORAGE_KEYS.BIOMETRICS, state.config);
        showNotification(dom.toast, state.config.showLandmarks ? "Landmarks ativados" : "Landmarks desativados");
    });

    // Sync UI with config
    function syncUI() {
        dom.sliderSmoothing.value = state.config.smoothing * 100;
        dom.valSmoothing.textContent = state.config.smoothing.toFixed(2);
        dom.sliderPinch.value = state.config.pinchThreshold * 100;
        dom.valPinch.textContent = (state.config.pinchThreshold * 100).toFixed(0) + "%";
        dom.sliderScroll.value = state.config.scrollSpeed;
        dom.valScroll.textContent = state.config.scrollSpeed + "x";
    }

    dom.sliderSmoothing.addEventListener("input", (e) => {
        state.config.smoothing = e.target.value / 100;
        syncUI();
        saveJSON(STORAGE_KEYS.BIOMETRICS, state.config);
    });

    window.addEventListener("resize", () => setCanvasSize(dom.landmarkCanvas));
    setCanvasSize(dom.landmarkCanvas);
    syncUI();
})();
