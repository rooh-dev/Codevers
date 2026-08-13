/**
 * CODEVERSE - Chapter 02: Programming
 */
import * as THREE from 'three';
import World from './World.js';
import {
    easeOutCubic,
    easeInOutCubic,
    rangeProgress
} from '../utils/helpers.js';

export default class Programming extends World {
    constructor(engine) {
        super(engine);

        this.cubeGroup = null;
        this.innerGroup = null;
        this.gatewayGroup = null;

        this.faceMeshes = [];
        this.innerWire = null;
        this.dataCore = null;
        this.dataPoints = null;
        this.gatewayRings = [];

        this.faceDefinitions = [
            {
                label: 'LOGIC',
                normal: [0, 0, 1],
                rotation: [0, 0, 0]
            },
            {
                label: 'DATA',
                normal: [1, 0, 0],
                rotation: [0, Math.PI / 2, 0]
            },
            {
                label: 'ALGORITHM',
                normal: [0, 0, -1],
                rotation: [0, Math.PI, 0]
            },
            {
                label: 'SYSTEM',
                normal: [-1, 0, 0],
                rotation: [0, -Math.PI / 2, 0]
            },
            {
                label: '',
                normal: [0, 1, 0],
                rotation: [-Math.PI / 2, 0, 0]
            },
            {
                label: '',
                normal: [0, -1, 0],
                rotation: [Math.PI / 2, 0, 0]
            }
        ];
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -30;

        this.cubeGroup = new THREE.Group();
        this.innerGroup = new THREE.Group();
        this.gatewayGroup = new THREE.Group();

        this.buildFaces();
        this.buildInternalStructure();
        this.buildGateway();

        this.group.add(this.cubeGroup);
        this.group.add(this.gatewayGroup);

        this.scene.add(this.group);
    }

    makeFaceTexture(label) {
        const size = 512;

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, size, size);

