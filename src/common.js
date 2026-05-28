const fs = require('fs');
const path = require('path');

const OUTPUT_POSTS = 'xhs_posts.jsonl';
const FAILED_FILE = 'failed.json';
const RUN_LOG = 'run_log.md';
const ARTIFACT_DIR = 'artifacts';

const RISK_PATTERNS = [
  /captcha/i,
  /验证码/,
  /验证/,
  /安全验证/,
  /登录已过期/,
  /请登录/,
  /重新登录/,
  /异常流量/,
  /访问过于频繁/,
  /操作过于频繁/,
  /当前访问环境异常/,
  /risk/i,
  /verify/i,
  /verification/i,
  /too frequent/i,
  /abnormal traffic/i,
  /access denied/i
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function appendLog(message) {
  const line = `- ${nowIso()} ${message}\n`;
  fs.appendFileSync(RUN_LOG, line, 'utf8');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function humanDelay(rangeMs, label) {
  const delayMs = randInt(rangeMs.min, rangeMs.max);
  appendLog(`${label}: waiting ${Math.round(delayMs / 1000)}s`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function readCompletedIndices(file = OUTPUT_POSTS) {
  const completed = new Set();
  if (!fs.existsSync(file)) return completed;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      if (Number.isInteger(record.index)) completed.add(record.index);
    } catch {
      appendLog(`Warning: ignored invalid JSONL line in ${file}`);
    }
  }
  return completed;
}

function appendPost(record, file = OUTPUT_POSTS) {
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
}

function readFailures(file = FAILED_FILE) {
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeFailure(index, failure, file = FAILED_FILE) {
  const failures = readFailures(file);
  failures[index] = {
    ...(failures[index] || {}),
    ...failure,
    updated_at: nowIso()
  };
  fs.writeFileSync(file, `${JSON.stringify(failures, null, 2)}\n`, 'utf8');
}

async function detectRisk(page) {
  const url = page.url();
  const title = await page.title().catch(() => '');
  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  const combined = `${url}\n${title}\n${bodyText}`;
  if (!normalizeText(bodyText)) {
    return { detected: true, reason: 'blank or unreadable page' };
  }
  for (const pattern of RISK_PATTERNS) {
    if (pattern.test(combined)) {
      return { detected: true, reason: `risk-control text matched ${pattern}` };
    }
  }
  return { detected: false, reason: null };
}

async function stopIfRisk(page, context) {
  const risk = await detectRisk(page);
  if (!risk.detected) return;
  appendLog(`STOP: ${context}: ${risk.reason}`);
  const error = new Error(`${context}: ${risk.reason}`);
  error.risk = true;
  throw error;
}

async function saveFailureArtifacts(page, index, query, reason) {
  ensureDir(ARTIFACT_DIR);
  const safeTime = nowIso().replace(/[:.]/g, '-');
  const base = path.join(ARTIFACT_DIR, `${String(index).padStart(3, '0')}-${safeTime}`);
  await page.screenshot({ path: `${base}.png`, fullPage: true }).catch(() => null);
  const html = await page.content().catch(() => '');
  fs.writeFileSync(`${base}.html`, html, 'utf8');
  fs.writeFileSync(
    `${base}.json`,
    `${JSON.stringify({ index, query, reason, url: page.url(), timestamp: nowIso() }, null, 2)}\n`,
    'utf8'
  );
  appendLog(`Saved failure artifacts for index ${index}: ${base}.*`);
}

module.exports = {
  ARTIFACT_DIR,
  FAILED_FILE,
  OUTPUT_POSTS,
  RUN_LOG,
  appendLog,
  appendPost,
  humanDelay,
  normalizeText,
  nowIso,
  parseArgs,
  readCompletedIndices,
  saveFailureArtifacts,
  stopIfRisk,
  writeFailure
};
