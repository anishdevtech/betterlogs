import log, { DiscordTransport } from './src/index';

// 1. Setup Discord Transport (reads from env or uses mock)
const webhookUrl =
  process.env.DISCORD_WEBHOOK_URL ||
  'https://discord.com/api/webhooks/1454737463171088579/mock-webhook-token';

const discordLayer = new DiscordTransport({
  webhookUrl,
  filter: {
    minLevel: 'error', // Standard errors go to Discord
    includeLevels: ['critical'] // Our custom 'critical' level goes too
  }
});

log.addTransport(discordLayer);

// 2. Add a custom level for testing
log.addLevel('critical', { color: 'red', emoji: '🔥' });

async function runTests() {
  console.log('--- Starting Tests ---');

  // TEST A: Standard Info -> Should be IGNORED by Discord
  log.info('1. This is just an info log. It should NOT be on Discord.');

  // TEST B: Standard Error -> Should be SENT to Discord
  log.error('2. Database connection failed!', { attempt: 3, host: '127.0.0.1' });

  // TEST C: Success with Override -> Should be SENT (Forced)
  log
    .with({ discord: true, requestId: 'req_abc123' })
    .success('3. Payment received! (Forced to Discord)');

  // TEST D: Error with Override -> Should be IGNORED (Muted)
  log.with({ discord: false }).error('4. User cancelled upload (Muted from Discord)');

  // TEST E: Custom Critical Level -> Should be SENT
  const dynamicLog = log as unknown as Record<string, (msg: string) => void>;
  dynamicLog.critical('5. SYSTEM MELTDOWN! (Custom critical level)');

  console.log('--- Tests Finished ---');
}

runTests();
