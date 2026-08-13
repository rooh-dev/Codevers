/**
 * CODEVERSE - C# World: The Interactive World
 */
import * as THREE from 'three';
import World from './World.js';

export default class CSharp extends World {
    constructor(engine) {
        super(engine);

        this.grid = null;
        this.shapes = [];
    }

    init() {
        this.group = new THREE.Group();
        this.group.position.z = -230;

        this.buildPlayfield();

        this.scene.add(this.group);
    }

    buildPlayfield() {
        const isMobile = this.engine.device.isMobile;
        const shapeCount = isMobile ? 10 : 18;

        this.grid = this.createGrid(55, 18, 0x68217a, 0);
        this.grid.position.y = -3.5;

        const geometries = [
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.SphereGeometry(0.65, 16, 16),
            new THREE.ConeGeometry(0.65, 1.3, 12),
            new THREE.TorusGeometry(0.65, 0.2, 10, 32),
            new THREE.IcosahedronGeometry(0.7, 0)
        ];

        const colors = [
            0x68217a,
            0x9b4dca,
            0x00e5ff,
            0x7fff9e
        ];

        for (let i = 0; i < shapeCount; i++) {
            const geometry = geometries[i % geometries.length];
            const color = colors[i % colors.length];

            const material = this.createAdditiveMaterial(color, 0, true);
            const mesh = new THREE.Mesh(geometry, material);

            mesh.userData = {
                baseX: (Math.random() * 2 - 1) * 16,
                baseY: -1.5 + Math.random() * 4.5,
                baseZ: (Math.random() * 2 - 1) * 12,
                amplitude: 0.6 + Math.random() * 2.2,
                speed: 0.6 + Math.random() * 1.8,
                offset: Math.random() * Math.PI * 2,
                rotationX: (Math.random() * 2 - 1) * 0.8,
                rotationY: (Math.random() * 2 - 1) * 0.8,
                scale: 0.7 + Math.random() * 1.6
            };

            mesh.position.set(
                mesh.userData.baseX,
                mesh.userData.baseY,
                mesh.userData.baseZ
            );

            mesh.scale.setScalar(mesh.userData.scale);

            this.shapes.push(mesh);
            this.group.add(mesh);
        }

        this.group.add(this.grid);
    }

    update(localProgress, deltaTime) {
        if (!this.group) return;

        const { alpha, energy } = this.getReveal(localProgress);

        this.group.visible = alpha > 0.001;

        if (!this.group.visible) return;

        const t = this.engine.time.elapsed;

        this.grid.material.opacity = alpha * 0.18;

        this.shapes.forEach((shape) => {
            const data = shape.userData;
            const bounce = Math.abs(Math.sin(t * data.speed + data.offset));

            shape.position.x = data.baseX + Math.sin(t * 0.2 + data.offset) * 0.5;
            shape.position.y = data.baseY + bounce * data.amplitude * (0.4 + energy);
            shape.position.z = data.baseZ + Math.cos(t * 0.18 + data.offset) * 0.5;

            shape.rotation.x += deltaTime * data.rotationX * (0.3 + energy);
            shape.rotation.y += deltaTime * data.rotationY * (0.3 + energy);

            shape.scale.setScalar(data.scale * (1 + bounce * 0.12));
            shape.material.opacity = alpha * (0.25 + energy * 0.55);
        });
    }
}