        ctx.fillStyle = 'rgba(5, 8, 12, 0.92)';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.10)';
        ctx.lineWidth = 2;

        for (let i = 64; i < size; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
        ctx.lineWidth = 18;
        ctx.strokeRect(24, 24, size - 48, size - 48);

        if (label) {
            const fontSize = label.length > 7 ? 46 : 64;

            ctx.font = `700 ${fontSize}px "Space Grotesk", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 229, 255, 0.75)';
            ctx.shadowBlur = 28;
            ctx.fillStyle = 'rgba(0, 229, 255, 0.95)';
            ctx.fillText(label, size / 2, size / 2);
        } else {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
            ctx.fillRect(size / 2 - 80, size / 2 - 2, 160, 4);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        const maxAnisotropy = this.engine.renderer.capabilities.getMaxAnisotropy();
        texture.anisotropy = Math.min(4, maxAnisotropy);

        return texture;
    }

    buildFaces() {
        const faceGeometry = new THREE.PlaneGeometry(6, 6);

        this.faceDefinitions.forEach((definition, index) => {
            const texture = this.makeFaceTexture(definition.label);

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(faceGeometry, material);

            mesh.position.set(
                definition.normal[0] * 3,
                definition.normal[1] * 3,
                definition.normal[2] * 3
            );

            mesh.rotation.set(
                definition.rotation[0],
                definition.rotation[1],
                definition.rotation[2]
            );

            mesh.userData.normal = new THREE.Vector3(...definition.normal);
            mesh.userData.index = index;

            this.faceMeshes.push(mesh);
            this.cubeGroup.add(mesh);
        });
    }

    buildInternalStructure() {
        const wireGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(5.4, 5.4, 5.4)
        );

        const wireMaterial = new THREE.LineBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.innerWire = new THREE.LineSegments(wireGeometry, wireMaterial);
        this.innerGroup.add(this.innerWire);

        const coreGeometry = new THREE.IcosahedronGeometry(1.1, 2);

        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x7df3ff,
            wireframe: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.dataCore = new THREE.Mesh(coreGeometry, coreMaterial);
        this.innerGroup.add(this.dataCore);

        const quality = this.engine.device.particleScale || 1;
        const count = Math.max(
            1,
            Math.floor((this.engine.device.isMobile ? 120 : 240) * quality)
        );

        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() * 2 - 1) * 2.4;
            positions[i * 3 + 1] = (Math.random() * 2 - 1) * 2.4;
            positions[i * 3 + 2] = (Math.random() * 2 - 1) * 2.4;
        }

        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        const pointsMaterial = new THREE.PointsMaterial({
            color: 0x7df3ff,
            size: 0.06,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.dataPoints = new THREE.Points(pointsGeometry, pointsMaterial);
        this.innerGroup.add(this.dataPoints);

        this.cubeGroup.add(this.innerGroup);
    }

    buildGateway() {
        const ringGeometry = new THREE.TorusGeometry(4.6, 0.06, 12, 160);

        for (let i = 0; i < 2; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0x00e5ff : 0x7df3ff,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const ring = new THREE.Mesh(ringGeometry, material);

            ring.position.z = -2 - i * 1.2;
            ring.scale.setScalar(0.001);

            this.gatewayRings.push(ring);
            this.gatewayGroup.add(ring);
        }
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const t = this.engine.time.elapsed;

        const appear = easeOutCubic(rangeProgress(localProgress, 0.0, 0.12));
        const rotation = easeInOutCubic(rangeProgress(localProgress, 0.10, 0.32));
        const separation = easeInOutCubic(rangeProgress(localProgress, 0.34, 0.55));
        const internal = easeInOutCubic(rangeProgress(localProgress, 0.52, 0.72));
        const disassemble = easeInOutCubic(rangeProgress(localProgress, 0.72, 0.95));
        const gateway = easeInOutCubic(rangeProgress(localProgress, 0.86, 1.0));

        this.group.visible = localProgress > 0.0005 && localProgress <= 1.0;

        if (!this.group.visible) return;

        this.group.scale.setScalar(Math.max(0.001, appear));
        this.group.position.z = -30 - gateway * 8;

        this.cubeGroup.rotation.y = t * 0.04 + rotation * Math.PI * 1.6 + disassemble * 0.6;
        this.cubeGroup.rotation.x = Math.sin(t * 0.1) * 0.03 + rotation * 0.35;

        this.innerGroup.rotation.y = -t * 0.08;

        this.faceMeshes.forEach((face, index) => {
            const offset = 3 + separation * 2.5 + disassemble * 4.5;

            face.position.copy(face.userData.normal).multiplyScalar(offset);

            face.rotation.z = separation * 0.08 * Math.sin(index * 1.7);

            face.material.opacity = appear
                * (0.88 + 0.12 * Math.sin(t * 1.5 + index))
                * (1 - disassemble * 0.85);
        });

        this.innerWire.material.opacity = appear * internal * (1 - disassemble) * 0.4;

        this.dataCore.material.opacity = appear * internal * (1 - disassemble * 0.5) + gateway * 0.35;
        this.dataCore.scale.setScalar(0.6 + internal * 0.7 + gateway * 2.4);
        this.dataCore.rotation.y += deltaTime * (0.2 + internal * 0.6);
        this.dataCore.rotation.x += deltaTime * 0.1;

        this.dataPoints.material.opacity = appear
            * (internal * 0.65 + gateway * 0.35)
            * (1 - disassemble * 0.2);

        this.dataPoints.rotation.y += deltaTime * 0.08;
        this.dataPoints.rotation.x += deltaTime * 0.03;

        this.gatewayRings.forEach((ring, index) => {
            ring.material.opacity = gateway * (0.55 + index * 0.2);
            ring.scale.setScalar(Math.max(0.001, 0.5 + gateway * (1.4 + index * 0.25)));
            ring.rotation.z = t * (0.08 + index * 0.05);
        });
    }
}