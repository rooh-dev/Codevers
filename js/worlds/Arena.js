/**
 * CODEVERSE - Chapter 10: The Language Arena
 */
import * as THREE from 'three';
import World from './World.js';
import {
    easeInOutCubic,
    rangeProgress
} from '../utils/helpers.js';

export const LANGUAGE_DATA = [
    {
        id: 'python',
        name: 'Python',
        role: 'Intelligence',
        color: 0x4b8bbe,
        description: 'A readable, versatile language for AI, data, automation, and rapid development.',
        topics: ['AI', 'Data Science', 'Automation', 'Backend', 'Machine Learning']
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        role: 'The Web',
        color: 0xf7df1e,
        description: 'The behavior layer of the web, powering interfaces, servers, and interactive systems.',
        topics: ['Frontend', 'Backend', 'Web Apps', 'Interactive UI', 'Full Stack']
    },
    {
        id: 'cpp',
        name: 'C++',
        role: 'The Machine',
        color: 0x00599c,
        description: 'High-performance control close to hardware, engines, systems, and graphics.',
        topics: ['Game Engines', 'Operating Systems', 'Performance', 'Embedded', 'Graphics']
    },
    {
        id: 'java',
        name: 'Java',
        role: 'The Empire',
        color: 0xe76f51,
        description: 'Large-scale reliable systems, enterprise backends, cloud services, and Android.',
        topics: ['Enterprise', 'Backend', 'Cloud', 'Large Systems', 'Android']
    },
    {
        id: 'csharp',
        name: 'C#',
        role: 'Interactive Worlds',
        color: 0x9b4dca,
        description: 'Modern interactive applications, games, desktop tools, and immersive experiences.',
        topics: ['Games', 'Unity', 'Desktop', 'Backend', 'VR']
    },
    {
        id: 'rust',
        name: 'Rust',
        role: 'The Fortress',
        color: 0xb7410e,
        description: 'Speed and safety without garbage collection, built for resilient systems.',
        topics: ['Performance', 'Memory Safety', 'Systems', 'WebAssembly', 'Infrastructure']
    },
    {
        id: 'php',
        name: 'PHP',
        role: 'The Infrastructure',
        color: 0x777bb4,
        description: 'The server-side foundation behind much of the web, handling requests and content.',
        topics: ['Backend', 'Web', 'CMS', 'APIs', 'Servers']
    }
];

export default class Arena extends World {
    constructor(engine, interaction = null, ui = null) {
        super(engine);

        this.interaction = interaction;
        this.ui = ui;

        this.coreGroup = null;
        this.coreInner = null;
        this.coreOuter = null;
        this.coreInnerMaterial = null;
        this.coreOuterMaterial = null;
        this.coreRings = [];
        this.coreParticles = null;

        this.planetGroup = null;
        this.planets = [];
        this.orbitRings = [];

        this.connectionLines = null;
        this.connectionGeometry = null;

        this.selectedLanguage = null;
        this.tempScale = new THREE.Vector3();
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -380;

        this.buildCore();
        this.buildPlanets();
        this.buildConnections();

        this.scene.add(this.group);
    }

    buildCore() {
        this.coreGroup = new THREE.Group();

        this.coreInnerMaterial = this.createAdditiveMaterial(0x00e5ff, 0, true);
        this.coreInner = new THREE.Mesh(
            new THREE.IcosahedronGeometry(2.1, 2),
            this.coreInnerMaterial
        );

        this.coreOuterMaterial = this.createAdditiveMaterial(0xffffff, 0, true);
        this.coreOuter = new THREE.Mesh(
            new THREE.IcosahedronGeometry(3.2, 1),
            this.coreOuterMaterial
        );

        this.coreRings = [
            this.createRing({ radius: 4.4, tube: 0.02, color: 0x00e5ff, opacity: 0 }),
            this.createRing({ radius: 5.6, tube: 0.016, color: 0x7df3ff, opacity: 0 }),
            this.createRing({ radius: 6.8, tube: 0.012, color: 0xffffff, opacity: 0 })
        ];

        const isMobile = this.engine.device.isMobile;

        this.coreParticles = this.createPoints({
            count: isMobile ? 160 : 340,
            size: 0.05,
            color: 0x9df6ff,
            opacity: 0,
            generator: (i, positions) => {
                const radius = 4 + Math.random() * 3;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);
            }
        });

