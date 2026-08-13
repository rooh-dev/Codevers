/**
 * CODEVERSE - Java World: The Empire
 */
import * as THREE from 'three';
import World from './World.js';

export default class Java extends World {
    constructor(engine) {
        super(engine);

        this.towerPositions = [];
        this.towers = null;
        this.towerMaterial = null;
        this.database = null;
        this.databaseMaterial = null;
        this.connections = null;
        this.connectionMaterial = null;
        this.cloudRings = [];
        this.dataParticles = null;
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -190;

        this.buildEmpire();

        this.scene.add(this.group);
    }

    buildEmpire() {
        const isMobile = this.engine.device.isMobile;
        const towerCount = isMobile ? 70 : 160;

        for (let i = 0; i < towerCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 6 + Math.random() * 15;
            const height = 2 + Math.pow(Math.random(), 2) * 11;

            this.towerPositions.push({
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    height * 0.5,
                    Math.sin(angle) * radius
                ),
                height
            });
        }

        this.towerMaterial = this.createAdditiveMaterial(0xe76f51, 0, true);

        this.towers = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(1, 1, 1),
            material: this.towerMaterial,
            count: towerCount,
            transform: (dummy, i) => {
                const tower = this.towerPositions[i];

                dummy.position.copy(tower.position);
                dummy.scale.set(
                    0.8 + Math.random() * 1.2,
                    tower.height,
                    0.8 + Math.random() * 1.2
                );
                dummy.rotation.y = Math.random() * Math.PI;
            }
        });

        this.databaseMaterial = this.createAdditiveMaterial(0x5382a1, 0, true);

        this.database = new THREE.Mesh(
            new THREE.CylinderGeometry(2.6, 2.6, 9, 24, 1, true),
            this.databaseMaterial
        );

        const linePoints = [];
        const maxConnections = isMobile ? 45 : 85;
        const centerTop = new THREE.Vector3(0, 6, 0);

        for (let i = 0; i < Math.min(towerCount, maxConnections); i++) {
            const tower = this.towerPositions[i];

            linePoints.push(new THREE.Vector3(
                tower.position.x,
                tower.height,
                tower.position.z
            ));

            linePoints.push(centerTop.clone());
        }

        this.connectionMaterial = this.createLineMaterial(0x8fb8d8, 0);
        this.connections = this.createLineSegments(linePoints, 0x8fb8d8, 0);
        this.connections.material = this.connectionMaterial;

        this.cloudRings = [
            this.createRing({ radius: 7, tube: 0.02, color: 0x5382a1, opacity: 0 }),
            this.createRing({ radius: 9.5, tube: 0.018, color: 0xe76f51, opacity: 0 })
        ];

        this.dataParticles = this.createPoints({
            count: isMobile ? 200 : 460,
            size: 0.05,
            color: 0xd8ecff,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = (Math.random() * 2 - 1) * 22;
                positions[i * 3 + 1] = Math.random() * 10;
                positions[i * 3 + 2] = (Math.random() * 2 - 1) * 22;
            }
        });

        this.group.add(this.towers);
        this.group.add(this.database);
        this.group.add(this.connections);
        this.cloudRings.forEach((ring) => this.group.add(ring));
        this.group.add(this.dataParticles);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.group.rotation.y = t * 0.02;

        this.towerMaterial.opacity = alpha * (0.14 + energy * 0.46);
        this.databaseMaterial.opacity = alpha * (0.2 + energy * 0.65);
        this.connectionMaterial.opacity = alpha * (0.06 + energy * 0.22);

        this.database.rotation.y = t * 0.08;

        this.cloudRings.forEach((ring, index) => {
            ring.material.opacity = alpha * (0.06 + energy * 0.18);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z += deltaTime * (0.05 + index * 0.04);
        });

        this.dataParticles.material.opacity = alpha * (0.12 + energy * 0.34);
        this.dataParticles.rotation.y = t * 0.015;
    }
}