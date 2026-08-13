/**
 * CODEVERSE - Interaction System
 */
import * as THREE from 'three';

export default class Interaction {
    constructor(engine) {
        this.engine = engine;

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2(-10, -10);

        this.objects = [];
        this.hovered = null;
        this.enabled = false;

        this.onPointerMove = this.onPointerMove.bind(this);
        this.onClick = this.onClick.bind(this);

        window.addEventListener('pointermove', this.onPointerMove, { passive: true });
        window.addEventListener('click', this.onClick);
    }

    setEnabled(value) {
        if (this.enabled === value) return;

        this.enabled = value;

        if (!value) {
            this.setHover(null);
        }
    }

    isInteractiveUITarget(event) {
        const target = event.target;

        if (!(target instanceof Element)) {
            return false;
        }

        return Boolean(
            target.closest('button, a, input, textarea, select, .arena-panel, .main-header')
        );
    }

    updatePointer(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    raycast() {
        if (!this.enabled || this.objects.length === 0) {
            return null;
        }

        this.raycaster.setFromCamera(this.pointer, this.engine.camera.instance);

        const hits = this.raycaster.intersectObjects(this.objects, false);

        if (hits.length === 0) {
            return null;
        }

        return hits[0].object;
    }

    setHover(object) {
        if (this.hovered === object) return;

        if (this.hovered && this.hovered.userData.onHoverChange) {
            this.hovered.userData.onHoverChange(false);
        }

        this.hovered = object;

        if (this.hovered) {
            if (this.hovered.userData.onHoverChange) {
                this.hovered.userData.onHoverChange(true);
            }

            // Body cursor is used because the scroll container may be
            // visually above the canvas but still transparent.
            document.body.style.cursor = 'pointer';
            this.engine.canvas.style.cursor = 'pointer';

            window.dispatchEvent(
                new CustomEvent('codeverse:hover-start', {
                    detail: {
                        object: this.hovered.uuid
                    }
                })
            );
        } else {
            document.body.style.cursor = 'auto';
            this.engine.canvas.style.cursor = 'auto';
        }
    }

    onPointerMove(event) {
        // Touch devices should not receive hover behavior.
        // This prevents unstable raycasting during scroll gestures.
        if (event.pointerType === 'touch') {
            return;
        }

        if (event.isPrimary === false) {
            return;
        }

        if (this.isInteractiveUITarget(event)) {
            this.setHover(null);
            return;
        }

        this.updatePointer(event);

        const hit = this.raycast();
        this.setHover(hit);
    }

    onClick(event) {
        if (this.isInteractiveUITarget(event)) {
            return;
        }

        this.updatePointer(event);

        const hit = this.raycast();

        if (hit) {
            window.dispatchEvent(
                new CustomEvent('codeverse:select', {
                    detail: {
                        object: hit.uuid
                    }
                })
            );

            if (hit.userData.onClick) {
                hit.userData.onClick(hit);
            }
        }
    }

    register(object, handlers = {}) {
        object.userData.onClick = handlers.onClick || null;
        object.userData.onHoverChange = handlers.onHoverChange || null;

        this.objects.push(object);
    }

    unregister(object) {
        this.objects = this.objects.filter((item) => item !== object);

        if (this.hovered === object) {
            this.setHover(null);
        }
    }

    clear() {
        this.setHover(null);
        this.objects.length = 0;
    }

    dispose() {
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('click', this.onClick);

        document.body.style.cursor = 'auto';
        this.engine.canvas.style.cursor = 'auto';

        this.clear();
    }
}