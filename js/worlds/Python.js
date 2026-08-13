/**
 * CODEVERSE - Python World: Intelligence
 */
import * as THREE from 'three';
import World from './World.js';

export default class Python extends World {
    constructor(engine) {
        super(engine);

        this.nodePositions = [];
        this.nodes = null;
        this.nodeMaterial = null;

        this.links = null;
        this.linkMaterial = null;

        this.core = null;
        this.coreGlow = null;
        this.dataParticles = null;
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -70;

        this.buildNetwork();

        this.scene.add(this.group);
    }

    buildNetwork() {
        const isMobile = this.engine.device.isMobile;
        const nodeCount = isMobile ? 55 : 110;

        for (let i = 0; i < nodeCount; i++) {
            this.nodePositions.push(
                new THREE.Vector3(
                    (Math.random() * 2 - 1) * 16,
                    (Math.random() * 2 - 1) * 9,
                    (Math.random() * 2 - 1) * 12
                )
            );
        }

        const nodeGeometry = new THREE.IcosahedronGeometry(0.12, 0);

        this.nodeMaterial = this.createAdditiveMaterial(0x4b8bbe, 0);

        this.nodes = this.createInstancedMesh({
            geometry: nodeGeometry,
            material: this.nodeMaterial,
            count: nodeCount,
            transform: (dummy, i) => {
                dummy.position.copy(this.nodePositions[i]);
                dummy.scale.setScalar(0.7 + Math.random() * 1.6);
            }
        });

        const linePoints = [];
        const maxLinks = isMobile ? 120 : 240;

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (linePoints.length / 2 >= maxLinks) break;

                const distance = this.nodePositions[i].distanceTo(this.nodePositions[j]);

                if (distance < 4.8) {
                    linePoints.push(this.nodePositions[i]);
                    linePoints.push(this.nodePositions[j]);
                }
            }
        }

        if (linePoints.length > 0) {
            this.linkMaterial = this.createLineMaterial(0x66aaff, 0);
            this.links = new THREE.LineSegments(
                new THREE.BufferGeometry().setFromPoints(linePoints),
                this.linkMaterial
            );
        }

        this.core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.2, 2),
            this.createAdditiveMaterial(0xffd43b, 0, true)
        );

        this.coreGlow = this.createPoints({
            count: isMobile ? 80 : 140,
            size: 0.06,
            color: 0xffd43b,
            opacity: 0,
            generator: (i, positions) => {
                const radius = 1.6 + Math.random() * 0.9;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);
            }
        });

        this.dataParticles = this.createPoints({
            count: isMobile ? 220 : 520,
            size: 0.045,
            color: 0x9fd3ff,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = (Math.random() * 2 - 1) * 18;
                positions[i * 3 + 1] = (Math.random() * 2 - 1) * 10;
                positions[i * 3 + 2] = (Math.random() * 2 - 1) * 14;
            }
        });

        if (this.links) this.group.add(this.links);

        this.group.add(this.nodes);
        this.group.add(this.core);
        this.group.add(this.coreGlow);
        this.group.add(this.dataParticles);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.group.rotation.y = t * 0.03;

        this.nodeMaterial.opacity = alpha * (0.35 + energy * 0.65);

        if (this.links) {
            this.linkMaterial.opacity = alpha * (0.08 + energy * 0.25);
        }

        this.core.material.opacity = alpha * (0.25 + energy * 0.75);
        this.core.scale.setScalar(1 + energy * 0.5 + Math.sin(t * 2) * 0.04);
        this.core.rotation.y = t * 0.4;

        this.coreGlow.material.opacity = alpha * (0.2 + energy * 0.5);
        this.coreGlow.rotation.y = -t * 0.2;

        this.dataParticles.material.opacity = alpha * (0.15 + energy * 0.35);
        this.dataParticles.rotation.y = t * 0.02;
    }
}