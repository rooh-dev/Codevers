/**
 * CODEVERSE - Device Capabilities
 */

export default class Device {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isTablet = this.isMobile && window.innerWidth >= 768;
        this.isDesktop = !this.isMobile;
        this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.memory = navigator.deviceMemory || 4;
        this.cores = navigator.hardwareConcurrency || 4;

        this.qualityTier = this.detectQualityTier();
        this.particleScale = this.getParticleScale();

        this.maxDpr = this.calculateMaxDpr();
        this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    }

    detectQualityTier() {
        if (this.isMobile && (this.memory <= 4 || this.cores <= 4)) {
            return 'low';
        }

        if (this.isMobile || this.isTablet || this.memory <= 4) {
            return 'medium';
        }

        return 'high';
    }

    getParticleScale() {
        switch (this.qualityTier) {
            case 'low':
                return 0.5;

            case 'medium':
                return 0.75;

            default:
                return 1.0;
        }
    }

    calculateMaxDpr() {
        switch (this.qualityTier) {
            case 'low':
                return 1.0;

            case 'medium':
                return this.isMobile ? 1.25 : 1.5;

            default:
                return this.isMobile ? 1.5 : 2.0;
        }
    }
}