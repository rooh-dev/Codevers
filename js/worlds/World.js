/**
 * CODEVERSE - Base World Class
 */
import * as THREE from 'three';
import {
    easeOutCubic,
    easeInOutCubic,
    easeOutExpo,
    rangeProgress
} from '../utils/helpers.js';

export default class World {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.group = null;
        this.isActive = false;

        this.transitionColor = new THREE.Color(0x00e5ff);
        this.transitionRadius = 10;
    }

    init() {
        // Override in child classes.
    }

    enter() {
        this.isActive = true;

        if (this.group) {
            this.group.visible = true;
        }
    }

    update(localProgress, deltaTime) {
        // Override in child classes.
    }

    exit() {
        this.isActive = false;

        if (this.group) {
            this.group.visible = false;
        }
    }

    getReveal(localProgress) {
        const appear = easeOutExpo(rangeProgress(localProgress, 0.0, 0.16));
        const energy = easeInOutCubic(rangeProgress(localProgress, 0.18, 0.82));
        const vanish = easeInOutCubic(rangeProgress(localProgress, 0.84, 1.0));
        const alpha = appear * (1 - vanish);

        return {
            appear,
            energy,
            vanish,
            alpha
        };
    }

    createAdditiveMaterial(color, opacity = 1, wireframe = false) {
        return new THREE.MeshBasicMaterial({
            color,
            wireframe,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }

    createLineMaterial(color, opacity = 1) {
        return new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }

    createPoints({
        count = 100,
        size = 0.06,
        color = 0xffffff,
        opacity = 1,
        generator = null
    }) {
        const positions = new Float32Array(count * 3);

        if (generator) {
            for (let i = 0; i < count; i++) {
                generator(i, positions);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color,
            size,
            sizeAttenuation: true,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Points(geometry, material);
    }

    createInstancedMesh({
        geometry = null,
        material = null,
        count = 1,
        transform = null
    }) {
        const finalGeometry = geometry || new THREE.BoxGeometry(1, 1, 1);
        const finalMaterial = material || this.createAdditiveMaterial(0xffffff, 1);

        const mesh = new THREE.InstancedMesh(finalGeometry, finalMaterial, count);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            if (transform) {
                transform(dummy, i);
            }

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;

        return mesh;
    }

    createRing({
        radius = 1,
        tube = 0.02,
        color = 0xffffff,
        opacity = 1
    }) {
        const geometry = new THREE.TorusGeometry(radius, tube, 12, 160);
        const material = this.createAdditiveMaterial(color, opacity);

        return new THREE.Mesh(geometry, material);
    }

    createGrid(size = 50, divisions = 20, color = 0xffffff, opacity = 1) {
        const grid = new THREE.GridHelper(size, divisions, color, color);

        grid.material.transparent = true;
        grid.material.opacity = opacity;
        grid.material.blending = THREE.AdditiveBlending;
        grid.material.depthWrite = false;

        return grid;
    }

    createLineSegments(points, color, opacity = 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = this.createLineMaterial(color, opacity);

        return new THREE.LineSegments(geometry, material);
    }

    disposeMaterial(material) {
        if (!material) return;

        if (material.uniforms) {
            Object.values(material.uniforms).forEach((uniform) => {
                if (uniform.value && uniform.value.isTexture) {
                    uniform.value.dispose();
                }
            });
        }

        Object.keys(material).forEach((key) => {
            const value = material[key];

            if (value && typeof value.dispose === 'function') {
                value.dispose();
            }
        });

        material.dispose();
    }

    dispose() {
        if (!this.group) return;

        this.group.traverse((child) => {
            if (child.isMesh || child.isPoints || child.isLine || child.isInstancedMesh) {
                if (child.geometry) {
                    child.geometry.dispose();
                }

                if (Array.isArray(child.material)) {
                    child.material.forEach((material) => this.disposeMaterial(material));
                } else {
                    this.disposeMaterial(child.material);
                }
            }
        });

        this.scene.remove(this.group);
        this.group = null;
    }
}