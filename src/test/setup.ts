import "@testing-library/jest-dom/vitest";

Object.defineProperty(globalThis.navigator, "geolocation", {
  value: {
    getCurrentPosition: () => undefined,
  },
  configurable: true,
});
