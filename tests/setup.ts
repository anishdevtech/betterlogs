import { beforeEach, afterEach, vi } from 'vitest';

// Store original console methods
const originalConsole = { ...console };

beforeEach(() => {
  // Mock console methods
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'table').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});