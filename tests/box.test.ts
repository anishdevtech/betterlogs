import { describe, it, expect } from 'vitest';
import { BoxDrawer } from '../src/box';

describe('BoxDrawer', () => {
  it('should draw a simple rounded box', () => {
    const output = BoxDrawer.draw('Hello World', { borderStyle: 'rounded' });
    expect(output).toContain('╭');
    expect(output).toContain('╮');
    expect(output).toContain('Hello World');
    expect(output).toContain('╰');
    expect(output).toContain('╯');
  });

  it('should support box with title and double border style', () => {
    const output = BoxDrawer.draw('Server started on port 3000', {
      title: 'Deployment',
      borderStyle: 'double'
    });
    expect(output).toContain('╔');
    expect(output).toContain('Deployment');
    expect(output).toContain('Server started on port 3000');
    expect(output).toContain('╝');
  });

  it('should handle multi-line content in box', () => {
    const text = 'Line 1\nLine 2 is longer\nLine 3';
    const output = BoxDrawer.draw(text, { padding: 2 });
    expect(output).toContain('Line 1');
    expect(output).toContain('Line 2 is longer');
    expect(output).toContain('Line 3');
  });
});
