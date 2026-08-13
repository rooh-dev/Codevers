/**
 * CODEVERSE - Chapter 01: The Origin
 */
import * as THREE from 'three';
import World from './World.js';
import {
    clamp01,
    easeInOutCubic,
    rangeProgress
} from '../utils/helpers.js';

const CORE_VERTEX_SHADER = /* glsl */`
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vPosition;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-mvPosition.xyz);
        vPosition = position;

        gl_Position = projectionMatrix * mvPosition;
    }
`;

const CORE_FRAGMENT_SHADER = /* glsl */`
    uniform float uTime;
    uniform float uEnergy;
    uniform float uOpacity;
    uniform vec3 uColorA;
    uniform vec3 uColorB;

    varying vec3 vNormal;
    varying vec3 vViewDirection;
    varying vec3 vPosition;

    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDirection = normalize(vViewDirection);

        float fresnel = pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), 2.5);
        float pulse = sin(uTime * 2.2 + vPosition.y * 4.0) * 0.5 + 0.5;
        float bands = smoothstep(0.42, 0.58, fract(vPosition.y * 1.4 - uTime * 0.22));

        vec3 color = mix(
            uColorA,
            uColorB,
            clamp(fresnel + pulse * 0.22 + uEnergy * 0.35, 0.0, 1.0)
        );

        float alpha = clamp(
            (0.12 + fresnel * 0.6 + bands * 0.12 + uEnergy * 0.22) * uOpacity,
            0.0,
            1.0
        );

        gl_FragColor = vec4(color, alpha);
    }
`;

const PARTICLE_VERTEX_SHADER = /* glsl */`
    attribute float aScale;
    attribute float aOffset;

    uniform float uTime;
    uniform float uEnergy;
    uniform float uPixelRatio;
    uniform float uSize;

    varying float vAlpha;

    void main() {
        vec3 pos = position;

        float angle = uTime * (0.02 + aOffset * 0.035) * (1.0 + uEnergy * 2.5);
        float c = cos(angle);
        float s = sin(angle);

        pos.xz = mat2(c, -s, s, c) * pos.xz;
        pos.y += sin(uTime * (0.3 + aOffset) + aOffset * 6.28318) * 0.35 * (1.0 + uEnergy);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

        float size = uSize * aScale * uPixelRatio * (1.0 + uEnergy * 1.2);
        gl_PointSize = clamp(size * (10.0 / -mvPosition.z), 1.0, 60.0);

        float twinkle = sin(uTime * (1.0 + aOffset * 3.0) + aOffset * 6.28318);
        vAlpha = clamp(0.25 + 0.35 * twinkle + uEnergy * 0.45, 0.0, 1.0);

        gl_Position = projectionMatrix * mvPosition;
    }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */`
    uniform vec3 uColor;
    uniform float uOpacity;

    varying float vAlpha;

    void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float distance = length(uv);

        float alpha = smoothstep(0.5, 0.0, distance) * vAlpha * uOpacity;

        if (alpha < 0.001) {
            discard;
        }

        gl_FragColor = vec4(uColor, alpha);
    }
