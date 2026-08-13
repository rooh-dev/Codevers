/**
 * CODEVERSE - Utility Helpers
 */

export const lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end;
};

export const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
};

export const clamp01 = (value) => {
    return clamp(value, 0, 1);
};

export const map = (value, start1, stop1, start2, stop2) => {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
};

export const rangeProgress = (value, start, end) => {
    if (end <= start) return 0;
    return clamp01((value - start) / (end - start));
};

export const easeOutCubic = (t) => {
    t = clamp01(t);
    return 1 - Math.pow(1 - t, 3);
};

export const easeInOutCubic = (t) => {
    t = clamp01(t);
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutExpo = (t) => {
    t = clamp01(t);
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const getPointer = (e) => {
    return {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
    };
};