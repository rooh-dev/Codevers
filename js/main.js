/**
 * CODEVERSE - Main Application Entry
 */
import Engine from './core/Engine.js';
import UI from './systems/UI.js';
import Preloader from './systems/Preloader.js';
import Scroll from './core/Scroll.js';
import SceneManager from './core/SceneManager.js';
import Interaction from './systems/Interaction.js';
import Audio from './systems/Audio.js';

import Origin from './worlds/Origin.js';
import Programming from './worlds/Programming.js';
import Python from './worlds/Python.js';
import JavaScript from './worlds/JavaScript.js';
import Cpp from './worlds/Cpp.js';
import Java from './worlds/Java.js';
import CSharp from './worlds/CSharp.js';
import Rust from './worlds/Rust.js';
import PHP from './worlds/PHP.js';
import Arena, { LANGUAGE_DATA } from './worlds/Arena.js';
import Programmer from './worlds/Programmer.js';
import Portfolio, { PROJECT_DATA } from './worlds/Portfolio.js';

const CINEMATIC_CUES = [
    {
        type: 'title',
        text: 'CODE IS NOT JUST WRITTEN.',
        start: 0.000,
        end: 0.012,
        fadeIn: 0.0,
        fadeOut: 0.004
    },
    {
        type: 'title',
        text: 'IT IS BUILT.',
        start: 0.013,
        end: 0.025,
        fadeIn: 0.004,
        fadeOut: 0.004
    },
    {
        type: 'hint',
        text: 'SCROLL TO ENTER',
        start: 0.026,
        end: 0.040,
        fadeIn: 0.004,
        fadeOut: 0.004
    },

    {
        type: 'statement',
        text: 'Every digital experience begins with an idea.',
        start: 0.045,
        end: 0.058,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'An idea becomes logic.',
        start: 0.059,
        end: 0.068,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'Logic becomes code.',
        start: 0.069,
        end: 0.078,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'Code becomes reality.',
        start: 0.079,
        end: 0.090,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'PYTHON',
        start: 0.095,
        end: 0.108,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'SIMPLE TO READ. POWERFUL TO BUILD.',
        start: 0.109,
        end: 0.123,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'AI • DATA SCIENCE • AUTOMATION • BACKEND • MACHINE LEARNING',
        start: 0.124,
        end: 0.140,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'JAVASCRIPT',
        start: 0.150,
        end: 0.163,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: "THE WEB'S NERVOUS SYSTEM.",
        start: 0.164,
        end: 0.178,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'FRONTEND • BACKEND • WEB APPLICATIONS • INTERACTIVE UI • FULL STACK',
        start: 0.179,
        end: 0.195,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'C++',
        start: 0.205,
        end: 0.218,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'CLOSE TO THE MACHINE.',
        start: 0.219,
        end: 0.233,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'GAME ENGINES • OPERATING SYSTEMS • HIGH PERFORMANCE • EMBEDDED • GRAPHICS',
        start: 0.234,
        end: 0.250,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'JAVA',
        start: 0.260,
        end: 0.273,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'BUILT FOR SYSTEMS THAT NEVER STOP.',
        start: 0.274,
        end: 0.288,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'ENTERPRISE • BACKEND • CLOUD • LARGE SYSTEMS • ANDROID',
        start: 0.289,
        end: 0.305,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'C#',
        start: 0.315,
        end: 0.328,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'BUILD WORLDS.',
        start: 0.329,
        end: 0.343,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'GAMES • UNITY • DESKTOP • BACKEND • VR',
        start: 0.344,
        end: 0.360,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'RUST',
        start: 0.370,
        end: 0.383,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'FAST. SAFE. FEARLESS.',
        start: 0.384,
        end: 0.398,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'PERFORMANCE • MEMORY SAFETY • SYSTEMS • WEBASSEMBLY • INFRASTRUCTURE',
        start: 0.399,
        end: 0.415,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'PHP',
        start: 0.425,
        end: 0.438,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'statement',
        text: 'THE WEB RUNS DEEPER THAN WHAT YOU SEE.',
        start: 0.439,
        end: 0.453,
        fadeIn: 0.005,
        fadeOut: 0.005
    },
    {
        type: 'topics',
        text: 'BACKEND • WEB • CMS • APIS • SERVERS',
        start: 0.454,
        end: 0.470,
        fadeIn: 0.005,
        fadeOut: 0.005
    },

    {
        type: 'title',
        text: 'THE LANGUAGE ARENA',
        start: 0.495,
        end: 0.512,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'EVERY LANGUAGE IS A DIFFERENT TOOL.',
        start: 0.515,
        end: 0.535,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'hint',
        text: 'SELECT A PLANET',
        start: 0.538,
        end: 0.560,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'LANGUAGES ARE TOOLS.',
        start: 0.590,
        end: 0.606,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'THE PROGRAMMER IS THE ARCHITECT.',
        start: 0.608,
        end: 0.628,
        fadeIn: 0.006,
        fadeOut: 0.006
    },

    {
        type: 'title',
        text: 'PROGRAMMER',
        start: 0.640,
        end: 0.656,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'BEHIND EVERY WORLD IS A MIND.',
        start: 0.658,
        end: 0.676,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'topics',
        text: 'JAVASCRIPT • THREE.JS • WEBGL • UI/UX • AI • CREATIVE CODING',
        start: 0.678,
        end: 0.700,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'hint',
        text: 'CODE • DESIGN • SYSTEMS • CREATIVITY',
        start: 0.704,
        end: 0.724,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'CRAFTING INTERACTIVE WORLDS FROM LOGIC AND MOTION.',
        start: 0.728,
        end: 0.750,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'hint',
        text: 'THE ARCHITECT BEHIND CODEVERSE',
        start: 0.754,
        end: 0.762,
        fadeIn: 0.006,
        fadeOut: 0.006
    },

    {
        type: 'title',
        text: 'THE WORK',
        start: 0.770,
        end: 0.786,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'hint',
        text: 'SELECT A PROJECT WORLD',
        start: 0.788,
        end: 0.804,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'PROJECT 01 — DIGITAL CITY',
        start: 0.806,
        end: 0.824,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'PROJECT 02 — SPACE SYSTEM',
        start: 0.830,
        end: 0.848,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'PROJECT 03 — NEURAL NETWORK',
        start: 0.860,
        end: 0.878,
        fadeIn: 0.006,
        fadeOut: 0.006
    },
    {
        type: 'statement',
        text: 'PROJECT 04 — INTERACTIVE MACHINE',
        start: 0.900,
        end: 0.918,
        fadeIn: 0.006,
        fadeOut: 0.006
    }
];

