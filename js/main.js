// js/main.js

// --- DOM Elements ---
const modelSelect = document.getElementById('model-select');
const viewerContainer = document.getElementById('viewer-container');
const infoPanel = {
    name: document.getElementById('layer-name'),
    purpose: document.getElementById('layer-purpose'),
    protocols: document.getElementById('layer-protocols'),
    pdu: document.getElementById('layer-pdu'),
};
// const animateSendBtn = document.getElementById('animate-send-btn'); // We'll use this later

// --- Three.js Variables ---
let scene, camera, renderer; // OrbitControls will be 'controls'
let currentModelLayers = []; // To store 3D objects of layers
const layerHeight = 1;
const layerGap = 0.2;
const layerWidth = 6; // Wider for better text potentially
const layerDepth = 4;

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Dark grey background for 3D view

    // Camera
    const aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, (networkModels.osi.layers.length * (layerHeight + layerGap)) / 4, 10); // Adjust for better initial view
    camera.lookAt(0, (networkModels.osi.layers.length * (layerHeight + layerGap)) / 4, 0);


    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    viewerContainer.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Softer ambient
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Stronger directional
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- OrbitControls (Optional but Highly Recommended) ---
    // If you don't have OrbitControls.js, comment this section out
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;
    // controls.screenSpacePanning = false;
    // controls.minDistance = 5;
    // controls.maxDistance = 50;
    // controls.target.set(0, (networkModels.osi.layers.length * (layerHeight + layerGap)) / 4, 0); // Center target

    // Event Listeners
    modelSelect.addEventListener('change', loadSelectedModel);
    window.addEventListener('resize', onWindowResize);

    // Load default model
    loadSelectedModel();
    animate();
}

// --- Model Loading and Display ---
function loadSelectedModel() {
    const modelKey = modelSelect.value;
    const modelData = networkModels[modelKey];

    // Clear previous model
    currentModelLayers.forEach(layerObj => {
        if (layerObj.mesh) scene.remove(layerObj.mesh);
        if (layerObj.labelSprite) scene.remove(layerObj.labelSprite); // For text labels later
    });
    currentModelLayers = [];

    if (modelData) {
        const totalHeight = (modelData.layers.length * (layerHeight + layerGap)) - layerGap;
        const bottomY = -totalHeight / 2;

        modelData.layers.forEach((layer, index) => {
            const geometry = new THREE.BoxGeometry(layerWidth, layerHeight, layerDepth);
            const material = new THREE.MeshStandardMaterial({
                color: layer.color,
                transparent: true,
                opacity: 0.85,
                roughness: 0.7,
                metalness: 0.1
            });
            const layerMesh = new THREE.Mesh(geometry, material);

            // Position layers from bottom up
            const yPos = bottomY + index * (layerHeight + layerGap) + layerHeight / 2;
            layerMesh.position.set(0, yPos, 0);

            layerMesh.userData = { layerInfo: layer, originalColor: new THREE.Color(layer.color) };
            scene.add(layerMesh);
            // currentModelLayers.push(layerMesh); // Store mesh directly
            currentModelLayers.push({mesh: layerMesh, info: layer}); // Store as object for more properties

            // Add Text Label (Sprite based)
            const labelSprite = makeTextSprite(layer.name, { fontsize: 24, fontface: "Arial", textColor: { r:0, g:0, b:0, a:1.0 } });
            labelSprite.position.set(0, yPos, layerDepth / 2 + 0.1); // Position in front of the layer
            scene.add(labelSprite);
            // currentModelLayers.push(labelSprite); // Also add label for easy removal if needed (or group them)
        });
    }
    displayLayerInfo(null); // Clear info panel
}

// --- Helper for Text Sprites ---
function makeTextSprite(message, parameters) {
    const fontface = parameters.fontface || 'Arial';
    const fontsize = parameters.fontsize || 18;
    const borderThickness = parameters.borderThickness || 0; // No border for simplicity
    const borderColor = parameters.borderColor || { r:0, g:0, b:0, a:1.0 };
    const backgroundColor = parameters.backgroundColor || { r:255, g:255, b:255, a:0.0 }; // Transparent background
    const textColor = parameters.textColor || { r:0, g:0, b:0, a:1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // Get text metrics
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    canvas.width = textWidth + borderThickness * 2;
    canvas.height = fontsize * 1.4 + borderThickness * 2; // 1.4 is an arbitrary multiplier for height

    // Background (transparent)
    context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    context.font = "Bold " + fontsize + "px " + fontface; // Set font again after canvas resize
    context.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
    context.fillText(message, borderThickness, fontsize + borderThickness);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Scale sprite to a reasonable size
    sprite.scale.set(0.05 * canvas.width, 0.05 * canvas.height, 1.0); // Adjust scaling as needed
    return sprite;
}


// --- Info Panel ---
function displayLayerInfo(layerInfo) {
    if (layerInfo) {
        infoPanel.name.textContent = `Name: ${layerInfo.name} (Layer ${layerInfo.id})`;
        infoPanel.purpose.textContent = `Purpose: ${layerInfo.purpose}`;
        infoPanel.protocols.textContent = `Protocols: ${layerInfo.protocols}`;
        infoPanel.pdu.textContent = `PDU: ${layerInfo.pdu}`;
    } else {
        infoPanel.name.textContent = "Name: -";
        infoPanel.purpose.textContent = "Purpose: -";
        infoPanel.protocols.textContent = "Protocols: -";
        infoPanel.pdu.textContent = "PDU: -";
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    // if (controls) controls.update(); // If using OrbitControls
    renderer.render(scene, camera);
}

// --- Window Resize ---
function onWindowResize() {
    camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
}

// --- Start ---
init();