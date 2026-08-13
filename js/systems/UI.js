/**
 * CODEVERSE - UI System
 */
import { clamp01 } from '../utils/helpers.js';

export default class UI {
    constructor() {
        this.loader = document.getElementById('loader');
        this.loaderStatus = document.querySelector('[data-status]');
        this.loaderBar = document.querySelector('[data-progress]');
        this.loaderPercentage = document.querySelector('[data-percentage]');

        this.chapterUI = document.getElementById('chapter-ui');
        this.cues = [];
        this.cueItems = [];

        this.progressBar = document.querySelector('[data-progress-bar]');

        this.muteButton = document.querySelector('[data-action="mute"]');

        this.skipLink = document.querySelector('[data-action="skip-experience"]');
        this.summary = document.getElementById('accessible-summary');
        this.summaryTitle = document.getElementById('accessible-summary-title');
        this.summaryClose = document.querySelector('[data-action="close-summary"]');
        this.summaryMessage = document.querySelector('[data-fallback-message]');
        this.chapterNavButtons = Array.from(
            document.querySelectorAll('[data-scroll-progress]')
        );

        this.arenaPanel = document.getElementById('arena-panel');
        this.arenaTitle = document.querySelector('[data-arena-title]');
        this.arenaRole = document.querySelector('[data-arena-role]');
        this.arenaDesc = document.querySelector('[data-arena-desc]');
        this.arenaTopics = document.querySelector('[data-arena-topics]');
        this.arenaCloseButton = document.querySelector('[data-action="close-arena"]');

        this.portfolioPanel = document.getElementById('portfolio-panel');
        this.portfolioTitle = document.querySelector('[data-portfolio-title]');
        this.portfolioCategory = document.querySelector('[data-portfolio-category]');
        this.portfolioDesc = document.querySelector('[data-portfolio-desc]');
        this.portfolioTech = document.querySelector('[data-portfolio-tech]');
        this.portfolioDemoLink = document.querySelector('[data-portfolio-demo]');
        this.portfolioCodeLink = document.querySelector('[data-portfolio-code]');
        this.portfolioCloseButton = document.querySelector('[data-action="close-portfolio"]');

        this.arenaData = new Map();
        this.portfolioData = new Map();

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (this.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }

        this.handleEngineError = (event) => {
            const message =
                event && event.detail && event.detail.message
                    ? event.detail.message
                    : 'A rendering error occurred. Please reload the page.';

            this.hideLoader();
            this.showFallback(message);
        };

        window.addEventListener('codeverse:engine-error', this.handleEngineError);

        this.bindCorePanels();
        this.bindAccessibility();
    }

    bindCorePanels() {
        if (this.arenaCloseButton) {
            this.arenaCloseButton.addEventListener('click', () => {
                this.hideArenaPanel();
            });
        }

        if (this.portfolioCloseButton) {
            this.portfolioCloseButton.addEventListener('click', () => {
                this.hidePortfolioPanel();
            });
        }
    }

