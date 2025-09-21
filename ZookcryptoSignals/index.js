import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const {
  BOT_TOKEN,
  OWNER_ID,
  CHANNEL_IDS = '',
  DEFAULT_WALLET = ''
} = process.env;

if (!BOT_TOKEN || !OWNER_ID) {
  console.error('Missing BOT_TOKEN or OWNER_ID in .env');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let channelIds = CHANNEL_IDS
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// --- helpers -------------------------------------------------
const isOwner = (msg) => String(msg.from?.id) === String(OWNER_ID);

function buildSignal({
  name,
  symbol,
  mint,
  ca,
  website,
  twitter,
  telegram,
  wallet = DEFAULT_WALLET,
  dexscreener,
  birdeye,
  pumpfun
}) {
  const caStr = ca || mint || '';
  const links = [
    pumpfun ? `🔴 PumpFun: ${pumpfun}` : null,
    dexscreener ? `📊 DexScreener: ${dexscreener}` : null,
    birdeye ? `🟡 Birdeye: ${birdeye}` : null,
    website ? `🌐 Website: ${website}` : null,
    twitter ? `🐦 X: ${twitter}` : null,
    telegram ? `✈️ TG: ${telegram}` : null
  ].filter(Boolean).join('\n');

  return [
    `🚀 *LAUNCH LIVE*`,
    `*${name || 'New Token'}* ${symbol ? `(${symbol})` : ''}`,
    caStr ? `\n*CA:* \`${caStr}\`` : '',
    wallet ? `\n*Creator:* \`${wallet}\`` : '',
    links ? `\n${links}` : ''
  ].join('\n');
}

async function sendToChannels(text, extra) {
  const results = [];
  for (const id of channelIds) {
    try {
      const res = await bot.sendMessage(id, text, {
        ...extra,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });
      results.push({ id, ok: true });
    } catch (e) {
      results.push({ id, ok: false, err: e.message });
    }
  }
  return results;
}

// --- commands ------------------------------------------------
// /test -> verify posting works
bot.onText(/^\/test\b/i, async (msg) => {
  if (!isOwner(msg)) return;
  const res = await sendToChannels('✅ Test OK — bot can post here.');
  const fail = res.filter(r => !r.ok);
  await bot.sendMessage(msg.chat.id,
    fail.length ? `Some channels failed:\n${fail.map(f=>`${f.id}: ${f.err}`).join('\n')}` :
    'All target channels OK.');
});

// /setchannels -1001,-1002
bot.onText(/^\/setchannels\s+(.+)/i, async (msg, m) => {
  if (!isOwner(msg)) return;
  const list = m[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (!list.length) {
    return bot.sendMessage(msg.chat.id, 'Provide comma-separated channel IDs.');
  }
  channelIds = list;
  await bot.sendMessage(msg.chat.id, `Saved ${channelIds.length} channel(s).`);
});

// /signal name=CAT symbol=MEOW mint=... pumpfun=... dexscreener=... birdeye=... website=... twitter=... telegram=...
bot.onText(/^\/signal\b(?:\s+(.+))?/i, async (msg, m) => {
  if (!isOwner(msg)) return;
  const argline = m[1] || '';
  // parse key=value pairs
  const args = {};
  for (const part of argline.match(/(\w+)=("[^"]+"|\S+)/g) || []) {
    const [k, v] = part.split('=');
    args[k.toLowerCase()] = v.replace(/^"|"$/g, '');
  }

  // allow quick reply usage: if reply has a CA string, use it as mint
  if (!args.mint && msg.reply_to_message?.text) {
    const ca = (msg.reply_to_message.text.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/) || [])[0];
    if (ca) args.mint = ca;
  }

  const text = buildSignal(args);
  const res = await sendToChannels(text);
  const fail = res.filter(r => !r.ok);
  await bot.sendMessage(msg.chat.id,
    fail.length ? `Sent with errors:\n${fail.map(f=>`${f.id}: ${f.err}`).join('\n')}` :
    'Signal sent to all channels ✅');
});

// Friendly help
bot.onText(/^\/start|^\/help/i, (msg) => {
  if (!isOwner(msg)) return;
  const help = [
    '*Commands*',
    '/test — post a test message to all channels',
    '/setchannels -1001111111111,-1002222222222 — set target channels',
    '/signal key=value ... — send a launch signal',
    '',
    '*Examples*',
    '/signal name="Zook" symbol=ZK mint=XXXX pumpfun=https://pump.fun/XXXX dexscreener=https://dexscreener.com/... birdeye=https://birdeye.so/token/XXXX',
    'Tip: reply to a message containing the CA, then run /signal to auto-capture it.'
  ].join('\n');
  bot.sendMessage(msg.chat.id, help, { parse_mode: 'Markdown' });
});

console.log('Bot running. Commands: /test /setchannels /signal');