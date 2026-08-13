/**
 * CODEVERSE - PHP World: The Infrastructure
 */
import * as THREE from 'three';
import World from './World.js';

export default class PHP extends World {
    constructor(engine) {
        super(engine);

        this.rackMaterial = null;
        this.coreMaterial = null;
        this.core = null;

        this.requestCurve = null;
        this.responseCurve = null;

        this.requestPoints = null;
        this.responsePoints = null;

        this.requestOffsets = [];
        this.responseOffsets = [];

        this.tempVector = new THREE.Vector3();
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -310;

        this.buildInfrastructure();

        this.scene.add(this.group);
    }

    buildInfrastructure() {
        const isMobile = this.engine.device.isMobile;
        const rackCount = isMobile ? 60 : 120;
        const streamCount = isMobile ? 40 : 80;

        this.rackMaterial = this.createAdditiveMaterial(0x777bb4, 0, true);

        const racks = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(1.2, 2.4, 0.7),
            material: this.rackMaterial,
            count: rackCount,
            transform: (dummy, i) => {
                const columns = 10;
                const row = Math.floor(i / columns);
                const col = i % columns;

                dummy.position.set(
                    (col - columns / 2 + 0.5) * 1.9,
                    1.2,
                    (row - 3) * 2.3
                );

                dummy.rotation.y = Math.random() * 0.05;
            }
        });

        this.coreMaterial = this.createAdditiveMaterial(0xa3a9d8, 0, true);

        this.core = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 3.2, 3.2),
            this.coreMaterial
        );

        this.core.position.y = 2;

        this.requestCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-11, 0.5, 12),
            new THREE.Vector3(-4, 2.2, 5),
            new THREE.Vector3(0, 1.8, 0)
        ]);

        this.responseCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.8, 0),
            new THREE.Vector3(4, 2.2, -5),
            new THREE.Vector3(11, 0.5, -12)
        ]);

        for (let i = 0; i < streamCount; i++) {
            this.requestOffsets.push(Math.random());
            this.responseOffsets.push(Math.random());
        }

        this.requestPoints = this.createPoints({
            count: streamCount,
            size: 0.08,
            color: 0x777bb4,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = 0;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = 0;
            }
        });

        this.responsePoints = this.createPoints({
            count: streamCount,
            size: 0.08,
            color: 0xdfe4ff,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = 0;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = 0;
            }
        });

        this.requestPoints.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        this.responsePoints.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

        this.group.add(racks);
        this.group.add(this.core);
        this.group.add(this.requestPoints);
        this.group.add(this.responsePoints);
    }

    updateStream(points, curve, offsets, speed, time) {
        const positions = points.geometry.attributes.position;

        for (let i = 0; i < offsets.length; i++) {
            const p = (time * speed + offsets[i]) % 1;

            curve.getPoint(p, this.tempVector);

            positions.setXYZ(i, this.tempVector.x, this.tempVector.y, this.tempVector.z);
        }

        positions.needsUpdate = true;
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.rackMaterial.opacity = alpha * (0.14 + energy * 0.45);
        this.coreMaterial.opacity = alpha * (0.2 + energy * 0.65);

        this.core.rotation.y = t * 0.15;
        this.core.scale.setScalar(1 + Math.sin(t * 2) * 0.03 + energy * 0.12);

        this.requestPoints.material.opacity = alpha * (0.25 + energy * 0.65);
        this.responsePoints.material.opacity = alpha * (0.2 + energy * 0.55);

        this.updateStream(this.requestPoints, this.requestCurve, this.requestOffsets, 0.12 + energy * 0.1, t);
        this.updateStream(this.responsePoints, this.responseCurve, this.responseOffsets, 0.11 + energy * 0.09, t);
    }
}