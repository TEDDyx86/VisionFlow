import { createCameraManager } from "../../core/camera-manager.js";
import { drawLandmarks, clearLandmarks, setCanvasSize } from "../../core/hand-geometry.js";
import { classifyBuiltInLibras } from "./classifier.js";
import { createEmbedding, matchTemplate } from "./templates.js";
import { createComposer } from "./composer.js";
import { saveJSON, loadJSON } from "../../core/storage.js";
import { setStatusText, showNotification, toggleModal } from "../../core/ui.js";
import { STORAGE_KEYS } from "../../core/constants.js";

(function init() {
    const dom = {
        video: document.getElementById("videoElement"),
        landmarkCanvas: document.getElementById("landmarkCanvas"),
        currentLetter: document.getElementById("current-letter"),
        confidenceFill: document.getElementById("confidence-fill"),
        confidenceText: document.getElementById("confidence-text"),
        outputText: document.getElementById("output-text"),
        suggestions: document.getElementById("suggestions"),
        
        // Status
        cameraStatus: document.getElementById("camera-status"),
        handStatus: document.getElementById("hand-status"),
        engineStatus: document.getElementById("engine-status"),
        
        // Actions
        toggleCameraBtn: document.getElementById("toggle-camera"),
        actionSpace: document.getElementById("action-space"),
        actionBackspace: document.getElementById("action-backspace"),
        actionClear: document.getElementById("action-clear"),
        
        // Modais
        consentModal: document.getElementById("consent-modal"),
        acceptConsentBtn: document.getElementById("accept-consent"),
        denyConsentBtn: document.getElementById("deny-consent")
    };

    const state = {
        config: loadJSON(STORAGE_KEYS.LIBRAS_SETTINGS, {
            stabilityMs: 620,
            confidenceThreshold: 0.78
        }),
        templates: loadJSON(STORAGE_KEYS.LIBRAS_TEMPLATES, []),
        handPresent: false,
        recognitionActive: false
    };

    const ctxLandmarks = dom.landmarkCanvas.getContext("2d");
    const composer = createComposer();
    composer.text = loadJSON(STORAGE_KEYS.LIBRAS_TRANSCRIPT, "");

    const cameraManager = createCameraManager(dom.video, onResults);

    function onResults(results) {
        const hand = results.multiHandLandmarks?.[0];
        
        if (hand) {
            if (!state.handPresent) {
                state.handPresent = true;
                setStatusText(dom.handStatus, "Detectada", "detectado");
                setStatusText(dom.engineStatus, "Processando...", "detectado");
            }

            // Classification logic
            const builtIn = classifyBuiltInLibras(hand);
            const embedding = createEmbedding(hand);
            const custom = matchTemplate(embedding, state.templates);

            const best = custom?.confidence > (builtIn?.confidence || 0) ? custom : builtIn;

            if (best && best.confidence > state.config.confidenceThreshold) {
                updateLiveUI(best.label, best.confidence);
                processRecognition(best.label);
            } else {
                updateLiveUI("-", 0);
            }

            drawLandmarks(ctxLandmarks, dom.landmarkCanvas, hand);
        } else {
            if (state.handPresent) {
                state.handPresent = false;
                setStatusText(dom.handStatus, "Perdida", "perdido");
                updateLiveUI("-", 0);
                clearLandmarks(ctxLandmarks, dom.landmarkCanvas);
            }
        }
    }

    let lastLabel = "";
    let lastCommitTime = 0;

    function processRecognition(label) {
        if (label === lastLabel) {
            const now = Date.now();
            if (now - lastCommitTime > state.config.stabilityMs) {
                composer.addChar(label);
                renderOutput();
                lastCommitTime = now;
                lastLabel = ""; // Reset for next char
            }
        } else {
            lastLabel = label;
            lastCommitTime = Date.now();
        }
    }

    function updateLiveUI(label, confidence) {
        dom.currentLetter.textContent = label;
        const percent = Math.round(confidence * 100);
        dom.confidenceFill.style.width = `${percent}%`;
        dom.confidenceText.textContent = `Confiança ${percent}%`;
    }

    function renderOutput() {
        dom.outputText.textContent = composer.text || "Aguardando sinais...";
        dom.outputText.classList.toggle("placeholder", !composer.text);
        saveJSON(STORAGE_KEYS.LIBRAS_TRANSCRIPT, composer.text);
        renderSuggestions();
    }

    function renderSuggestions() {
        const list = composer.getSuggestions();
        dom.suggestions.innerHTML = "";
        list.forEach(word => {
            const chip = document.createElement("button");
            chip.className = "chip";
            chip.textContent = word;
            chip.onclick = () => {
                composer.text = composer.text.split(" ").slice(0, -1).join(" ") + " " + word + " ";
                renderOutput();
            };
            dom.suggestions.appendChild(chip);
        });
    }

    // Buttons
    dom.toggleCameraBtn.addEventListener("click", () => {
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

    dom.denyConsentBtn.addEventListener("click", () => toggleModal(dom.consentModal, false));

    dom.actionSpace.onclick = () => { composer.addSpace(); renderOutput(); };
    dom.actionBackspace.onclick = () => { composer.backspace(); renderOutput(); };
    dom.actionClear.onclick = () => { composer.clear(); renderOutput(); };

    window.addEventListener("resize", () => setCanvasSize(dom.landmarkCanvas));
    setCanvasSize(dom.landmarkCanvas);
    renderOutput();
})();
