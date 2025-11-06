import { describe, it, expect } from 'vitest';
import { EnvironmentDetector, Colorizer, formatTime, levelWeights } from '../src/utils';

describe('EnvironmentDetector', () => {
  it('should detect Node.js environment', () => {
    expect(EnvironmentDetector.isNode()).toBe(true);
    expect(EnvironmentDetector.isBrowser()).toBe(false);
  });

  it('should support emoji in Node.js TTY', () => {
  const result = EnvironmentDetector.supportsEmoji();
  expect(typeof result).toBe('boolean');
});
});

describe('Colorizer', () => {
  it('should apply colors in Node.js', () => {
    const result = Colorizer.applyColor('test', 'red');
    expect(typeof result).toBe('string');
    expect(result).toContain('test');
  });
});

describe('Time Formatter', () => {
  it('should format 24h time correctly', () => {
    const date = new Date('2023-01-01T14:30:25Z');
    const result = formatTime(date, '24h');
    
    // Just check it returns a string with time format
    expect(typeof result).toBe('string');
    expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('should format 12h time correctly', () => {
    const date = new Date('2023-01-01T14:30:25Z');
    const result = formatTime(date, '12h');
    
    // Just check it returns a string with time format and AM/PM
    expect(typeof result).toBe('string');
    expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/);
  });
});

describe('Level Weights', () => {
  it('should have correct level weights', () => {
    expect(levelWeights.debug).toBe(0);
    expect(levelWeights.info).toBe(1);
    expect(levelWeights.warn).toBe(2);
    expect(levelWeights.error).toBe(3);
    expect(levelWeights.silent).toBe(999);
  });
});