class Codeverse {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.isReady = false;
        this.failed = false;

        this.init();
    }

    updateMuteButton() {
        if (!this.audio || !this.ui) return;

        this.ui.setAudioState(this.audio.enabled);
    }

    async init() {
        this.ui = new UI();
        this.ui.setCues(CINEMATIC_CUES);
        this.ui.setArenaData(LANGUAGE_DATA);
        this.ui.setPortfolioData(PROJECT_DATA);

        try {
            this.engine = new Engine(this.canvas);
        } catch (error) {
            this.failed = true;
            this.ui.hideLoader();
            this.ui.showFallback(
                'Your browser could not initialize WebGL. ' +
                'You can still read the accessible summary of CODEVERSE below.'
            );
            return;
        }

        if (this.engine.device.prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }

        this.scroll = new Scroll();
        this.interaction = new Interaction(this.engine);
        this.interaction.setEnabled(false);

        this.audio = new Audio();
        this.audio.initOnGesture();

        this.muteButton = document.querySelector('[data-action="mute"]');

        if (this.muteButton) {
            this.muteButton.addEventListener('click', () => {
                this.audio.toggle();
                this.updateMuteButton();
            });
        }

        this.updateMuteButton();

        this.sceneManager = new SceneManager(this.engine);
        this.preloader = new Preloader(this.ui);

        this.sceneManager.onChapterChange = (label) => {
            this.audio.setTheme(label);
        };

        this.sceneManager.onTransitionStart = () => {
            this.audio.playTransition();
        };

        const originWorld = new Origin(this.engine);
        const programmingWorld = new Programming(this.engine);
        const pythonWorld = new Python(this.engine);
        const javaScriptWorld = new JavaScript(this.engine);
        const cppWorld = new Cpp(this.engine);
        const javaWorld = new Java(this.engine);
        const csharpWorld = new CSharp(this.engine);
        const rustWorld = new Rust(this.engine);
        const phpWorld = new PHP(this.engine);
        const arenaWorld = new Arena(this.engine, this.interaction, this.ui);
        const programmerWorld = new Programmer(this.engine);
        const portfolioWorld = new Portfolio(this.engine, this.interaction, this.ui);

        this.sceneManager.addWorld(
            originWorld,
            0.000,
            0.055,
            0x00e5ff,
            6,
            'Origin'
        );

        this.sceneManager.addWorld(
            programmingWorld,
            0.040,
            0.095,
            0x7df3ff,
            6,
            'Programming'
        );

        this.sceneManager.addWorld(
            pythonWorld,
            0.080,
            0.150,
            0x4b8bbe,
            12,
            'Python'
        );

        this.sceneManager.addWorld(
            javaScriptWorld,
            0.135,
            0.205,
            0xf7df1e,
            16,
            'JavaScript'
        );

        this.sceneManager.addWorld(
            cppWorld,
            0.190,
            0.260,
            0x00599c,
            12,
            'C++'
        );

        this.sceneManager.addWorld(
            javaWorld,
            0.245,
            0.315,
            0xe76f51,
            15,
            'Java'
        );

        this.sceneManager.addWorld(
            csharpWorld,
            0.300,
            0.370,
            0x9b4dca,
            12,
            'C#'
        );

        this.sceneManager.addWorld(
            rustWorld,
            0.355,
            0.425,
            0xb7410e,
            12,
            'Rust'
        );

        this.sceneManager.addWorld(
            phpWorld,
            0.410,
            0.490,
            0x777bb4,
            14,
            'PHP'
        );

        this.sceneManager.addWorld(
            arenaWorld,
            0.475,
            0.635,
            0x00e5ff,
            18,
            'Arena'
        );

        this.sceneManager.addWorld(
            programmerWorld,
            0.620,
            0.765,
            0x9df6ff,
            8,
            'Programmer'
        );

        this.sceneManager.addWorld(
            portfolioWorld,
            0.755,
            0.945,
            0x00e5ff,
            20,
            'Portfolio'
        );

        if (
            !this.engine.device.hasTouch &&
            !this.engine.device.prefersReducedMotion
        ) {
            window.addEventListener('mousemove', (event) => {
                const x = (event.clientX / window.innerWidth) * 2 - 1;
                const y = -(event.clientY / window.innerHeight) * 2 + 1;
                this.engine.camera.setMouseParallax(x, y);
            });
        }

        window.addEventListener('codeverse:loaded', () => this.onLoaded());

        await this.preloader.start();
    }

    onLoaded() {
        if (this.failed) return;

        this.ui.hideLoader();

        this.sceneManager.initWorlds();

        this.engine.start();

        this.isReady = true;

        this.tick();

        console.log('CODEVERSE: Phase 12 ready. Responsive and accessibility layer active.');
    }

    tick() {
        if (!this.isReady) return;

        this.scroll.update();

        this.engine.camera.update(this.scroll.progress, this.engine.time.delta);
        this.sceneManager.updateWorlds(this.scroll.progress, this.engine.time.delta);
        this.ui.update(this.scroll.progress);

        this.audio.update(this.engine.time.delta, this.scroll.progress);

        requestAnimationFrame(() => this.tick());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.codeverse = new Codeverse();
});