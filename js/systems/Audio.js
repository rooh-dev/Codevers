/**
 * CODEVERSE - Audio System
 * Procedural Web Audio engine for ambient, scroll, transition, and interaction sound.
 */

export default class Audio {
    constructor() {
        try {
            this.enabled = localStorage.getItem('codeverse-muted') !== '1';
        } catch (error) {
            this.enabled = true;
        }

        this.ready = false;
        this.context = null;

        this.masterGain = null;
        this.ambientGain = null;
        this.sfxGain = null;

        this.noiseBuffer = null;

        this.scrollNoise = null;
        this.scrollFilter = null;
        this.scrollGain = null;

        this.activeAmbient = null;
        this.currentTheme = null;
        this.pendingTheme = null;

        this.lastProgress = 0;
        this.velocity = 0;

        this.lastHoverTime = 0;
        this.lastTransitionTime = 0;

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.handleHoverStart = () => {
            this.playHover();
        };

        this.handleSelect = () => {
            this.playClick();
        };

        this.handleUIPointerDown = (event) => {
            if (!this.ready || !this.enabled) return;

            if (
                event.target instanceof Element &&
                event.target.closest('button, a')
            ) {
                this.playClick();
            }
        };

        this.handleVisibilityChange = this.onVisibilityChange.bind(this);

        window.addEventListener('codeverse:hover-start', this.handleHoverStart);
        window.addEventListener('codeverse:select', this.handleSelect);
        document.addEventListener('pointerdown', this.handleUIPointerDown, true);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    initOnGesture() {
        const events = ['pointerdown', 'keydown', 'touchstart', 'wheel'];

        const unlock = (event) => {
            this.setup();
            this.resume();

            if (
                event.target instanceof Element &&
                event.target.closest('button, a')
            ) {
                this.playClick();
            }

            events.forEach((type) => {
                window.removeEventListener(type, unlock);
            });
        };

        events.forEach((type) => {
            window.addEventListener(type, unlock, { passive: true, once: true });
        });
    }

    setup() {
        if (this.ready) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) return;

        try {
            this.context = new AudioContext();
        } catch (error) {
            return;
        }

        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.enabled ? 0.65 : 0;
        this.masterGain.connect(this.context.destination);

        this.ambientGain = this.context.createGain();
        this.ambientGain.gain.value = 0.8;
        this.ambientGain.connect(this.masterGain);

        this.sfxGain = this.context.createGain();
        this.sfxGain.gain.value = 0.9;
        this.sfxGain.connect(this.masterGain);

        this.noiseBuffer = this.createNoiseBuffer();

        this.scrollNoise = this.context.createBufferSource();
        this.scrollNoise.buffer = this.noiseBuffer;
        this.scrollNoise.loop = true;

        this.scrollFilter = this.context.createBiquadFilter();
        this.scrollFilter.type = 'bandpass';
        this.scrollFilter.frequency.value = 700;
        this.scrollFilter.Q.value = 0.8;

        this.scrollGain = this.context.createGain();
        this.scrollGain.gain.value = 0;

        this.scrollNoise.connect(this.scrollFilter);
        this.scrollFilter.connect(this.scrollGain);
        this.scrollGain.connect(this.sfxGain);

        this.scrollNoise.start();

        this.ready = true;

        if (this.pendingTheme) {
            const theme = this.pendingTheme;
            this.pendingTheme = null;
            this.currentTheme = theme;
            this.startAmbient(theme);
        }
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume().catch(() => {});
        }
    }

    onVisibilityChange() {
        if (!this.ready || !this.context) return;

        if (document.hidden) {
            if (this.context.state === 'running') {
                this.context.suspend().catch(() => {});
            }
        } else {
            if (this.context.state === 'suspended') {
                this.context.resume().catch(() => {});
            }
        }
    }

    createNoiseBuffer() {
        const length = this.context.sampleRate * 2;
        const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    setEnabled(value) {
        if (this.enabled === value) return;

        this.enabled = value;

        try {
            localStorage.setItem('codeverse-muted', value ? '0' : '1');
        } catch (error) {
            // Storage is optional.
        }

        if (this.ready && this.masterGain) {
            const now = this.context.currentTime;

            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setTargetAtTime(
                value ? 0.65 : 0,
                now,
                0.08
            );
        }
    }

    toggle() {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }

    setTheme(theme) {
        if (!theme) return;

        if (!this.ready) {
            this.pendingTheme = theme;
            return;
        }

        if (this.currentTheme === theme) return;

        this.currentTheme = theme;
        this.startAmbient(theme);
    }

    getThemeConfig(theme) {
        switch (theme) {
            case 'Origin':
                return {
                    frequencies: [55, 82.4],
                    wave: 'sine',
                    filter: 320,
                    volume: 0.14,
                    lfoRate: 0.06,
                    lfoDepth: 40,
                    noise: 0.008
                };

            case 'Programming':
                return {
                    frequencies: [73.4, 110],
                    wave: 'triangle',
                    filter: 520,
                    volume: 0.12,
                    lfoRate: 0.08,
                    lfoDepth: 60,
                    noise: 0.01
                };

            case 'Python':
                return {
                    frequencies: [130.8, 196],
                    wave: 'sine',
                    filter: 900,
                    volume: 0.11,
                    lfoRate: 0.15,
                    lfoDepth: 120,
                    noise: 0.012
                };

            case 'JavaScript':
                return {
                    frequencies: [110, 164.8],
                    wave: 'triangle',
                    filter: 1600,
                    volume: 0.10,
                    lfoRate: 0.2,
                    lfoDepth: 180,
                    noise: 0.014
                };

            case 'C++':
                return {
                    frequencies: [82.4, 123.5],
                    wave: 'sawtooth',
                    filter: 360,
                    volume: 0.08,
                    lfoRate: 0.4,
                    lfoDepth: 35,
                    noise: 0.018
                };

            case 'Java':
                return {
                    frequencies: [98, 146.8],
                    wave: 'triangle',
                    filter: 820,
                    volume: 0.10,
                    lfoRate: 0.1,
                    lfoDepth: 80,
                    noise: 0.01
                };

            case 'C#':
                return {
                    frequencies: [174.6, 261.6],
                    wave: 'triangle',
                    filter: 1800,
                    volume: 0.09,
                    lfoRate: 0.3,
                    lfoDepth: 160,
                    noise: 0.012
                };

            case 'Rust':
                return {
                    frequencies: [61.7, 92.5],
                    wave: 'square',
                    filter: 260,
                    volume: 0.06,
                    lfoRate: 0.12,
                    lfoDepth: 25,
                    noise: 0.02
                };

            case 'PHP':
                return {
                    frequencies: [98, 196],
                    wave: 'triangle',
                    filter: 950,
                    volume: 0.09,
                    lfoRate: 0.8,
                    lfoDepth: 90,
                    noise: 0.016
                };

            case 'Arena':
                return {
                    frequencies: [65.4, 98, 130.8],
                    wave: 'triangle',
                    filter: 1200,
                    volume: 0.11,
                    lfoRate: 0.16,
                    lfoDepth: 140,
                    noise: 0.014
                };

            case 'Programmer':
                return {
                    frequencies: [110, 138.6, 164.8],
                    wave: 'sine',
                    filter: 1000,
                    volume: 0.12,
                    lfoRate: 0.07,
                    lfoDepth: 70,
                    noise: 0.008
                };

            case 'Portfolio':
                return {
                    frequencies: [73.4, 110, 146.8],
                    wave: 'triangle',
                    filter: 1400,
                    volume: 0.11,
                    lfoRate: 0.22,
                    lfoDepth: 120,
                    noise: 0.015
                };

            default:
                return {
                    frequencies: [55, 110],
                    wave: 'sine',
                    filter: 500,
                    volume: 0.08,
                    lfoRate: 0.1,
                    lfoDepth: 60,
                    noise: 0.008
                };
        }
    }

    canPlay() {
        if (!this.ready || !this.enabled || !this.context) {
            return false;
        }

        if (this.context.state !== 'running') {
            this.resume();
            return false;
        }

        return true;
    }

    fadeOutAmbient(nodes) {
        if (!nodes || !this.context) return;

        const now = this.context.currentTime;

        nodes.gain.gain.cancelScheduledValues(now);
        nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
        nodes.gain.gain.linearRampToValueAtTime(0, now + 1.6);

        setTimeout(() => {
            nodes.oscillators.forEach((oscillator) => {
                try {
                    oscillator.stop();
                } catch (error) {
                    // Already stopped.
                }
            });

            if (nodes.lfo) {
                try {
                    nodes.lfo.stop();
                } catch (error) {
                    // Already stopped.
                }
            }

            if (nodes.noiseSource) {
                try {
                    nodes.noiseSource.stop();
                } catch (error) {
                    // Already stopped.
                }
            }

            try {
                nodes.gain.disconnect();
            } catch (error) {
                // Already disconnected.
            }
        }, 2000);
    }

    startAmbient(theme) {
        if (!this.ready) return;

        const config = this.getThemeConfig(theme);

        this.fadeOutAmbient(this.activeAmbient);

        const gain = this.context.createGain();
        gain.gain.value = 0;
        gain.connect(this.ambientGain);

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = config.filter;
        filter.Q.value = 0.7;
        filter.connect(gain);

        const oscillators = config.frequencies.map((frequency, index) => {
            const oscillator = this.context.createOscillator();
            oscillator.type = config.wave;
            oscillator.frequency.value = frequency;
            oscillator.detune.value = (index - (config.frequencies.length - 1) / 2) * 5;

            const oscillatorGain = this.context.createGain();
            oscillatorGain.gain.value = 1 / config.frequencies.length;

            oscillator.connect(oscillatorGain);
            oscillatorGain.connect(filter);
            oscillator.start();

            return oscillator;
        });

        const lfo = this.context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = config.lfoRate;

        const lfoGain = this.context.createGain();
        lfoGain.gain.value = config.lfoDepth;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        let noiseSource = null;

        if (config.noise > 0 && this.noiseBuffer) {
            noiseSource = this.context.createBufferSource();
            noiseSource.buffer = this.noiseBuffer;
            noiseSource.loop = true;

            const noiseFilter = this.context.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = config.filter * 1.8;
            noiseFilter.Q.value = 0.6;

            const noiseGain = this.context.createGain();
            noiseGain.gain.value = config.noise;

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(gain);
            noiseSource.start();
        }

        gain.gain.setTargetAtTime(config.volume, this.context.currentTime, 1.2);

        this.activeAmbient = {
            gain,
            filter,
            oscillators,
            lfo,
            noiseSource
        };
    }

    playHover() {
        if (!this.canPlay()) return;

        const now = performance.now();

        if (now - this.lastHoverTime < 70) return;

        this.lastHoverTime = now;

        const t = this.context.currentTime;

        const oscillator = this.context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1500, t);

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.016, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(t);
        oscillator.stop(t + 0.08);
    }

    playClick() {
        if (!this.canPlay()) return;

        const t = this.context.currentTime;

        const oscillator = this.context.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(660, t);
        oscillator.frequency.exponentialRampToValueAtTime(240, t + 0.1);

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        oscillator.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(t);
        oscillator.stop(t + 0.13);
    }

    playTransition() {
        if (!this.canPlay()) return;

        const t = this.context.currentTime;

        if (t - this.lastTransitionTime < 1.2) return;

        this.lastTransitionTime = t;

        const oscillator = this.context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(140, t);
        oscillator.frequency.exponentialRampToValueAtTime(760, t + 0.9);

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.8;

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.045, t + 0.25);
        gain.gain.linearRampToValueAtTime(0.0001, t + 1.2);

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start(t);
        oscillator.stop(t + 1.25);
    }

    update(deltaTime, progress) {
        if (!this.ready || !this.context) return;

        if (this.context.state !== 'running') return;

        const safeDelta = Math.max(deltaTime, 0.0001);
        const rawVelocity = Math.abs(progress - this.lastProgress) / safeDelta;

        this.velocity += (rawVelocity - this.velocity) * 0.15;

        const motionScale = this.reducedMotion ? 0.3 : 1;

        const target = this.enabled
            ? Math.min(0.045, this.velocity * 0.8) * motionScale
            : 0;

        if (this.scrollGain) {
            this.scrollGain.gain.setTargetAtTime(
                target,
                this.context.currentTime,
                0.08
            );
        }

        this.lastProgress = progress;
    }

    dispose() {
        window.removeEventListener('codeverse:hover-start', this.handleHoverStart);
        window.removeEventListener('codeverse:select', this.handleSelect);
        document.removeEventListener('pointerdown', this.handleUIPointerDown, true);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        if (this.context) {
            this.context.close().catch(() => {});
        }
    }
}