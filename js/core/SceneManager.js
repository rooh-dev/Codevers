/**
 * CODEVERSE - Scene Manager
 */
import * as THREE from 'three';
import {
    clamp01,
    easeInOutCubic
} from '../utils/helpers.js';

export default class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.chapters = [];

        this.transitionPoints = null;
        this.transitionGeometry = null;
        this.transitionMaterial = null;
        this.transitionData = [];
        this.transitionCount = 0;

        this.fromPosition = new THREE.Vector3();
        this.toPosition = new THREE.Vector3();
        this.tempColor = new THREE.Color();

        this.activeChapter = null;
        this.onChapterChange = null;

        this.transitionActive = false;
        this.onTransitionStart = null;

        this.initTransitionField();
    }

    randomUnitVector() {
        const vector = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );

        if (vector.lengthSq() < 0.001) {
            vector.set(1, 0, 0);
        }

        return vector.normalize();
    }

    initTransitionField() {
        const isMobile = this.engine.device.isMobile;

        this.transitionCount = isMobile ? 260 : 760;

        const positions = new Float32Array(this.transitionCount * 3);
        const colors = new Float32Array(this.transitionCount * 3);

        this.transitionData = [];

        for (let i = 0; i < this.transitionCount; i++) {
            this.transitionData.push({
                source: this.randomUnitVector(),
                target: this.randomUnitVector(),
                delay: Math.random() * 0.35,
                radiusScale: 0.35 + Math.random() * 0.9,
                swirl: Math.random() * Math.PI * 2,
                swirlSpeed: 0.6 + Math.random() * 1.6,
                colorJitter: Math.random() * 0.25
            });
        }

        this.transitionGeometry = new THREE.BufferGeometry();

        const positionAttribute = new THREE.BufferAttribute(positions, 3);
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        const colorAttribute = new THREE.BufferAttribute(colors, 3);
        colorAttribute.setUsage(THREE.DynamicDrawUsage);

        this.transitionGeometry.setAttribute('position', positionAttribute);
        this.transitionGeometry.setAttribute('color', colorAttribute);

        this.transitionMaterial = new THREE.PointsMaterial({
            size: isMobile ? 0.07 : 0.09,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.transitionPoints = new THREE.Points(
            this.transitionGeometry,
            this.transitionMaterial
        );

        this.transitionPoints.visible = false;
        this.transitionPoints.frustumCulled = false;

        this.engine.scene.add(this.transitionPoints);
    }

    addWorld(
        worldInstance,
        start,
        end,
        transitionColor = 0x00e5ff,
        transitionRadius = 10,
        label = ''
    ) {
        this.chapters.push({
            world: worldInstance,
            start,
            end,
            color: new THREE.Color(transitionColor),
            radius: transitionRadius,
            label: label || worldInstance.constructor.name || 'World',
            initialized: false,
            inRange: false
        });
    }

    initWorlds() {
        this.chapters.forEach((chapter) => {
            chapter.world.init();
            chapter.initialized = true;
        });
    }

    getWorldPosition(chapter, target) {
        if (chapter.world && chapter.world.group) {
            target.copy(chapter.world.group.position);
        } else {
            target.set(0, 0, 0);
        }

        return target;
    }

    findTransition(progress) {
        for (let i = 0; i < this.chapters.length - 1; i++) {
            const from = this.chapters[i];
            const to = this.chapters[i + 1];

            const overlapStart = Math.max(from.start, to.start);
            const overlapEnd = Math.min(from.end, to.end);

            if (overlapEnd > overlapStart && progress >= overlapStart && progress <= overlapEnd) {
                return {
                    from,
                    to,
                    start: overlapStart,
                    end: overlapEnd,
                    progress: clamp01((progress - overlapStart) / (overlapEnd - overlapStart))
                };
            }
        }

        return null;
    }

    updateTransition(globalProgress) {
        const transition = this.findTransition(globalProgress);

        if (!transition) {
            this.transitionActive = false;
            this.transitionPoints.visible = false;
            this.transitionMaterial.opacity = 0;
            return;
        }

        if (!this.transitionActive) {
            this.transitionActive = true;

            if (this.onTransitionStart) {
                this.onTransitionStart();
            }
        }

        const t = this.engine.time.elapsed;
        const eased = easeInOutCubic(transition.progress);
        const masterAlpha = Math.sin(transition.progress * Math.PI);

        this.transitionMaterial.opacity = masterAlpha * 0.85;
        this.transitionPoints.visible = this.transitionMaterial.opacity > 0.001;

        if (!this.transitionPoints.visible) return;

        const positions = this.transitionGeometry.attributes.position;
        const colors = this.transitionGeometry.attributes.color;

        this.getWorldPosition(transition.from, this.fromPosition);
        this.getWorldPosition(transition.to, this.toPosition);

        for (let i = 0; i < this.transitionCount; i++) {
            const data = this.transitionData[i];

            const particleWindow = Math.max(0.001, 1 - data.delay);
            const particleProgress = clamp01((eased - data.delay) / particleWindow);
            const smooth = easeInOutCubic(particleProgress);

            const pulse = 1 + Math.sin(t * data.swirlSpeed + data.swirl) * 0.08;

            const fromRadius = transition.from.radius * data.radiusScale * pulse;
            const toRadius = transition.to.radius * data.radiusScale * pulse;

            const sx = this.fromPosition.x + data.source.x * fromRadius;
            const sy = this.fromPosition.y + data.source.y * fromRadius;
            const sz = this.fromPosition.z + data.source.z * fromRadius;

            const tx = this.toPosition.x + data.target.x * toRadius;
            const ty = this.toPosition.y + data.target.y * toRadius;
            const tz = this.toPosition.z + data.target.z * toRadius;

            let x = sx + (tx - sx) * smooth;
            let y = sy + (ty - sy) * smooth;
            let z = sz + (tz - sz) * smooth;

            const swirlAmount = Math.sin(smooth * Math.PI) * (0.7 + data.swirlSpeed * 0.4);

            x += Math.cos(t * data.swirlSpeed + data.swirl + smooth * 6.0) * swirlAmount;
            y += Math.sin(t * data.swirlSpeed * 0.85 + data.swirl + smooth * 5.0) * swirlAmount * 0.65;
            z += Math.sin(smooth * Math.PI * 2 + data.swirl) * swirlAmount * 0.4;

            positions.setXYZ(i, x, y, z);

            const colorMix = clamp01(smooth + (data.colorJitter - 0.125));

            this.tempColor.copy(transition.from.color);
            this.tempColor.lerp(transition.to.color, colorMix);

            colors.setXYZ(i, this.tempColor.r, this.tempColor.g, this.tempColor.b);
        }

        positions.needsUpdate = true;
        colors.needsUpdate = true;
    }

    updateWorlds(globalProgress, deltaTime) {
        let bestChapter = null;
        let bestIndex = -1;
        let bestDistance = -Infinity;

        for (let i = 0; i < this.chapters.length; i++) {
            const chapter = this.chapters[i];

            const inRange = globalProgress >= chapter.start && globalProgress <= chapter.end;

            if (inRange && !chapter.inRange) {
                chapter.world.enter();
                chapter.inRange = true;
            }

            if (!inRange && chapter.inRange) {
                chapter.world.exit();
                chapter.inRange = false;
            }

            if (inRange) {
                const localProgress = chapter.end > chapter.start
                    ? (globalProgress - chapter.start) / (chapter.end - chapter.start)
                    : 0;

                chapter.world.update(clamp01(localProgress), deltaTime);

                const distanceToBoundary = Math.min(
                    globalProgress - chapter.start,
                    chapter.end - globalProgress
                );

                if (distanceToBoundary > bestDistance) {
                    bestDistance = distanceToBoundary;
                    bestChapter = chapter;
                    bestIndex = i;
                }
            }
        }

        if (bestChapter && bestChapter !== this.activeChapter) {
            this.activeChapter = bestChapter;

            if (this.onChapterChange) {
                this.onChapterChange(bestChapter.label, bestIndex);
            }
        }

        this.updateTransition(globalProgress);
    }

    disposeTransition() {
        if (!this.transitionPoints) return;

        this.engine.scene.remove(this.transitionPoints);

        if (this.transitionGeometry) {
            this.transitionGeometry.dispose();
        }

        if (this.transitionMaterial) {
            this.transitionMaterial.dispose();
        }

        this.transitionPoints = null;
        this.transitionGeometry = null;
        this.transitionMaterial = null;
        this.transitionData = [];
    }
}