`;

export default class Origin extends World {
    constructor(engine) {
        super(engine);

        this.coreGroup = null;
        this.core = null;
        this.coreWire = null;
        this.coreMaterial = null;
        this.coreWireMaterial = null;

        this.particles = null;
        this.particleMaterial = null;

        this.dust = null;
        this.dustMaterial = null;

        this.nodeGroup = null;
        this.nodes = null;
        this.nodeMaterial = null;

        this.codeGroup = null;
        this.ringGroup = null;
        this.rings = [];
    }

    init() {
        this.group = new THREE.Group();

        this.buildCore();
        this.buildParticles();
        this.buildDust();
        this.buildNodes();
        this.buildCodeFragments();
        this.buildLightRings();

        this.scene.add(this.group);
    }

    buildCore() {
        this.coreGroup = new THREE.Group();

        const coreGeometry = new THREE.IcosahedronGeometry(2.35, 4);

        this.coreMaterial = new THREE.ShaderMaterial({
            vertexShader: CORE_VERTEX_SHADER,
            fragmentShader: CORE_FRAGMENT_SHADER,
            uniforms: {
                uTime: { value: 0 },
                uEnergy: { value: 0 },
                uOpacity: { value: 1 },
                uColorA: { value: new THREE.Color(0x071720) },
                uColorB: { value: new THREE.Color(0x7df3ff) }
            },
            transparent: true,
            depthWrite: false,
            side: THREE.FrontSide
        });

        this.core = new THREE.Mesh(coreGeometry, this.coreMaterial);

        const wireGeometry = new THREE.IcosahedronGeometry(2.85, 1);

        this.coreWireMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.coreWire = new THREE.Mesh(wireGeometry, this.coreWireMaterial);

        this.coreGroup.add(this.core);
        this.coreGroup.add(this.coreWire);
        this.group.add(this.coreGroup);
    }

    buildParticles() {
        const count = this.engine.device.isMobile ? 650 : 1800;

        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const offsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const radius = 3.5 + Math.pow(Math.random(), 0.7) * 9.0;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() * 2 - 1) * 7.0;

            positions[i * 3 + 0] = Math.cos(theta) * radius;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * radius;

            scales[i] = 0.5 + Math.random() * 1.7;
            offsets[i] = Math.random();
        }

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

        this.particleMaterial = new THREE.ShaderMaterial({
            vertexShader: PARTICLE_VERTEX_SHADER,
            fragmentShader: PARTICLE_FRAGMENT_SHADER,
            uniforms: {
                uTime: { value: 0 },
                uEnergy: { value: 0 },
                uOpacity: { value: 0.75 },
                uPixelRatio: { value: this.engine.renderer.getPixelRatio() },
                uSize: { value: this.engine.device.isMobile ? 2.0 : 2.6 },
                uColor: { value: new THREE.Color(0x66ecff) }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, this.particleMaterial);
        this.group.add(this.particles);
    }

    buildDust() {
        const count = this.engine.device.isMobile ? 180 : 420;

        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 6 + Math.random() * 24;
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() * 2 - 1) * 18;

            positions[i * 3 + 0] = Math.cos(theta) * radius;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * radius;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.dustMaterial = new THREE.PointsMaterial({
            color: 0x7de8ff,
            size: 0.08,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.16,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.dust = new THREE.Points(geometry, this.dustMaterial);
        this.group.add(this.dust);
    }

    buildNodes() {
        this.nodeGroup = new THREE.Group();

        const count = this.engine.device.isMobile ? 18 : 36;

        const nodeGeometry = new THREE.IcosahedronGeometry(0.06, 0);

        this.nodeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.nodes = new THREE.InstancedMesh(
            nodeGeometry,
            this.nodeMaterial,
            count
        );

        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            const radius = 3.5 + Math.random() * 5.5;
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;

            dummy.position.setFromSphericalCoords(radius, phi, theta);
            dummy.scale.setScalar(0.6 + Math.random() * 1.6);
            dummy.updateMatrix();

            this.nodes.setMatrixAt(i, dummy.matrix);
        }

        this.nodes.instanceMatrix.needsUpdate = true;
        this.nodeGroup.add(this.nodes);
        this.group.add(this.nodeGroup);
    }

    makeCodeTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;

        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '500 44px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.92)';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        return texture;
    }

    buildCodeFragments() {
        this.codeGroup = new THREE.Group();

        const snippets = [
            'const core = new Core()',
            'while (true) { build(); }',
            'import future',
            'def intelligence():',
            'class System {}',
            'git commit -m "origin"',
            'npm run universe',
            '0x00E5FF'
        ];

        const count = this.engine.device.isMobile ? 6 : 12;
        const geometry = new THREE.PlaneGeometry(2.4, 0.6);

        for (let i = 0; i < count; i++) {
            const texture = this.makeCodeTexture(snippets[i % snippets.length]);

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.22,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(geometry, material);

            mesh.userData = {
                radius: 4.5 + Math.random() * 6.5,
                speed: 0.08 + Math.random() * 0.18,
                offset: Math.random() * Math.PI * 2,
                y: (Math.random() * 2 - 1) * 5.5
            };

            this.codeGroup.add(mesh);
        }

        this.group.add(this.codeGroup);
    }

    buildLightRings() {
        this.ringGroup = new THREE.Group();
        this.rings = [];

        const ringGeometry = new THREE.TorusGeometry(3.6, 0.015, 8, 160);

        for (let i = 0; i < 3; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: 0x00e5ff,
                transparent: true,
                opacity: 0.14,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const ring = new THREE.Mesh(ringGeometry, material);

            ring.rotation.set(
                Math.PI / 2 + i * 0.35,
                i * 0.5,
                0
            );

            this.rings.push(ring);
            this.ringGroup.add(ring);
        }

        this.group.add(this.ringGroup);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const t = this.engine.time.elapsed;

        const energy = easeInOutCubic(rangeProgress(localProgress, 0.04, 0.75));
        const vanish = easeInOutCubic(rangeProgress(localProgress, 0.78, 1.0));

        this.group.visible = localProgress >= 0 && localProgress <= 1 && vanish < 0.995;

        if (!this.group.visible) return;

        this.coreMaterial.uniforms.uTime.value = t;
        this.coreMaterial.uniforms.uEnergy.value = energy;
        this.coreMaterial.uniforms.uOpacity.value = Math.max(0, 1 - vanish);

        this.particleMaterial.uniforms.uTime.value = t;
        this.particleMaterial.uniforms.uEnergy.value = energy;
        this.particleMaterial.uniforms.uOpacity.value = (0.5 + energy * 0.5) * Math.max(0, 1 - vanish);
        this.particleMaterial.uniforms.uPixelRatio.value = this.engine.renderer.getPixelRatio();

        const coreScale = 1 + energy * 0.3 + vanish * 2.2;
        this.coreGroup.scale.setScalar(coreScale);

        this.coreGroup.rotation.y = t * (0.08 + energy * 0.5);
        this.coreGroup.rotation.x = Math.sin(t * 0.2) * 0.08;

        this.coreWire.rotation.y = -t * (0.05 + energy * 0.3);
        this.coreWireMaterial.opacity = (0.12 + energy * 0.25) * Math.max(0, 1 - vanish);

        this.particles.rotation.y = t * (0.01 + energy * 0.08);
        this.dust.rotation.y = -t * 0.005;

        this.nodeGroup.rotation.y = t * (0.03 + energy * 0.15);
        this.nodeMaterial.opacity = (0.35 + energy * 0.45) * Math.max(0, 1 - vanish);

        this.codeGroup.children.forEach((fragment) => {
            const data = fragment.userData;
            const angle = t * data.speed * (1 + energy * 2) + data.offset;

            fragment.position.set(
                Math.cos(angle) * data.radius,
                data.y + Math.sin(t * 0.45 + data.offset) * 0.7,
                Math.sin(angle) * data.radius
            );

            fragment.rotation.y = -angle + Math.PI / 2;
            fragment.material.opacity = (0.10 + energy * 0.22) * Math.max(0, 1 - vanish);
        });

        this.rings.forEach((ring, index) => {
            ring.rotation.x += deltaTime * (0.1 + index * 0.05);
            ring.rotation.y += deltaTime * (0.08 + index * 0.04);
            ring.material.opacity = (0.08 + energy * 0.2) * Math.max(0, 1 - vanish);
            ring.scale.setScalar(1 + energy * 0.15 + vanish * 0.8);
        });
    }
}