/**
 * CODEVERSE - Rust World: The Fortress
 */
import * as THREE from 'three';
import World from './World.js';

export default class Rust extends World {
    constructor(engine) {
        super(engine);

        this.wallMaterial = null;
        this.memoryMaterial = null;
        this.rings = [];
        this.flow = null;
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -270;

        this.buildFortress();

        this.scene.add(this.group);
    }

    buildFortress() {
        const isMobile = this.engine.device.isMobile;
        const wallCount = isMobile ? 48 : 84;
        const memoryCount = isMobile ? 22 : 36;

        this.wallMaterial = this.createAdditiveMaterial(0xb7410e, 0);

        const walls = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(1.2, 3.6, 0.4),
            material: this.wallMaterial,
            count: wallCount,
            transform: (dummy, i) => {
                const angle = (i / wallCount) * Math.PI * 2;
                const radius = 10;

                dummy.position.set(
                    Math.cos(angle) * radius,
                    1.8,
                    Math.sin(angle) * radius
                );

                dummy.rotation.set(0, -angle, 0);
                dummy.scale.set(1, 0.9 + Math.sin(i * 0.7) * 0.15, 1);
            }
        });

        this.memoryMaterial = this.createAdditiveMaterial(0xff8c5a, 0);

        const memoryBlocks = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(0.55, 0.55, 0.55),
            material: this.memoryMaterial,
            count: memoryCount,
            transform: (dummy, i) => {
                const angle = (i / memoryCount) * Math.PI * 2;
                const radius = 5;

                dummy.position.set(
                    Math.cos(angle) * radius,
                    0.6 + Math.sin(i * 1.3) * 0.25,
                    Math.sin(angle) * radius
                );

                dummy.rotation.set(
                    Math.random() * 0.3,
                    angle,
                    Math.random() * 0.3
                );

                dummy.scale.setScalar(0.8 + Math.random() * 0.6);
            }
        });

        this.rings = [
            this.createRing({ radius: 5.8, tube: 0.025, color: 0xff8c5a, opacity: 0 }),
            this.createRing({ radius: 8.2, tube: 0.02, color: 0xb7410e, opacity: 0 }),
            this.createRing({ radius: 10.6, tube: 0.016, color: 0x7dffcc, opacity: 0 })
        ];

        this.flow = this.createPoints({
            count: isMobile ? 140 : 300,
            size: 0.045,
            color: 0xffd9c2,
            opacity: 0,
            generator: (i, positions) => {
                const angle = Math.random() * Math.PI * 2;
                const radius = 6.5 + Math.random() * 3;

                positions[i * 3 + 0] = Math.cos(angle) * radius;
                positions[i * 3 + 1] = 0.4 + Math.random() * 2;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
        });

        this.group.add(walls);
        this.group.add(memoryBlocks);
        this.rings.forEach((ring) => this.group.add(ring));
        this.group.add(this.flow);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.wallMaterial.opacity = alpha * (0.16 + energy * 0.5);
        this.memoryMaterial.opacity = alpha * (0.2 + energy * 0.6 + Math.sin(t * 2) * 0.05);

        this.rings.forEach((ring, index) => {
            ring.material.opacity = alpha * (0.06 + energy * 0.2);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z += deltaTime * (index % 2 === 0 ? 0.08 : -0.06);
        });

        this.flow.material.opacity = alpha * (0.12 + energy * 0.35);
        this.flow.rotation.y = t * 0.12;
    }
}