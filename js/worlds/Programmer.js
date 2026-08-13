/**
 * CODEVERSE - Chapter 11: The Programmer
 */
import * as THREE from 'three';
import World from './World.js';
import {
    easeInOutCubic,
    rangeProgress
} from '../utils/helpers.js';

export default class Programmer extends World {
    constructor(engine) {
        super(engine);

        this.bodyGroup = null;
        this.bodyLines = null;
        this.bodyLineMaterial = null;
        this.bodyPoints = null;
        this.bodyPointMaterial = null;

        this.head = null;
        this.headMaterial = null;

        this.concepts = [];
        this.platformRings = [];
        this.aura = null;
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -460;

        this.buildBody();
        this.buildConcepts();
        this.buildPlatform();
        this.buildAura();

        this.scene.add(this.group);
    }

    makeTextTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;

        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '700 92px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 229, 255, 0.65)';
        ctx.shadowBlur = 26;
        ctx.fillStyle = 'rgba(240, 240, 240, 0.95)';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        return texture;
    }

    buildBody() {
        const joints = {
            head: new THREE.Vector3(0, 2.35, 0),
            neck: new THREE.Vector3(0, 1.85, 0),
            chest: new THREE.Vector3(0, 1.25, 0),
            hips: new THREE.Vector3(0, 0.35, 0),

            shoulderL: new THREE.Vector3(-0.75, 1.65, 0),
            shoulderR: new THREE.Vector3(0.75, 1.65, 0),

            elbowL: new THREE.Vector3(-1.05, 0.95, 0.1),
            elbowR: new THREE.Vector3(1.05, 0.95, 0.1),

            handL: new THREE.Vector3(-1.25, 0.35, 0.2),
            handR: new THREE.Vector3(1.25, 0.35, 0.2),

            kneeL: new THREE.Vector3(-0.35, -0.75, 0),
            kneeR: new THREE.Vector3(0.35, -0.75, 0),

            footL: new THREE.Vector3(-0.42, -1.85, 0.1),
            footR: new THREE.Vector3(0.42, -1.85, 0.1)
        };

        const bones = [
            ['head', 'neck'],
            ['neck', 'chest'],
            ['chest', 'hips'],

            ['neck', 'shoulderL'],
            ['neck', 'shoulderR'],

            ['shoulderL', 'elbowL'],
            ['shoulderR', 'elbowR'],

            ['elbowL', 'handL'],
            ['elbowR', 'handR'],

            ['hips', 'kneeL'],
            ['hips', 'kneeR'],

            ['kneeL', 'footL'],
            ['kneeR', 'footR']
        ];

        const linePoints = [];

        bones.forEach(([a, b]) => {
            linePoints.push(joints[a]);
            linePoints.push(joints[b]);
        });

        this.bodyLineMaterial = this.createLineMaterial(0x9df6ff, 0);

        this.bodyLines = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(linePoints),
            this.bodyLineMaterial
        );

        const pointVectors = [];

        bones.forEach(([a, b]) => {
            const start = joints[a];
            const end = joints[b];
            const segments = 6;

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;

                const point = new THREE.Vector3().lerpVectors(start, end, t);

                point.add(
                    new THREE.Vector3(
                        (Math.random() * 2 - 1) * 0.08,
                        (Math.random() * 2 - 1) * 0.08,
                        (Math.random() * 2 - 1) * 0.08
                    )
                );

                pointVectors.push(point);
            }
        });

        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setFromPoints(pointVectors);

        this.bodyPointMaterial = new THREE.PointsMaterial({
            color: 0x8ef0ff,
            size: 0.045,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.bodyPoints = new THREE.Points(pointsGeometry, this.bodyPointMaterial);

        this.headMaterial = this.createAdditiveMaterial(0x00e5ff, 0, true);

        this.head = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.32, 1),
            this.headMaterial
        );

        this.head.position.copy(joints.head);

        this.bodyGroup = new THREE.Group();

        this.bodyGroup.add(this.bodyLines);
        this.bodyGroup.add(this.bodyPoints);
        this.bodyGroup.add(this.head);

        this.group.add(this.bodyGroup);
    }

    buildConcepts() {
        const labels = [
            'CODE',
            'DESIGN',
            'SYSTEMS',
            'CREATIVITY'
        ];

        labels.forEach((label, index) => {
            const texture = this.makeTextTexture(label);

            const planeMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(2.6, 0.65),
                planeMaterial
            );

            const nodeMaterial = this.createAdditiveMaterial(0x00e5ff, 0);

            const node = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.07, 0),
                nodeMaterial
            );

            node.position.y = -0.45;

            const concept = new THREE.Group();

            concept.add(plane);
            concept.add(node);

            concept.userData = {
                angle: index * Math.PI * 0.5,
                radius: 4.8,
                baseY: 0.7 + (index % 2) * 1.1,
                speed: 0.10 + index * 0.02,
                plane,
                node
            };

            this.concepts.push(concept);
            this.group.add(concept);
        });
    }

    buildPlatform() {
        const radii = [2.6, 4.2, 5.8];

        radii.forEach((radius, index) => {
            const ring = this.createRing({
                radius,
                tube: 0.015,
                color: 0x00e5ff,
                opacity: 0
            });

            ring.rotation.x = Math.PI / 2;
            ring.position.y = -2.1;

            this.platformRings.push(ring);
            this.group.add(ring);
        });
    }

    buildAura() {
        const isMobile = this.engine.device.isMobile;

        this.aura = this.createPoints({
            count: isMobile ? 220 : 480,
            size: 0.05,
            color: 0x9df6ff,
            opacity: 0,
            generator: (i, positions) => {
                const radius = 2 + Math.random() * 4.5;
                const angle = Math.random() * Math.PI * 2;

                positions[i * 3 + 0] = Math.cos(angle) * radius;
                positions[i * 3 + 1] = -2 + Math.random() * 5.5;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
        });

        this.group.add(this.aura);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy, appear } = this.getReveal(localProgress);
        const converge = easeInOutCubic(rangeProgress(localProgress, 0.82, 1.0));

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        const breathe = 1 + Math.sin(t * 1.1) * 0.015;

        this.bodyGroup.scale.setScalar(
            Math.max(0.001, appear * breathe * (1 - converge * 0.15))
        );

        this.bodyGroup.position.y = Math.sin(t * 0.45) * 0.08;
        this.bodyGroup.rotation.y = Math.sin(t * 0.15) * 0.08 + localProgress * 0.25;

        this.bodyLineMaterial.opacity = alpha * (0.18 + energy * 0.5);
        this.bodyPointMaterial.opacity = alpha * (0.25 + energy * 0.55);

        this.headMaterial.opacity = alpha * (0.3 + energy * 0.6);
        this.head.rotation.y = Math.sin(t * 0.5) * 0.25;
        this.head.rotation.x = Math.sin(t * 0.35) * 0.1;

        this.concepts.forEach((concept, index) => {
            const data = concept.userData;

            const angle = t * data.speed + data.angle + localProgress * 2.0;
            const radius = data.radius * (1 - converge);

            concept.position.set(
                Math.cos(angle) * radius,
                data.baseY + Math.sin(t * 0.4 + index) * 0.25,
                Math.sin(angle) * radius
            );

            data.plane.quaternion.copy(this.engine.camera.instance.quaternion);

            data.plane.material.opacity = alpha
                * (0.2 + energy * 0.55)
                * (1 - converge);

            data.node.material.opacity = alpha
                * (0.3 + energy * 0.5)
                * (1 - converge);

            data.node.rotation.y += deltaTime * 0.5;
        });

        this.platformRings.forEach((ring, index) => {
            ring.material.opacity = alpha
                * (0.05 + energy * 0.12)
                * (1 - converge);

            ring.rotation.z += deltaTime * (0.04 + index * 0.02);

            ring.scale.setScalar(
                Math.max(0.001, appear * (1 - converge * 0.4))
            );
        });

        this.aura.material.opacity = alpha
            * (0.12 + energy * 0.25)
            * (1 - converge * 0.5);

        this.aura.rotation.y = t * 0.03;
    }
}