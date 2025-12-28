import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordTransport } from '../src/transports';
import { LogEntry } from '../src/types';

global.fetch = vi.fn();

describe('DiscordTransport', () => {
    const dummyUrl = 'https://discord.com/api/webhooks/test';
    
    beforeEach(() => {
        vi.mocked(global.fetch).mockClear();
        vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
    });

    it('should send logs meeting criteria', async () => {
        const transport = new DiscordTransport({ 
            webhookUrl: dummyUrl,
            filter: { minLevel: 'error' }
        });

        const entry: LogEntry = {
            level: 'error',
            message: 'Fail',
            timestamp: new Date()
        };

        await transport.log(entry);
        expect(global.fetch).toHaveBeenCalledWith(dummyUrl, expect.any(Object));
    });

    it('should skip logs below level', async () => {
        const transport = new DiscordTransport({ 
            webhookUrl: dummyUrl,
            filter: { minLevel: 'error' }
        });

        const entry: LogEntry = {
            level: 'info',
            message: 'Hello',
            timestamp: new Date()
        };

        await transport.log(entry);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle "with" metadata overrides', async () => {
        const transport = new DiscordTransport({ webhookUrl: dummyUrl });

        // Force Send Info
        await transport.log({
            level: 'info',
            message: 'Force',
            timestamp: new Date(),
            meta: { discord: true }
        });
        expect(global.fetch).toHaveBeenCalledTimes(1);

        vi.mocked(global.fetch).mockClear();

        // Force Mute Error
        await transport.log({
            level: 'error',
            message: 'Mute',
            timestamp: new Date(),
            meta: { discord: false }
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
