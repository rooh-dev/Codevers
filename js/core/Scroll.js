/**
 * CODEVERSE - Scroll Engine
 * Balanced native scroll progress system.
 */

import { clamp01 } from '../utils/helpers.js';

export default class Scroll {
    constructor() {
        this.progress = 0;
        this.targetProgress = 0;

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Lower value = softer, more cinematic lag.
        // Higher value = more direct response.
        this.response = this.reducedMotion ? 10.0 : 4.0;

        this.lastTime = performance.now();

        this.onScroll = this.refresh.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onScroll, { passive: true });
        window.addEventListener('orientationchange', this.onScroll, { passive: true });

        this.refresh();
    }

    calculate() {
        const bodyHeight = document.body ? document.body.scrollHeight : 0;
        const documentHeight = document.documentElement
            ? document.documentElement.scrollHeight
            : 0;

        const scrollHeight = Math.max(bodyHeight, documentHeight);
        const maxScroll = scrollHeight - window.innerHeight;

        if (maxScroll <= 0) {
            return 0;
        }

        const currentScroll = window.scrollY || window.pageYOffset || 0;

        return clamp01(currentScroll / maxScroll);
    }

    refresh() {
        this.targetProgress = this.calculate();
    }

    update() {
        // Read every frame as a safety net.
        this.targetProgress = this.calculate();

        const now = performance.now();

        let deltaTime = (now - this.lastTime) / 1000;
        deltaTime = Math.min(Math.max(deltaTime, 0), 0.1);

        this.lastTime = now;

        // Framerate-independent smoothing.
        const alpha = 1 - Math.exp(-this.response * deltaTime);

        const difference = this.targetProgress - this.progress;

        this.progress += difference * alpha;

        if (Math.abs(difference) < 0.0004) {
            this.progress = this.targetProgress;
        }

        this.progress = clamp01(this.progress);
    }

    dispose() {
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onScroll);
        window.removeEventListener('orientationchange', this.onScroll);
    }
}