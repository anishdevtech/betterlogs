import { describe, it, expect, vi } from 'vitest';
import betterlogs, { patchConsole, unpatchConsole } from '../src';

describe('Console Patching', () => {
  it('should intercept console methods and redirect to betterlogs', () => {
    const infoSpy = vi.spyOn(betterlogs, 'info').mockImplementation(() => {});
    const errorSpy = vi.spyOn(betterlogs, 'error').mockImplementation(() => {});

    patchConsole(betterlogs as any);

    console.log('Intercepted info message');
    expect(infoSpy).toHaveBeenCalledWith('Intercepted info message');

    console.error('Intercepted error message');
    expect(errorSpy).toHaveBeenCalledWith('Intercepted error message');

    unpatchConsole();

    infoSpy.mockClear();
    // After unpatching, console.log should not call betterlogs.info
    console.log('Normal console log');
    expect(infoSpy).not.toHaveBeenCalled();

    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
