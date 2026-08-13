/**
 * CODEVERSE - Chapter 12: Portfolio Worlds
 */
import * as THREE from 'three';
import World from './World.js';
import {
    easeOutCubic,
    easeInOutCubic,
    rangeProgress
} from '../utils/helpers.js';

export const PROJECT_DATA = [
    {
        id: 'digital-city',
        name: 'RESUME BIULDER',
        category: 'Realtime WebGL Experience',
        description: 'A procedural city built from instanced geometry, dynamic light streams, and scroll-driven camera choreography.',
        tech: ['Three.js', 'WebGL', 'GSAP', 'GLSL'],
        links: {
            demo: 'https://rooh-dev.github.io/Resume/',
            code: 'https://github.com/rooh-dev/Resume'
        },
        color: 0x00e5ff,
        localZ: 90
    },
    {
        id: 'space-system',
        name: 'RESUME BIULDER',
        category: 'Orbital Data Visualization',
        description: 'An orbital system visualizing satellites, telemetry paths, and gravitational motion in realtime.',
        tech: ['Vanilla JS', 'Mathematics', 'Canvas', 'Animation'],
        links: {
            demo: 'https://rooh-dev.github.io/AI-RESUME/',
            code: 'https://github.com/rooh-dev/AI-RESUME'
        },
        color: 0x7df3ff,
        localZ: 20
    },
    {
        id: 'neural-network',
        name: 'NEURAL NETWORK',
        category: 'AI / Machine Learning',
        description: 'A living neural structure with node connections, signal pulses, and emergent visual behavior.',
        tech: ['JavaScript', 'Neural Systems', 'WebGL', 'Procedural Design'],
        links: {
            demo: '#project-neural-network',
            code: '#project-neural-network-source'
        },
        color: 0x4b8bbe,
        localZ: -50
    },
    {
        id: 'interactive-machine',
        name: 'INTERACTIVE MACHINE',
        category: 'Creative Engineering',
        description: 'A kinetic digital machine responding to interaction, timing, and mechanical rhythm.',
        tech: ['Three.js', 'Interaction', 'Animation', 'Creative Coding'],
        links: {
            demo: '#project-interactive-machine',
            code: '#project-interactive-machine-source'
        },
        color: 0xff9f43,
        localZ: -120
    }
];

const PROJECT_SEGMENTS = [
    { start: 0.03, end: 0.30 },
    { start: 0.28, end: 0.55 },
    { start: 0.53, end: 0.80 },
    { start: 0.78, end: 1.00 }
];