        this.coreGroup.add(this.coreInner);
        this.coreGroup.add(this.coreOuter);
        this.coreRings.forEach((ring) => this.coreGroup.add(ring));
        this.coreGroup.add(this.coreParticles);

        this.group.add(this.coreGroup);
    }

    createPlanetGeometry(languageId) {
        switch (languageId) {
            case 'python':
                return new THREE.IcosahedronGeometry(0.82, 1);

            case 'javascript':
                return new THREE.BoxGeometry(1.05, 1.05, 1.05);

            case 'cpp':
                return new THREE.BoxGeometry(1.25, 0.65, 1.25);

            case 'java':
                return new THREE.CylinderGeometry(0.55, 0.55, 1.35, 16);

            case 'csharp':
                return new THREE.TorusGeometry(0.62, 0.22, 10, 24);

            case 'rust':
                return new THREE.OctahedronGeometry(0.88, 0);

            case 'php':
                return new THREE.BoxGeometry(1.3, 0.75, 0.45);

            default:
                return new THREE.SphereGeometry(0.75, 18, 18);
        }
    }

    buildPlanets() {
        this.planetGroup = new THREE.Group();

        LANGUAGE_DATA.forEach((language, index) => {
            const planetGroup = new THREE.Group();

            const mainMaterial = this.createAdditiveMaterial(language.color, 0, true);
            const mainMesh = new THREE.Mesh(this.createPlanetGeometry(language.id), mainMaterial);

            const ring = this.createRing({
                radius: 1.45,
                tube: 0.015,
                color: language.color,
                opacity: 0
            });

            ring.rotation.x = Math.PI / 2;

            const hitMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                depthWrite: false,
                colorWrite: false
            });

            const hitMesh = new THREE.Mesh(
                new THREE.SphereGeometry(1.7, 12, 12),
                hitMaterial
            );

            if (this.interaction) {
                this.interaction.register(hitMesh, {
                    onClick: () => {
                        this.selectLanguage(language.id);
                    },
                    onHoverChange: (hovering) => {
                        planetGroup.userData.hovered = hovering;
                    }
                });
            }

            planetGroup.add(mainMesh);
            planetGroup.add(ring);
            planetGroup.add(hitMesh);

            planetGroup.userData = {
                language,
                mainMesh,
                ring,
                hovered: false,
                baseRadius: 6.5 + index * 1.35,
                speed: 0.12 + index * 0.02,
                offset: index * 0.9
            };

            const orbitRing = this.createRing({
                radius: planetGroup.userData.baseRadius,
                tube: 0.008,
                color: language.color,
                opacity: 0
            });

            orbitRing.rotation.x = Math.PI / 2;

            this.orbitRings.push({
                ring: orbitRing,
                planet: planetGroup
            });

            this.planets.push(planetGroup);
            this.planetGroup.add(planetGroup);
            this.group.add(orbitRing);
        });

        this.group.add(this.planetGroup);
    }

    buildConnections() {
        const count = LANGUAGE_DATA.length;
        const positions = new Float32Array(count * 2 * 3);

        this.connectionGeometry = new THREE.BufferGeometry();

        const positionAttribute = new THREE.BufferAttribute(positions, 3);
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        this.connectionGeometry.setAttribute('position', positionAttribute);

        const material = new THREE.LineBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.connectionLines = new THREE.LineSegments(this.connectionGeometry, material);

        this.group.add(this.connectionLines);
    }

    selectLanguage(languageId) {
        this.selectedLanguage = languageId;

        if (this.ui) {
            this.ui.showArenaPanel(languageId);
        }
    }

    updateCore(t, alpha, energy, appear, converge, deltaTime) {
        this.coreGroup.rotation.y = t * 0.1;

        this.coreInnerMaterial.opacity = alpha * (0.25 + energy * 0.45 + converge * 0.35);
        this.coreOuterMaterial.opacity = alpha * (0.08 + energy * 0.18 + converge * 0.25);

        const coreScale = Math.max(
            0.001,
            appear * (1 + converge * 1.7 + Math.sin(t * 2) * 0.03)
        );

        this.coreInner.scale.setScalar(coreScale);
        this.coreOuter.scale.setScalar(coreScale * 1.05);

        this.coreInner.rotation.y += deltaTime * 0.2;
        this.coreOuter.rotation.y -= deltaTime * 0.08;

        this.coreRings.forEach((ring, index) => {
            ring.material.opacity = alpha * (0.05 + energy * 0.12 + converge * 0.25);
            ring.rotation.x = Math.PI / 2 + index * 0.18;
            ring.rotation.z += deltaTime * (0.08 + index * 0.05);
            ring.scale.setScalar(Math.max(0.001, appear * (1 + converge * index * 0.2)));
        });

        this.coreParticles.material.opacity = alpha * (0.12 + energy * 0.25 + converge * 0.35);
        this.coreParticles.rotation.y = t * (0.05 + converge * 0.25);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy, appear } = this.getReveal(localProgress);
        const converge = easeInOutCubic(rangeProgress(localProgress, 0.72, 0.98));

        this.group.visible = alpha > 0.001;

        if (this.interaction) {
            this.interaction.setEnabled(
                this.group.visible && localProgress > 0.12 && localProgress < 0.72
            );
        }

        if (!this.group.visible) return;

        if (converge > 0.12 && this.selectedLanguage && this.ui) {
            this.ui.hideArenaPanel();
            this.selectedLanguage = null;
        }

        const t = this.engine.time.elapsed;

        this.updateCore(t, alpha, energy, appear, converge, deltaTime);

        this.orbitRings.forEach(({ ring }) => {
            ring.material.opacity = alpha * 0.06 * (1 - converge);
            ring.scale.setScalar(Math.max(0.001, 1 - converge));
        });

        const positions = this.connectionGeometry.attributes.position;

        this.planets.forEach((planet, index) => {
            const meta = planet.userData;
            const language = meta.language;

            const angle = t * meta.speed + meta.offset + localProgress * 2.0;
            const distance = meta.baseRadius * (1 - converge);

            planet.position.set(
                Math.cos(angle) * distance,
                Math.sin(t * 0.4 + meta.offset) * 0.6 * (1 - converge),
                Math.sin(angle) * distance
            );

            meta.mainMesh.rotation.y += deltaTime * (0.35 + energy * 0.8);
            meta.mainMesh.rotation.x += deltaTime * 0.08;

            meta.ring.rotation.z += deltaTime * 0.4;

            const hoverScale = meta.hovered ? 1.22 : 1.0;
            const selectedScale = this.selectedLanguage === language.id ? 1.16 : 1.0;

            const targetScale = Math.max(
                0.001,
                appear * (1 - converge * 0.72) * hoverScale * selectedScale
            );

            this.tempScale.setScalar(targetScale);
            planet.scale.lerp(this.tempScale, 0.16);

            meta.mainMesh.material.opacity = alpha
                * (0.35 + energy * 0.5)
                * (1 - converge * 0.4);

            meta.ring.material.opacity = alpha
                * ((meta.hovered || this.selectedLanguage === language.id)
                    ? 0.55
                    : 0.16 + energy * 0.2)
                * (1 - converge);

            positions.setXYZ(
                index * 2 + 0,
                planet.position.x,
                planet.position.y,
                planet.position.z
            );

            positions.setXYZ(
                index * 2 + 1,
                0,
                0,
                0
            );
        });

        positions.needsUpdate = true;

        this.connectionLines.material.opacity = alpha * (
            0.05 + energy * 0.08 + converge * 0.55
        );
    }

    exit() {
        super.exit();

        if (this.interaction) {
            this.interaction.setEnabled(false);
        }

        if (this.ui) {
            this.ui.hideArenaPanel();
        }

        this.selectedLanguage = null;
    }

    dispose() {
        if (this.interaction) {
            this.interaction.clear();
        }

        super.dispose();
    }
}