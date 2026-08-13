/**
 * CODEVERSE - JavaScript World: The Web
 */
import * as THREE from 'three';
import World from './World.js';

export default class JavaScript extends World {
    constructor(engine) {
        super(engine);

        this.cityGroup = null;
        this.buildings = null;
        this.buildingMaterial = null;
        this.grid = null;
        this.dataStreams = null;
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -110;

        this.cityGroup = new THREE.Group();

        this.buildCity();

        this.group.add(this.cityGroup);
        this.scene.add(this.group);
    }

    buildCity() {
        const isMobile = this.engine.device.isMobile;
        const buildingCount = isMobile ? 180 : 460;

        this.buildingMaterial = this.createAdditiveMaterial(0xf7df1e, 0, true);

        this.buildings = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(1, 1, 1),
            material: this.buildingMaterial,
            count: buildingCount,
            transform: (dummy) => {
                const x = (Math.random() * 2 - 1) * 24;
                const z = (Math.random() * 2 - 1) * 18;
                const height = 0.5 + Math.pow(Math.random(), 2.2) * 8;

                dummy.position.set(x, height * 0.5, z);
                dummy.scale.set(
                    0.5 + Math.random() * 1.3,
                    height,
                    0.5 + Math.random() * 1.3
                );
                dummy.rotation.y = Math.random() * Math.PI * 0.25;
            }
        });

        this.grid = this.createGrid(75, 30, 0xf7df1e, 0);
        this.grid.position.y = 0;

        this.dataStreams = this.createPoints({
            count: isMobile ? 220 : 520,
            size: 0.05,
            color: 0xfff2a8,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = (Math.random() * 2 - 1) * 26;
                positions[i * 3 + 1] = Math.random() * 0.4;
                positions[i * 3 + 2] = (Math.random() * 2 - 1) * 20;
            }
        });

        this.cityGroup.add(this.grid);
        this.cityGroup.add(this.buildings);
        this.cityGroup.add(this.dataStreams);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy, appear } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.group.rotation.y = t * 0.01 + energy * 0.04;

        this.cityGroup.scale.y = Math.max(0.001, appear);

        this.grid.material.opacity = alpha * 0.18;
        this.buildingMaterial.opacity = alpha * (0.15 + energy * 0.5);
        this.dataStreams.material.opacity = alpha * (0.2 + energy * 0.6);

        this.dataStreams.rotation.y = t * 0.02;
    }
}