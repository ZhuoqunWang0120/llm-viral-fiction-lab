const { chromium } = require('playwright');
const { appendLog } = require('./common');

const STORAGE_STATE = 'storage_state.json';
const HOME_URL = 'https://www.xiaohongshu.com/explore';

(async () => {
  appendLog('Login session started');
  const browser = await chromium.launch({ headless: false, slowMo: 250 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening RedNote/Xiaohongshu in headed Chromium.');
  console.log('Log in manually, then return here and press Enter. Cookies/tokens will not be printed.');
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  process.stdin.setEncoding('utf8');
  process.stdin.resume();
  await new Promise((resolve) => process.stdin.once('data', resolve));

  await context.storageState({ path: STORAGE_STATE });
  appendLog(`Storage state saved to ${STORAGE_STATE}`);
  console.log(`Saved login storage state to ${STORAGE_STATE}.`);
  await browser.close();
})().catch(async (error) => {
  appendLog(`Login failed: ${error.message}`);
  console.error(error.message);
  process.exit(1);
});
