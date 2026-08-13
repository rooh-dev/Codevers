/**
 * CODEVERSE - Cinematic Camera
 */
import * as THREE from 'three';
import { clamp01 } from '../utils/helpers.js';

export default class Camera {
    constructor(engine) {
        this.engine = engine;
        this.instance = new THREE.PerspectiveCamera(
            45,
            this.engine.sizes.width / this.engine.sizes.height,
            0.1,
            1200
        );

        this.keyframes = this.createKeyframes();

        this.currentPos = this.keyframes[0].position.clone();
        this.currentLook = this.keyframes[0].look.clone();
        this.currentFov = this.keyframes[0].fov;

        this.targetPos = new THREE.Vector3();
        this.targetLook = new THREE.Vector3();
        this.targetFov = this.currentFov;

        this.mouse = { x: 0, y: 0 };
        this.lastProgress = 0;

        this.instance.position.copy(this.currentPos);
        this.instance.lookAt(this.currentLook);
        this.instance.fov = this.currentFov;
        this.instance.updateProjectionMatrix();
    }

    createKeyframes() {
        const raw = [
            { t: 0.000, position: [0, 0, 38], look: [0, 0, 0], fov: 45 },
            { t: 0.018, position: [0, 1.2, 16], look: [0, 0, 0], fov: 46 },
            { t: 0.038, position: [0, 0, 4], look: [0, 0, 0], fov: 52 },
            { t: 0.048, position: [0, 0, -8], look: [0, 0, -30], fov: 56 },
            { t: 0.070, position: [6, 1, -24], look: [0, 0, -30], fov: 50 },
            { t: 0.088, position: [0, 0, -42], look: [0, 0, -70], fov: 52 },

            { t: 0.100, position: [0, 2, -58], look: [0, 0, -70], fov: 50 },
            { t: 0.130, position: [-7, -1, -64], look: [0, 0, -70], fov: 48 },
            { t: 0.143, position: [0, 0, -82], look: [0, 0, -110], fov: 52 },

            { t: 0.155, position: [0, 2.5, -98], look: [0, 0, -110], fov: 50 },
            { t: 0.185, position: [8, -1, -104], look: [0, 0, -110], fov: 48 },
            { t: 0.198, position: [0, 0, -122], look: [0, 0, -150], fov: 52 },

            { t: 0.210, position: [0, 2, -138], look: [0, 0, -150], fov: 50 },
            { t: 0.240, position: [-8, -2, -144], look: [0, 0, -150], fov: 48 },
            { t: 0.253, position: [0, 0, -162], look: [0, 0, -190], fov: 52 },

            { t: 0.265, position: [0, 3, -178], look: [0, 0, -190], fov: 50 },
            { t: 0.295, position: [8, 2, -184], look: [0, 0, -190], fov: 48 },
            { t: 0.308, position: [0, 0, -202], look: [0, 0, -230], fov: 52 },

            { t: 0.320, position: [0, 2, -218], look: [0, 0, -230], fov: 50 },
            { t: 0.350, position: [-8, -1, -224], look: [0, 0, -230], fov: 48 },
            { t: 0.363, position: [0, 0, -242], look: [0, 0, -270], fov: 52 },

            { t: 0.375, position: [0, 2.5, -258], look: [0, 0, -270], fov: 50 },
            { t: 0.405, position: [8, -2, -264], look: [0, 0, -270], fov: 48 },
            { t: 0.418, position: [0, 0, -282], look: [0, 0, -310], fov: 52 },

            { t: 0.430, position: [0, 2, -298], look: [0, 0, -310], fov: 50 },
            { t: 0.460, position: [-7, 2, -304], look: [0, 0, -310], fov: 48 },
            { t: 0.475, position: [0, 0, -322], look: [0, 0, -360], fov: 54 },

            { t: 0.492, position: [0, 3, -348], look: [0, 0, -380], fov: 52 },
            { t: 0.515, position: [13, 4, -372], look: [0, 0, -380], fov: 50 },
            { t: 0.545, position: [-13, -4, -386], look: [0, 0, -380], fov: 50 },
            { t: 0.575, position: [0, 11, -348], look: [0, 0, -380], fov: 52 },
            { t: 0.605, position: [0, 1.5, -366], look: [0, 0, -380], fov: 55 },
            { t: 0.630, position: [0, 0, -379], look: [0, 0, -380], fov: 58 },

            { t: 0.642, position: [0, 0, -398], look: [0, 0, -460], fov: 60 },
            { t: 0.660, position: [0, 1.8, -428], look: [0, 0, -460], fov: 54 },
            { t: 0.685, position: [7, 2, -452], look: [0, 0, -460], fov: 50 },
            { t: 0.715, position: [-7, -1.5, -452], look: [0, 0, -460], fov: 50 },
            { t: 0.745, position: [0, 1, -438], look: [0, 0, -460], fov: 52 },
            { t: 0.760, position: [0, 0, -468], look: [0, 0, -500], fov: 56 },

            { t: 0.778, position: [0, 2, -508], look: [0, 0, -560], fov: 52 },
            { t: 0.800, position: [7, 2, -548], look: [0, 0, -560], fov: 50 },
            { t: 0.820, position: [0, 2, -585], look: [0, 0, -630], fov: 52 },
            { t: 0.842, position: [-7, 2, -620], look: [0, 0, -630], fov: 50 },
            { t: 0.862, position: [0, 2, -660], look: [0, 0, -700], fov: 52 },
            { t: 0.884, position: [7, 2, -692], look: [0, 0, -700], fov: 50 },
            { t: 0.904, position: [0, 2, -730], look: [0, 0, -770], fov: 52 },
            { t: 0.926, position: [-7, 2, -762], look: [0, 0, -770], fov: 50 },

            { t: 0.950, position: [0, 0, -820], look: [0, 0, -950], fov: 58 },
            { t: 1.000, position: [0, 0, -950], look: [0, 0, -1200], fov: 60 }
        ];

        return raw.map((keyframe) => ({
            t: keyframe.t,
            position: new THREE.Vector3(...keyframe.position),
            look: new THREE.Vector3(...keyframe.look),
            fov: keyframe.fov
        }));
    }

