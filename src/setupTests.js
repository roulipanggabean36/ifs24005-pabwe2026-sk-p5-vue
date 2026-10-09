import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { config } from "@vue/test-utils";

// ---- Mock DOM API yang tidak tersedia di jsdom ----
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.scrollTo = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

URL.createObjectURL = vi.fn(() => "blob:mock-url");
URL.revokeObjectURL = vi.fn();

// ---- Konfigurasi global Vue Test Utils ----
config.global.stubs = {
  transition: false,
  "transition-group": false,
};

// ---- Bersihkan state antar test ----
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.body.innerHTML = "";
  vi.clearAllMocks();
});