    bindAccessibility() {
        if (this.skipLink) {
            this.skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.openSummary();
            });
        }

        if (this.summaryClose) {
            this.summaryClose.addEventListener('click', () => {
                this.closeSummary();
            });
        }

        this.chapterNavButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const progress = parseFloat(
                    button.getAttribute('data-scroll-progress') || '0'
                );

                this.scrollToProgress(progress);
                this.closeSummary();
            });
        });

        window.addEventListener('keydown', (event) => {
            if (
                event.key === 'Escape' &&
                this.summary &&
                this.summary.classList.contains('open')
            ) {
                this.closeSummary();
            }
        });
    }

    scrollToProgress(progress) {
        const clamped = clamp01(progress);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        window.scrollTo({
            top: maxScroll * clamped,
            behavior: this.reducedMotion ? 'auto' : 'smooth'
        });
    }

    openSummary(message = null) {
        if (!this.summary) return;

        if (message && this.summaryMessage) {
            this.summaryMessage.textContent = message;
        }

        this.summary.classList.add('open');
        this.summary.setAttribute('aria-hidden', 'false');

        if (this.summaryTitle) {
            this.summaryTitle.focus({ preventScroll: true });
        }
    }

    closeSummary() {
        if (!this.summary) return;

        this.summary.classList.remove('open');
        this.summary.setAttribute('aria-hidden', 'true');

        if (this.skipLink) {
            this.skipLink.focus({ preventScroll: true });
        }
    }

    showFallback(message) {
        this.openSummary(message);
    }

    setAudioState(enabled) {
        if (!this.muteButton) return;

        this.muteButton.textContent = enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
        this.muteButton.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }

    updateLoader(progress, statusText = '') {
        const clampedProgress = Math.min(Math.max(progress, 0), 100);

        if (this.loaderBar) {
            this.loaderBar.style.width = `${clampedProgress}%`;
        }

        if (this.loaderPercentage) {
            this.loaderPercentage.textContent = `${Math.round(clampedProgress)}%`;
        }

        if (this.loaderStatus && statusText) {
            this.loaderStatus.textContent = statusText;
        }
    }

    hideLoader() {
        if (this.loader) {
            this.loader.classList.add('hidden');
        }

        document.body.classList.add('is-ready');
    }

    setCues(cues) {
        if (!this.chapterUI) return;

        this.chapterUI.innerHTML = '';
        this.cues = cues;
        this.cueItems = [];

        this.cues.forEach((cue) => {
            const element = document.createElement('div');
            element.className = `cue cue--${cue.type || 'statement'}`;
            element.setAttribute('aria-hidden', 'true');

            const content = document.createElement('div');
            content.className = 'cue-content';
            content.textContent = cue.text;

            element.appendChild(content);
            this.chapterUI.appendChild(element);

            this.cueItems.push({
                cue,
                element,
                content
            });
        });
    }

    getAlpha(progress, cue) {
        if (progress < cue.start || progress > cue.end) {
            return 0;
        }

        const fadeIn = cue.fadeIn ?? 0.006;
        const fadeOut = cue.fadeOut ?? 0.006;

        if (fadeIn > 0 && progress < cue.start + fadeIn) {
            return clamp01((progress - cue.start) / fadeIn);
        }

        if (fadeOut > 0 && progress > cue.end - fadeOut) {
            return clamp01((cue.end - progress) / fadeOut);
        }

        return 1;
    }

    update(progress) {
        if (this.progressBar) {
            this.progressBar.style.transform = `scaleX(${clamp01(progress)})`;
        }

        if (!this.chapterUI) return;

        this.cueItems.forEach(({ cue, element, content }) => {
            const alpha = this.getAlpha(progress, cue);
            const visible = alpha > 0.001;

            element.style.opacity = alpha;
            element.style.visibility = visible ? 'visible' : 'hidden';
            element.setAttribute('aria-hidden', visible ? 'false' : 'true');

            if (!this.reducedMotion) {
                content.style.transform = `translateY(${(1 - alpha) * 22}px)`;

                if (alpha < 0.999) {
                    content.style.filter = `blur(${(1 - alpha) * 3}px)`;
                } else {
                    content.style.filter = 'none';
                }
            } else {
                content.style.transform = 'none';
                content.style.filter = 'none';
            }
        });
    }

    setArenaData(dataArray) {
        this.arenaData.clear();

        dataArray.forEach((item) => {
            this.arenaData.set(item.id, item);
        });
    }

    setPortfolioData(dataArray) {
        this.portfolioData.clear();

        dataArray.forEach((item) => {
            this.portfolioData.set(item.id, item);
        });
    }

    showArenaPanel(languageId) {
        if (!this.arenaPanel) return;

        const data = this.arenaData.get(languageId);

        if (!data) return;

        this.hidePortfolioPanel();

        if (this.arenaTitle) {
            this.arenaTitle.textContent = data.name;
        }

        if (this.arenaRole) {
            this.arenaRole.textContent = data.role;
        }

        if (this.arenaDesc) {
            this.arenaDesc.textContent = data.description;
        }

        if (this.arenaTopics) {
            this.arenaTopics.innerHTML = '';

            data.topics.forEach((topic) => {
                const li = document.createElement('li');
                li.textContent = topic;
                this.arenaTopics.appendChild(li);
            });
        }

        this.arenaPanel.classList.add('open');
        this.arenaPanel.setAttribute('aria-hidden', 'false');
    }

    hideArenaPanel() {
        if (!this.arenaPanel) return;

        this.arenaPanel.classList.remove('open');
        this.arenaPanel.setAttribute('aria-hidden', 'true');
    }

    showPortfolioPanel(projectId) {
        if (!this.portfolioPanel) return;

        const data = this.portfolioData.get(projectId);

        if (!data) return;

        this.hideArenaPanel();

        if (this.portfolioTitle) {
            this.portfolioTitle.textContent = data.name;
        }

        if (this.portfolioCategory) {
            this.portfolioCategory.textContent = data.category;
        }

        if (this.portfolioDesc) {
            this.portfolioDesc.textContent = data.description;
        }

        if (this.portfolioTech) {
            this.portfolioTech.innerHTML = '';

            data.tech.forEach((tech) => {
                const li = document.createElement('li');
                li.textContent = tech;
                this.portfolioTech.appendChild(li);
            });
        }

        if (this.portfolioDemoLink && data.links) {
            this.portfolioDemoLink.href = data.links.demo || '#';
        }

        if (this.portfolioCodeLink && data.links) {
            this.portfolioCodeLink.href = data.links.code || '#';
        }

        this.portfolioPanel.classList.add('open');
        this.portfolioPanel.setAttribute('aria-hidden', 'false');
    }

    hidePortfolioPanel() {
        if (!this.portfolioPanel) return;

        this.portfolioPanel.classList.remove('open');
        this.portfolioPanel.setAttribute('aria-hidden', 'true');
    }
}