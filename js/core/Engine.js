/**
 * CODEVERSE - 3D Engine Core
 */
import * as THREE from 'three';
import Camera from './Camera.js';
import Device from './Device.js';

export default class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = new Device();

        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.time = {
            elapsed: 0,
            delta: 0
        };

        this.clock = new THREE.Clock();

        this.isRunning = false;
        this.isActive = false;

        this.frameCount = 0;
        this.fpsTime = 0;
        this.lastDprChange = 0;

        this.baseDpr = this.device.dpr;
        this.currentDpr = this.device.dpr;
        this.minDpr = Math.max(0.5, Math.min(this.baseDpr, 0.75));

        this.resizeQueued = false;

        this.handleResize = this.requestResize.bind(this);
        this.handleContextLost = this.onContextLost.bind(this);
        this.handleContextRestored = this.onContextRestored.bind(this);

        this.setup();
    }

    setup() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x040608);
        this.scene.fog = new THREE.FogExp2(0x040608, 0.011);

        this.camera = new Camera(this);
        this.scene.add(this.camera.instance);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !this.device.isMobile && this.device.qualityTier !== 'low',
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.currentDpr);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.28;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.62);
        this.scene.add(ambientLight);

        const hemisphereLight = new THREE.HemisphereLight(
            0x2b3b46,
            0x040608,
            0.35
        );
        this.scene.add(hemisphereLight);

        const pointLight = new THREE.PointLight(0x00e5ff, 2.2, 95);
        pointLight.position.set(6, 8, 8);
        this.scene.add(pointLight);

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize, { passive: true });

        this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
        this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);
    }

    requestResize() {
        if (this.resizeQueued) return;

        this.resizeQueued = true;

        requestAnimationFrame(() => {
            this.resizeQueued = false;
            this.resize();
        });
    }

    resize() {
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.resize();

        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(this.currentDpr);
    }

    applyPixelRatio() {
        this.renderer.setPixelRatio(this.currentDpr);
        this.renderer.setSize(this.sizes.width, this.sizes.height);
    }

    updateAdaptiveQuality(delta) {
        this.frameCount++;
        this.fpsTime += delta;

        if (this.fpsTime < 1.0) return;

        const fps = this.frameCount / this.fpsTime;

        this.frameCount = 0;
        this.fpsTime = 0;

        const now = this.time.elapsed;

        if (now - this.lastDprChange < 2.0) return;

        if (fps < 45 && this.currentDpr > this.minDpr) {
            this.currentDpr = Math.max(this.minDpr, this.currentDpr - 0.25);
            this.applyPixelRatio();
            this.lastDprChange = now;
        } else if (fps > 58 && this.currentDpr < this.baseDpr) {
            this.currentDpr = Math.min(this.baseDpr, this.currentDpr + 0.25);
            this.applyPixelRatio();
            this.lastDprChange = now;
        }
    }

    start() {
        this.isActive = true;

        if (!document.hidden && !this.isRunning) {
            this.isRunning = true;

            // Flush any large delta caused by tab switching or pause.
            this.clock.getDelta();

            this.update();
        }
    }

    stop() {
        this.isActive = false;
        this.isRunning = false;
    }

    onVisibilityChange() {
        if (document.hidden) {
            this.isRunning = false;
        } else if (this.isActive && !this.isRunning) {
            this.isRunning = true;

            // Flush the delta accumulated while hidden.
            this.clock.getDelta();

            this.update();
        }
    }

    onContextLost(event) {
        event.preventDefault();

        this.stop();

        window.dispatchEvent(
            new CustomEvent('codeverse:engine-error', {
                detail: {
                    message:
                        'The WebGL context was lost. ' +
                        'Please reload the page to continue the experience.'
                }
            })
        );
    }

    onContextRestored() {
        // Intentionally conservative.
        // Automatic restoration can be unstable across GPUs and drivers.
        // The safest QA behavior is to keep the experience stopped and
        // allow the user to reload.
    }

    update() {
        if (!this.isRunning) return;

        this.time.delta = Math.min(this.clock.getDelta(), 0.1);
        this.time.elapsed = this.clock.getElapsedTime();

        this.updateAdaptiveQuality(this.time.delta);

        this.renderer.render(this.scene, this.camera.instance);

        requestAnimationFrame(() => this.update());
    }

    dispose() {
        this.stop();

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);

        this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);

        this.renderer.dispose();
    }
}