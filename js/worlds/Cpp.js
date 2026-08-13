/**
 * CODEVERSE - C++ World: The Machine
 */
import * as THREE from 'three';
import World from './World.js';

export default class Cpp extends World {
    constructor(engine) {
        super(engine);

        this.grid = null;
        this.shell = null;
        this.core = null;
        this.cores = null;
        this.coreMaterial = null;
        this.shellMaterial = null;
        this.coreCenterMaterial = null;
        this.rings = [];
        this.dataParticles = null;
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -150;

        this.buildMachine();

        this.scene.add(this.group);
    }

    buildMachine() {
        const isMobile = this.engine.device.isMobile;
        const gridSize = isMobile ? 6 : 8;
        const coreCount = gridSize * gridSize;

        this.grid = this.createGrid(70, 28, 0x00599c, 0);

        this.shellMaterial = this.createAdditiveMaterial(0x9ba4b5, 0, true);
        this.shell = new THREE.Mesh(
            new THREE.BoxGeometry(6, 6, 6),
            this.shellMaterial
        );

        this.coreCenterMaterial = this.createAdditiveMaterial(0x00599c, 0, true);
        this.core = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 4),
            this.coreCenterMaterial
        );

        this.coreMaterial = this.createAdditiveMaterial(0xff9f43, 0);

        this.cores = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(0.45, 0.45, 0.45),
            material: this.coreMaterial,
            count: coreCount,
            transform: (dummy, i) => {
                const x = ((i % gridSize) - (gridSize - 1) / 2) * 1.25;
                const z = (Math.floor(i / gridSize) - (gridSize - 1) / 2) * 1.25;

                dummy.position.set(x, 0, z);
                dummy.scale.setScalar(0.8 + 0.2 * Math.sin(i * 0.7));
            }
        });

        this.rings = [
            this.createRing({ radius: 5.2, tube: 0.03, color: 0x00599c, opacity: 0 }),
            this.createRing({ radius: 6.5, tube: 0.02, color: 0xff9f43, opacity: 0 }),
            this.createRing({ radius: 7.8, tube: 0.015, color: 0x9ba4b5, opacity: 0 })
        ];

        this.dataParticles = this.createPoints({
            count: isMobile ? 220 : 480,
            size: 0.045,
            color: 0xffc38a,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = (Math.random() * 2 - 1) * 16;
                positions[i * 3 + 1] = (Math.random() * 2 - 1) * 8;
                positions[i * 3 + 2] = (Math.random() * 2 - 1) * 16;
            }
        });

        this.group.add(this.grid);
        this.group.add(this.shell);
        this.group.add(this.core);
        this.group.add(this.cores);
        this.rings.forEach((ring) => this.group.add(ring));
        this.group.add(this.dataParticles);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.grid.material.opacity = alpha * 0.16;

        this.shellMaterial.opacity = alpha * (0.12 + energy * 0.28);
        this.shell.rotation.y = t * 0.1;
        this.shell.rotation.x = Math.sin(t * 0.2) * 0.08;

        this.coreCenterMaterial.opacity = alpha * (0.2 + energy * 0.65);
        this.core.rotation.y = -t * 0.2;
        this.core.rotation.z = Math.sin(t * 0.3) * 0.1;

        this.coreMaterial.opacity = alpha * (0.18 + energy * 0.7);
        this.cores.rotation.y = t * 0.05;

        this.rings.forEach((ring, index) => {
            ring.material.opacity = alpha * (0.08 + energy * 0.22);
            ring.rotation.x = Math.PI / 2 + index * 0.22;
            ring.rotation.y += deltaTime * (0.12 + index * 0.08);
        });

        this.dataParticles.material.opacity = alpha * (0.14 + energy * 0.4);
        this.dataParticles.rotation.y = -t * 0.03;
    }
}