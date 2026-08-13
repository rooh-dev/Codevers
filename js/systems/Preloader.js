/**
 * CODEVERSE - Preloader System
 */

export default class Preloader {
    constructor(ui) {
        this.ui = ui;
        this.progress = 0;
        this.isComplete = false;
    }

    async start() {
        // Phase 1: Simulate loading sequence to test UI and lifecycle
        const steps = [
            { progress: 20, text: 'LOADING WORLDS...' },
            { progress: 45, text: 'INITIALIZING PHYSICS...' },
            { progress: 70, text: 'COMPILING SHADERS...' },
            { progress: 90, text: 'MAPPING SCROLL TIMELINE...' },
            { progress: 100, text: 'SYSTEM READY' }
        ];

        for (const step of steps) {
            await this.delay(400 + Math.random() * 400); // Simulate network/compute time
            this.progress = step.progress;
            this.ui.updateLoader(this.progress, step.text);
        }

        await this.delay(600);
        this.isComplete = true;
        
        // Dispatch custom event when loading is done
        window.dispatchEvent(new CustomEvent('codeverse:loaded'));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}