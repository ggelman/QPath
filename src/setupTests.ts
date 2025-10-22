import "@testing-library/jest-dom/vitest";

// Provide basic mocks for browser APIs not implemented in jsdom
if (!window.ResizeObserver) {
  class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {
      // noop
    }
    unobserve() {
      // noop
    }
    disconnect() {
      // noop
    }
  }
  // @ts-expect-error Assigning to readonly property for test environment
  window.ResizeObserver = ResizeObserver;
}

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