export default class Portfolio extends World {
    constructor(engine, interaction = null, ui = null) {
        super(engine);

        this.interaction = interaction;
        this.ui = ui;

        this.projects = [];
        this.selectedProjectId = null;

        this.tempScale = new THREE.Vector3();
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -650;

        PROJECT_DATA.forEach((data, index) => {
            const projectGroup = new THREE.Group();
            projectGroup.position.z = data.localZ;

            const visual = this.buildProjectVisual(data.id, data.color);
            projectGroup.add(visual.group);

            const label = this.makeLabel(data.name);
            label.position.y = 3.2;
            projectGroup.add(label);

            const hitMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                depthWrite: false,
                colorWrite: false
            });

            const hitMesh = new THREE.Mesh(
                new THREE.SphereGeometry(3.6, 12, 12),
                hitMaterial
            );

            if (this.interaction) {
                this.interaction.register(hitMesh, {
                    onClick: () => {
                        this.selectProject(data.id);
                    },
                    onHoverChange: (hovering) => {
                        projectGroup.userData.hovered = hovering;
                    }
                });
            }

            projectGroup.add(hitMesh);

            projectGroup.userData = {
                data,
                visualGroup: visual.group,
                updateVisual: visual.update,
                label,
                hitMesh,
                hovered: false,
                alpha: 0
            };

            this.projects.push(projectGroup);
            this.group.add(projectGroup);
        });

        this.scene.add(this.group);
    }

    makeLabel(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;

        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '700 82px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 229, 255, 0.55)';
        ctx.shadowBlur = 22;
        ctx.fillStyle = 'rgba(240, 240, 240, 0.95)';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Mesh(
            new THREE.PlaneGeometry(4.5, 1.125),
            material
        );
    }

    buildProjectVisual(id, color) {
        switch (id) {
            case 'digital-city':
                return this.buildDigitalCity(color);

            case 'space-system':
                return this.buildSpaceSystem(color);

            case 'neural-network':
                return this.buildNeuralNetwork(color);

            case 'interactive-machine':
                return this.buildInteractiveMachine(color);

            default:
                return this.buildDigitalCity(color);
        }
    }

    buildDigitalCity(color) {
        const group = new THREE.Group();
        const isMobile = this.engine.device.isMobile;

        const grid = this.createGrid(26, 14, color, 0);

        const buildingMaterial = this.createAdditiveMaterial(color, 0, true);

        const buildings = this.createInstancedMesh({
            geometry: new THREE.BoxGeometry(1, 1, 1),
            material: buildingMaterial,
            count: isMobile ? 70 : 140,
            transform: (dummy) => {
                const x = (Math.random() * 2 - 1) * 10;
                const z = (Math.random() * 2 - 1) * 6;
                const height = 0.4 + Math.pow(Math.random(), 2.2) * 4.2;

                dummy.position.set(x, height * 0.5, z);
                dummy.scale.set(
                    0.45 + Math.random() * 0.9,
                    height,
                    0.45 + Math.random() * 0.9
                );
            }
        });

        const data = this.createPoints({
            count: isMobile ? 120 : 260,
            size: 0.05,
            color,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = (Math.random() * 2 - 1) * 11;
                positions[i * 3 + 1] = 0.08;
                positions[i * 3 + 2] = (Math.random() * 2 - 1) * 7;
            }
        });

        group.add(grid);
        group.add(buildings);
        group.add(data);

        const update = (t, alpha, energy, deltaTime) => {
            grid.material.opacity = alpha * 0.15;
            buildingMaterial.opacity = alpha * (0.18 + energy * 0.4);
            data.material.opacity = alpha * (0.15 + energy * 0.4);

            data.rotation.y = t * 0.04;
        };

        return { group, update };
    }

    buildSpaceSystem(color) {
        const group = new THREE.Group();
        const isMobile = this.engine.device.isMobile;

        const coreMaterial = this.createAdditiveMaterial(color, 0, true);

        const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.2, 2),
            coreMaterial
        );

        const rings = [
            this.createRing({ radius: 2.2, tube: 0.018, color, opacity: 0 }),
            this.createRing({ radius: 3.1, tube: 0.014, color, opacity: 0 }),
            this.createRing({ radius: 4.1, tube: 0.01, color, opacity: 0 })
        ];

        const satellites = this.createPoints({
            count: isMobile ? 120 : 260,
            size: 0.05,
            color,
            opacity: 0,
            generator: (i, positions) => {
                const radius = 2 + Math.random() * 2.5;
                const angle = Math.random() * Math.PI * 2;
                const y = (Math.random() * 2 - 1) * 0.8;

                positions[i * 3 + 0] = Math.cos(angle) * radius;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
        });

        group.add(core);
        rings.forEach((ring) => group.add(ring));
        group.add(satellites);

        const update = (t, alpha, energy, deltaTime) => {
            coreMaterial.opacity = alpha * (0.25 + energy * 0.5);
            core.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
            core.rotation.y += deltaTime * 0.2;

            rings.forEach((ring, index) => {
                ring.material.opacity = alpha * (0.1 + energy * 0.25);
                ring.rotation.x = Math.PI / 2 + index * 0.2;
                ring.rotation.z += deltaTime * (0.1 + index * 0.05);
            });

            satellites.material.opacity = alpha * (0.15 + energy * 0.35);
            satellites.rotation.y = t * 0.15;
        };

        return { group, update };
    }

    buildNeuralNetwork(color) {
        const group = new THREE.Group();
        const isMobile = this.engine.device.isMobile;

        const nodeCount = isMobile ? 35 : 65;
        const nodePositions = [];

        for (let i = 0; i < nodeCount; i++) {
            nodePositions.push(
                new THREE.Vector3(
                    (Math.random() * 2 - 1) * 4.5,
                    (Math.random() * 2 - 1) * 2.8,
                    (Math.random() * 2 - 1) * 2.5
                )
            );
        }

        const nodeMaterial = this.createAdditiveMaterial(color, 0);

        const nodes = this.createInstancedMesh({
            geometry: new THREE.IcosahedronGeometry(0.09, 0),
            material: nodeMaterial,
            count: nodeCount,
            transform: (dummy, i) => {
                dummy.position.copy(nodePositions[i]);
                dummy.scale.setScalar(0.7 + Math.random() * 1.4);
            }
        });

        const linePoints = [];
        const maxLinks = isMobile ? 60 : 110;

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (linePoints.length / 2 >= maxLinks) break;

                const distance = nodePositions[i].distanceTo(nodePositions[j]);

                if (distance < 3.2) {
                    linePoints.push(nodePositions[i]);
                    linePoints.push(nodePositions[j]);
                }
            }
        }

        let links = null;
        let linkMaterial = null;

        if (linePoints.length > 0) {
            linkMaterial = this.createLineMaterial(color, 0);

            links = new THREE.LineSegments(
                new THREE.BufferGeometry().setFromPoints(linePoints),
                linkMaterial
            );
        }

        const pulses = this.createPoints({
            count: isMobile ? 100 : 220,
            size: 0.04,
            color,
            opacity: 0,
            generator: (i, positions) => {
                positions[i * 3 + 0] = (Math.random() * 2 - 1) * 5;
                positions[i * 3 + 1] = (Math.random() * 2 - 1) * 3;
                positions[i * 3 + 2] = (Math.random() * 2 - 1) * 3;
            }
        });

        group.add(nodes);

        if (links) {
            group.add(links);
        }

        group.add(pulses);

        const update = (t, alpha, energy) => {
            group.rotation.y = t * 0.08;

            nodeMaterial.opacity = alpha * (0.3 + energy * 0.55);

            if (links) {
                linkMaterial.opacity = alpha * (0.08 + energy * 0.22);
            }

            pulses.material.opacity = alpha * (0.12 + energy * 0.3);
            pulses.rotation.y = -t * 0.05;
        };

        return { group, update };
    }

    buildInteractiveMachine(color) {
        const group = new THREE.Group();

        const coreMaterial = this.createAdditiveMaterial(color, 0, true);

        const core = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 1.6, 1.6),
            coreMaterial
        );

        const ring = this.createRing({
            radius: 2.6,
            tube: 0.02,
            color,
            opacity: 0
        });

        const pistons = [];
        const pistonMaterial = this.createAdditiveMaterial(color, 0);

        for (let i = 0; i < 4; i++) {
            const piston = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 1, 0.28),
                pistonMaterial
            );

            const angle = (i / 4) * Math.PI * 2;

            piston.position.set(
                Math.cos(angle) * 1.7,
                0,
                Math.sin(angle) * 1.7
            );

            pistons.push(piston);
            group.add(piston);
        }

        group.add(core);
        group.add(ring);

        const update = (t, alpha, energy, deltaTime) => {
            coreMaterial.opacity = alpha * (0.25 + energy * 0.55);
            core.rotation.y += deltaTime * 0.4;
            core.rotation.x += deltaTime * 0.12;

            ring.material.opacity = alpha * (0.1 + energy * 0.25);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z += deltaTime * 0.3;

            pistonMaterial.opacity = alpha * (0.2 + energy * 0.45);

            pistons.forEach((piston, index) => {
                piston.position.y = Math.sin(t * 2 + index) * 0.55;
                piston.rotation.y += deltaTime * 0.15;
            });
        };

        return { group, update };
    }

    selectProject(projectId) {
        this.selectedProjectId = projectId;

        if (this.ui) {
            this.ui.showPortfolioPanel(projectId);
        }
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const active = localProgress >= 0 && localProgress <= 1;

        this.group.visible = active;

        if (this.interaction) {
            this.interaction.setEnabled(
                active && localProgress > 0.03 && localProgress < 0.97
            );
        }

        if (!active) return;

        const t = this.engine.time.elapsed;

        this.projects.forEach((project, index) => {
            const segment = PROJECT_SEGMENTS[index];
            const meta = project.userData;

            const appear = easeOutCubic(
                rangeProgress(localProgress, segment.start, segment.start + 0.07)
            );

            const vanish = easeInOutCubic(
                rangeProgress(localProgress, segment.end - 0.06, segment.end)
            );

            const alpha = appear * (1 - vanish);

            const energy = easeInOutCubic(
                rangeProgress(localProgress, segment.start + 0.05, segment.end - 0.08)
            );

            project.visible = alpha > 0.001;
            meta.alpha = alpha;

            meta.hitMesh.visible = alpha > 0.05 && this.interaction && this.interaction.enabled;

            const hoverScale = meta.hovered ? 1.08 : 1.0;
            const selectedScale = this.selectedProjectId === meta.data.id ? 1.05 : 1.0;

            this.tempScale.setScalar(
                Math.max(0.001, appear * hoverScale * selectedScale)
            );

            project.scale.lerp(this.tempScale, 0.16);

            meta.updateVisual(t, alpha, energy, deltaTime);

            meta.label.material.opacity = alpha * (0.25 + energy * 0.45);
            meta.label.quaternion.copy(this.engine.camera.instance.quaternion);
            meta.label.position.y = 3.1 + Math.sin(t * 0.5 + index) * 0.1;
        });

        if (this.selectedProjectId && this.ui) {
            const selected = this.projects.find(
                (project) => project.userData.data.id === this.selectedProjectId
            );

            if (!selected || selected.userData.alpha < 0.08) {
                this.ui.hidePortfolioPanel();
                this.selectedProjectId = null;
            }
        }
    }

    exit() {
        super.exit();

        if (this.interaction) {
            this.interaction.setEnabled(false);
        }

        if (this.ui) {
            this.ui.hidePortfolioPanel();
        }

        this.selectedProjectId = null;
    }

    dispose() {
        if (this.interaction) {
            this.interaction.clear();
        }

        super.dispose();
    }
}