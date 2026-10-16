import { beforeEach } from 'vitest';

import { mockViewport } from './viewport';

// jsdom не має ResizeObserver і pointer capture, без них падають примітиви Radix
globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
};
Element.prototype.hasPointerCapture = () => false;
Element.prototype.releasePointerCapture = () => {};
Element.prototype.scrollIntoView = () => {};

beforeEach(() => {
    mockViewport(false);
});