    getKeyframeIndex(progress) {
        if (progress <= this.keyframes[0].t) return 0;

        for (let i = 0; i < this.keyframes.length - 1; i++) {
            if (progress >= this.keyframes[i].t && progress <= this.keyframes[i + 1].t) {
                return i;
            }
        }

        return this.keyframes.length - 2;
    }

    resize() {
        this.instance.aspect = this.engine.sizes.width / this.engine.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update(progress, deltaTime) {
        const p = clamp01(progress);
        this.lastProgress = p;

        const index = this.getKeyframeIndex(p);
        const a = this.keyframes[index];
        const b = this.keyframes[index + 1];

        const span = b.t - a.t || 1;
        const local = clamp01((p - a.t) / span);

        this.targetPos.lerpVectors(a.position, b.position, local);
        this.targetLook.lerpVectors(a.look, b.look, local);
        this.targetFov = THREE.MathUtils.lerp(a.fov, b.fov, local);

        const parallaxStrength = 0.85;
        this.targetPos.x += this.mouse.x * parallaxStrength;
        this.targetPos.y += this.mouse.y * parallaxStrength;

        const damp = 1.0 - Math.exp(-6.0 * deltaTime);

        this.currentPos.lerp(this.targetPos, damp);
        this.currentLook.lerp(this.targetLook, damp);
        this.currentFov += (this.targetFov - this.currentFov) * damp;

        this.instance.position.copy(this.currentPos);
        this.instance.lookAt(this.currentLook);

        if (Math.abs(this.instance.fov - this.currentFov) > 0.001) {
            this.instance.fov = this.currentFov;
            this.instance.updateProjectionMatrix();
        }
    }

    setMouseParallax(normalizedX, normalizedY) {
        this.mouse.x = normalizedX;
        this.mouse.y = normalizedY;
    }
}