const fs = require('fs');
const { chromium } = require('playwright');
const {
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
} = require('./common');

const STORAGE_STATE = 'storage_state.json';
const HOME_URL = 'https://www.xiaohongshu.com/explore';
const AUTHOR = '芭比汤淇';
const SERIES = '顶级金丝雀的恨海情天';
const SAMPLE_TERMS = ['顶级金丝雀', '恨海情天', '金丝雀'];
const SAMPLE_OUTPUT = 'sample_posts.jsonl';
const DRY_RUN_CANDIDATES_OUTPUT = 'dry_run_candidates.jsonl';

function rangeMs(value, fallback) {
  if (!value) return fallback;
  const [minSec, maxSec] = String(value).split('-').map((part) => Number(part.trim()));
  if (!Number.isFinite(minSec) || !Number.isFinite(maxSec) || minSec < 0 || maxSec < minSec) {
    throw new Error(`Invalid delay range: ${value}. Use seconds like 20-60.`);
  }
  return { min: minSec * 1000, max: maxSec * 1000 };
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function delayRangeFromArgs(args, minKey, maxKey, fallback) {
  const min = parseNumber(args[minKey], fallback.min / 1000);
  const max = parseNumber(args[maxKey], fallback.max / 1000);
  if (min < 0 || max < min) throw new Error(`Invalid delay range: --${minKey} / --${maxKey}`);
  return { min: min * 1000, max: max * 1000 };
}

function appendJsonl(file, record) {
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function normalizeDedupText(value) {
  return normalizeText(value).toLowerCase();
}

function exactIndexPattern(index) {
  const escaped = String(index).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^0-9０-９])${escaped}([^0-9０-９]|$)`);
}

function exactTitlePattern(index) {
  const escaped = String(index).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${SERIES}\\s*[（(]\\s*${escaped}\\s*[）)]`);
}

function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    for (const key of ['xsec_token', 'xhsshare', 'appuid', 'apptime', 'share_id', 'code', 'state']) {
      parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function publicCandidate(candidate) {
  return {
    url: sanitizeUrl(candidate.url),
    text: candidate.text.slice(0, 160),
    hasAuthor: candidate.hasAuthor,
    hasSeries: candidate.hasSeries,
    hasIndex: candidate.hasIndex,
    hasExactTitle: candidate.hasExactTitle
  };
}

function publicSampleCandidate(candidate) {
  const { raw_url, ...publicRecord } = candidate;
  return publicRecord;
}

function hasSampleTerm(text) {
  return SAMPLE_TERMS.some((term) => text.includes(term));
}

function classifySeriesConfidence(text) {
  if (text.includes('顶级金丝雀') && text.includes('恨海情天')) return 'high';
  if (hasSampleTerm(text)) return 'medium';
  return 'low';
}

function classifyAuthorConfidence(text) {
  if (text.includes(AUTHOR)) return 'matched';
  return 'unknown';
}

function inferIndex(text) {
  const patterns = [
    /顶级金丝雀的恨海情天\s*[（(]?\s*(\d{1,3})\s*[）)]?/g,
    /顶级金丝雀\s*恨海情天\s*[（(]?\s*(\d{1,3})\s*[）)]?/g
  ];
  const values = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value = Number(match[1]);
      if (Number.isInteger(value)) values.add(value);
    }
  }
  return values.size === 1 ? [...values][0] : null;
}

function sampleId() {
  return `sample-${nowIso().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
}

async function gotoHome(page) {
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
}

async function gotoCollection(page, collectionUrl) {
  await page.goto(collectionUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
  await stopIfRisk(page, 'after opening collection');
}

async function scrollCollectionForIndex(page, index, maxScrolls) {
  for (let attempt = 0; attempt <= maxScrolls; attempt += 1) {
    const text = normalizeText(await page.locator('body').innerText({ timeout: 5000 }).catch(() => ''));
    if (exactTitlePattern(index).test(text)) return true;
    if (attempt === maxScrolls) break;
    await page.mouse.wheel(0, 900);
    await humanDelay({ min: 1200, max: 2600 }, 'scrolling collection');
    await stopIfRisk(page, 'while scrolling collection');
  }
  return false;
}

async function findSearchInput(page) {
  const candidates = [
    page.getByPlaceholder(/搜索|Search/i).first(),
    page.getByRole('searchbox').first(),
    page.locator('[aria-label*="搜索"], [aria-label*="Search"]').first(),
    page.locator('textarea[placeholder*="搜索"], textarea[placeholder*="Search"]').first(),
    page.locator('textarea:visible').first(),
    page.locator('input[type="search"]').first(),
    page.locator('input[placeholder*="搜索"], input[placeholder*="Search"]').first(),
    page.locator('[contenteditable="true"]').first(),
    page.locator('[class*="search"] input, [class*="Search"] input').first(),
    page.locator('input:visible').first()
  ];
  for (const locator of candidates) {
    if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) return locator;
  }
  throw new Error('Could not find visible search input');
}

async function submitSearch(page, query) {
  await stopIfRisk(page, 'before search');
  const input = await findSearchInput(page);
  await input.click();
  await input.fill(query);
  await humanDelay({ min: 1200, max: 2800 }, 'after typing search query');
  await input.press('Enter');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => null);
  await page.waitForTimeout(4000);
  await stopIfRisk(page, 'after search');
}

async function candidateFromAnchor(anchor, index) {
  const href = await anchor.getAttribute('href').catch(() => null);
  const text = normalizeText(await anchor.innerText({ timeout: 3000 }).catch(() => ''));
  if (!href || !text) return null;

  const url = href.startsWith('http') ? href : new URL(href, 'https://www.xiaohongshu.com').toString();
  if (!url.includes('/search_result/') && !url.includes('/explore/')) return null;
  const hasAuthor = text.includes(AUTHOR);
  const hasSeries = text.includes(SERIES);
  const hasExactTitle = exactTitlePattern(index).test(text);
  const hasIndex = hasExactTitle || exactIndexPattern(index).test(text);
  return { url, text, hasAuthor, hasSeries, hasIndex, hasExactTitle };
}

async function sampleCandidateFromAnchor(anchor, rank, sampleQuery) {
  const href = await anchor.getAttribute('href').catch(() => null);
  const anchorText = normalizeText(await anchor.innerText({ timeout: 3000 }).catch(() => ''));
  if (!href || !anchorText) return null;

  const url = href.startsWith('http') ? href : new URL(href, 'https://www.xiaohongshu.com').toString();
  if (!url.includes('/search_result/') && !url.includes('/explore/')) return null;

  const visibleText = normalizeText(await anchor.evaluate((el) => {
    const container = el.closest('section, article, div');
    return (container && container.innerText) || el.innerText || '';
  }).catch(() => anchorText));
  const candidateText = visibleText || anchorText;
  const seriesConfidence = classifySeriesConfidence(candidateText);
  const authorConfidence = classifyAuthorConfidence(candidateText);
  const candidateAuthor = authorConfidence === 'matched' ? AUTHOR : null;
  let decision = 'selected';
  let decisionReason = 'visible text matches sample terms';

  if (seriesConfidence === 'low') {
    decision = 'rejected';
    decisionReason = 'missing sample series terms';
  } else if (authorConfidence === 'mismatch') {
    decision = 'rejected';
    decisionReason = 'visible author mismatch';
  }

  return {
    sample_query: sampleQuery,
    candidate_rank: rank,
    candidate_title_or_text: candidateText.slice(0, 500),
    candidate_author: candidateAuthor,
    candidate_url: sanitizeUrl(url),
    raw_url: url,
    series_confidence: seriesConfidence,
    author_confidence: authorConfidence,
    decision,
    decision_reason: decisionReason,
    observed_at: nowIso()
  };
}

async function findCandidates(page, index, candidateLimit) {
  const anchors = await page.locator('a[href]').all();
  const seen = new Set();
  const candidates = [];
  for (const anchor of anchors.slice(0, 120)) {
    const candidate = await candidateFromAnchor(anchor, index);
    if (!candidate || seen.has(candidate.url)) continue;
    seen.add(candidate.url);
    if (candidate.hasSeries || candidate.hasAuthor) candidates.push(candidate);
    if (candidates.length >= candidateLimit) break;
  }
  return candidates.sort((a, b) => {
    const score = (item) => (
      Number(item.hasAuthor) * 5
      + Number(item.hasExactTitle) * 5
      + Number(item.hasSeries) * 3
      + Number(item.hasIndex) * 2
    );
    return score(b) - score(a);
  });
}

async function findSampleCandidates(page, sampleQuery, maxCandidates) {
  const anchors = await page.locator('a[href]').all();
  const seen = new Set();
  const candidates = [];
  let rank = 0;
  for (const anchor of anchors.slice(0, 160)) {
    const candidate = await sampleCandidateFromAnchor(anchor, rank + 1, sampleQuery);
    if (!candidate || seen.has(candidate.candidate_url)) continue;
    seen.add(candidate.candidate_url);
    rank += 1;
    candidate.candidate_rank = rank;
    candidates.push(candidate);
    if (candidates.length >= maxCandidates) break;
  }
  return candidates;
}

function chooseCandidate(candidates, index) {
  const exactTitle = candidates.filter((item) => item.hasExactTitle);
  if (exactTitle.length === 1) return { candidate: exactTitle[0], ambiguous: false };
  if (exactTitle.length > 1) return { candidate: null, ambiguous: true };

  const strong = candidates.filter((item) => item.hasAuthor && item.hasSeries && item.hasIndex);
  if (strong.length === 1) return { candidate: strong[0], ambiguous: false };
  if (strong.length > 1) return { candidate: null, ambiguous: true };

  const fallback = candidates.filter((item) => item.hasAuthor && item.hasSeries);
  if (fallback.length === 1) return { candidate: fallback[0], ambiguous: false };
  return { candidate: null, ambiguous: fallback.length > 1 || candidates.length > 1 };
}

async function openCandidate(context, candidate) {
  const page = await context.newPage();
  await page.goto(candidate.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => null);
  await stopIfRisk(page, 'after opening post');
  return page;
}

async function extractPost(page, index, query) {
  const bodyText = normalizeText(await page.locator('body').innerText({ timeout: 10000 }));
  const content = await extractVisiblePostText(page, bodyText);
  const title = normalizeText(
    await page.locator('h1, [class*="title"], [data-testid*="title"]').first().innerText({ timeout: 3000 }).catch(() => '')
  );
  const author = bodyText.includes(AUTHOR) ? AUTHOR : '';
  const dateMatch = bodyText.match(/(?:\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}日?|\d{1,2}[-/.月]\d{1,2}日?)/);

  if (!author) throw new Error(`Visible author text did not match ${AUTHOR}`);
  if (!content.includes(SERIES) && !bodyText.includes(SERIES)) throw new Error(`Visible text did not contain ${SERIES}`);
  if (!exactTitlePattern(index).test(`${title} ${content} ${bodyText}`)) {
    throw new Error(`Visible text did not contain exact title ${SERIES}（${index}）`);
  }

  return {
    index,
    query,
    title,
    author,
    url: sanitizeUrl(page.url()),
    content,
    publish_date: dateMatch ? dateMatch[0] : null,
    collected_at: nowIso()
  };
}

async function extractSamplePost(page, sampleQuery) {
  const bodyText = normalizeText(await page.locator('body').innerText({ timeout: 10000 }));
  const content = await extractVisiblePostText(page, bodyText);
  const title = normalizeText(
    await page.locator('h1, [class*="title"], [data-testid*="title"]').first().innerText({ timeout: 3000 }).catch(() => '')
  );
  const author = bodyText.includes(AUTHOR) ? AUTHOR : '';
  const combined = `${title} ${content} ${bodyText}`;
  const dateMatch = bodyText.match(/(?:\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2}日?|\d{1,2}[-/.月]\d{1,2}日?)/);

  if (!author) throw new Error(`Visible author text did not match ${AUTHOR}`);
  if (!hasSampleTerm(combined)) throw new Error('Visible text did not contain sample series terms');

  return {
    sample_id: sampleId(),
    inferred_index: inferIndex(combined),
    sample_query: sampleQuery,
    title,
    author,
    url: sanitizeUrl(page.url()),
    content,
    publish_date: dateMatch ? dateMatch[0] : null,
    collected_at: nowIso(),
    collection_mode: 'sample'
  };
}

async function extractVisiblePostText(page, bodyText) {
  const selectors = [
    'article',
    'main',
    '[class*="note-content"]',
    '[class*="noteContent"]',
    '[class*="note-text"]',
    '[class*="noteText"]',
    '[class*="desc"]',
    '[data-testid*="note"]'
  ];

  for (const selector of selectors) {
    const locators = await page.locator(selector).all();
    for (const locator of locators.slice(0, 12)) {
      const text = normalizeText(await locator.innerText({ timeout: 2000 }).catch(() => ''));
      if (text.includes(SERIES) && text.length >= SERIES.length) return stripLikelyComments(text);
    }
  }

  return stripLikelyComments(bodyText);
}

function stripLikelyComments(text) {
  const markers = [
    /\s+共\s*\d+\s*条评论/,
    /\s+\d+\s*条评论/,
    /\s+评论\s*$/,
    /\s+评论\s+点赞/,
    /\s+写评论/,
    /\s+说点什么/
  ];
  let result = text;
  for (const marker of markers) {
    const match = result.match(marker);
    if (match && match.index > 0) result = result.slice(0, match.index);
  }
  return normalizeText(result);
}

async function collectOne(context, searchPage, index, options) {
  const query = `${AUTHOR} ${SERIES} ${index}`;
  if (options.collectionUrl) {
    appendLog(`Index ${index}: scanning collection ${sanitizeUrl(options.collectionUrl)}`);
    try {
      await gotoCollection(searchPage, options.collectionUrl);
      await scrollCollectionForIndex(searchPage, index, options.collectionScrolls);
    } catch (error) {
      writeFailure(index, { query, reason: error.message, stage: 'collection' });
      await saveFailureArtifacts(searchPage, index, query, error.message);
      throw error;
    }
  } else {
    appendLog(`Index ${index}: searching "${query}"`);
    try {
      await gotoHome(searchPage);
      await submitSearch(searchPage, query);
    } catch (error) {
      writeFailure(index, { query, reason: error.message, stage: 'search' });
      await saveFailureArtifacts(searchPage, index, query, error.message);
      throw error;
    }
  }
  const candidates = await findCandidates(searchPage, index, options.candidateLimit);

  if (options.dryRun) {
    appendLog(`Index ${index}: dry-run candidates: ${JSON.stringify(candidates.map(publicCandidate))}`);
    return { status: 'dry-run', candidates };
  }

  const { candidate, ambiguous } = chooseCandidate(candidates, index);
  if (!candidate) {
    const reason = ambiguous ? 'ambiguous candidates' : 'no matching candidates';
    writeFailure(index, { query, reason, candidates: candidates.map(publicCandidate) });
    await saveFailureArtifacts(searchPage, index, query, reason);
    return { status: 'failed', reason };
  }

  await humanDelay(options.openDelayMs, 'before opening post');
  await stopIfRisk(searchPage, 'before opening post');
  const postPage = await openCandidate(context, candidate);
  try {
    await humanDelay(options.postOpenDelayMs, 'after opening post');
    const record = await extractPost(postPage, index, query);
    appendPost(record);
    appendLog(`Index ${index}: collected ${sanitizeUrl(record.url)}`);
    return { status: 'collected', url: record.url };
  } catch (error) {
    writeFailure(index, { query, reason: error.message, candidate: publicCandidate(candidate) });
    await saveFailureArtifacts(postPage, index, query, error.message);
    return { status: 'failed', reason: error.message };
  } finally {
    await postPage.close().catch(() => null);
  }
}

function sampleFailureKey(candidate, reason) {
  return `sample-${candidate ? candidate.candidate_rank : 'none'}-${Date.now()}-${reason}`;
}

function writeSampleFailure(candidate, reason, details, sampleQuery) {
  let failures = {};
  if (fs.existsSync('failed.json')) {
    try {
      failures = JSON.parse(fs.readFileSync('failed.json', 'utf8'));
    } catch {
      failures = {};
    }
  }
  failures[sampleFailureKey(candidate, reason)] = {
    mode: 'sample',
    sample_query: sampleQuery,
    candidate_rank: candidate ? candidate.candidate_rank : null,
    candidate_title_or_text: candidate ? candidate.candidate_title_or_text : null,
    candidate_url: candidate ? candidate.candidate_url : null,
    reason,
    details,
    timestamp: nowIso()
  };
  fs.writeFileSync('failed.json', `${JSON.stringify(failures, null, 2)}\n`, 'utf8');
}

function collectedSampleDedup(sampleOutput) {
  const urls = new Set();
  const texts = new Set();
  for (const file of [sampleOutput, 'xhs_posts.jsonl']) {
    for (const record of readJsonl(file)) {
      if (record.url) urls.add(sanitizeUrl(record.url));
      const title = record.title || record.candidate_title_or_text || '';
      if (title) texts.add(normalizeDedupText(title));
    }
  }
  return { urls, texts };
}

async function runSampleMode(context, searchPage, options) {
  appendLog(`Sample mode started: query="${options.sampleQuery}" maxCandidates=${options.maxCandidates} maxPosts=${options.maxPosts} dryRun=${options.dryRun}`);
  if (options.warmupMs.max > 0) await humanDelay(options.warmupMs, 'sample warmup');

  try {
    await gotoHome(searchPage);
    await submitSearch(searchPage, options.sampleQuery);
  } catch (error) {
    writeSampleFailure(null, error.risk ? 'risk_control' : 'sample_no_candidates', error.message, options.sampleQuery);
    await saveFailureArtifacts(searchPage, 'sample', options.sampleQuery, error.message);
    throw error;
  }

  const candidates = await findSampleCandidates(searchPage, options.sampleQuery, options.maxCandidates);
  const selected = candidates.filter((candidate) => candidate.decision === 'selected');
  const rejected = candidates.filter((candidate) => candidate.decision !== 'selected');
  appendLog(`Sample candidates observed=${candidates.length} selected=${selected.length} rejected=${rejected.length}`);
  appendLog(`Sample selected candidates: ${JSON.stringify(selected.map((candidate) => ({ rank: candidate.candidate_rank, title: candidate.candidate_title_or_text.slice(0, 120), url: candidate.candidate_url })))}`);

  if (options.dryRun) {
    for (const candidate of candidates) appendJsonl(DRY_RUN_CANDIDATES_OUTPUT, publicSampleCandidate(candidate));
    if (candidates.length === 0) writeSampleFailure(null, 'sample_no_candidates', 'No visible candidates found', options.sampleQuery);
    if (candidates.length > 0 && selected.length === 0) writeSampleFailure(null, 'sample_no_selected_candidates', 'No candidates passed sample filters', options.sampleQuery);
    appendLog(`Sample dry-run wrote ${candidates.length} candidates to ${DRY_RUN_CANDIDATES_OUTPUT}`);
    return;
  }

  if (candidates.length === 0) {
    writeSampleFailure(null, 'sample_no_candidates', 'No visible candidates found', options.sampleQuery);
    return;
  }
  if (selected.length === 0) {
    writeSampleFailure(null, 'sample_no_selected_candidates', 'No candidates passed sample filters', options.sampleQuery);
    return;
  }

  const dedup = collectedSampleDedup(options.sampleOutput);
  const openedThisRun = new Set();
  let collected = 0;

  for (const candidate of selected) {
    if (collected >= options.maxPosts) {
      appendLog(`Sample reached max posts per run: ${options.maxPosts}`);
      break;
    }
    const titleKey = normalizeDedupText(candidate.candidate_title_or_text);
    if (dedup.urls.has(candidate.candidate_url) || dedup.texts.has(titleKey) || openedThisRun.has(candidate.candidate_url)) {
      appendLog(`Sample skipped duplicate rank=${candidate.candidate_rank} title="${candidate.candidate_title_or_text.slice(0, 80)}"`);
      continue;
    }
    openedThisRun.add(candidate.candidate_url);

    await humanDelay(options.openDelayMs, 'before opening sample post');
    await stopIfRisk(searchPage, 'before opening sample post');

    let postPage;
    try {
      postPage = await openCandidate(context, { url: candidate.raw_url });
    } catch (error) {
      writeSampleFailure(candidate, error.risk ? 'risk_control' : 'sample_open_failed', error.message, options.sampleQuery);
      appendLog(`Sample failed open rank=${candidate.candidate_rank}: ${error.message}`);
      if (error.risk) throw error;
      continue;
    }

    try {
      await humanDelay(options.postOpenDelayMs, 'after opening sample post');
      const record = await extractSamplePost(postPage, options.sampleQuery);
      appendJsonl(options.sampleOutput, record);
      dedup.urls.add(record.url);
      if (record.title) dedup.texts.add(normalizeDedupText(record.title));
      collected += 1;
      appendLog(`Sample collected rank=${candidate.candidate_rank} title="${record.title}" url=${record.url}`);
      console.log(`sample: collected ${record.url}`);
      if (collected < options.maxPosts) await humanDelay(options.postDelayMs, 'between sample posts');
    } catch (error) {
      const reason = error.message.includes('author') || error.message.includes('sample series terms')
        ? 'sample_verification_failed'
        : 'sample_extraction_failed';
      writeSampleFailure(candidate, reason, error.message, options.sampleQuery);
      await saveFailureArtifacts(postPage, `sample-${candidate.candidate_rank}`, options.sampleQuery, error.message);
      appendLog(`Sample failed extraction rank=${candidate.candidate_rank}: ${error.message}`);
    } finally {
      await postPage.close().catch(() => null);
    }
  }

  appendLog(`Sample mode finished collected=${collected}`);
}

(async () => {
  const args = parseArgs(process.argv);
  const sampleMode = Boolean(args['sample-mode']);
  const start = parseNumber(args.start, 1);
  const end = parseNumber(args.end, 10);
  const maxPosts = parseNumber(args['max-posts'], 10);
  const force = Boolean(args.force);
  const dryRun = Boolean(args['dry-run']);
  const headless = Boolean(args.headless);
  const profileDir = args['profile-dir'] || '';
  const collectionUrl = args['collection-url'] || '';
  const candidateLimit = parseNumber(args['candidate-limit'], collectionUrl ? 120 : 5);
  const collectionScrolls = parseNumber(args['collection-scrolls'], 12);
  const postDelayMs = args['delay-min'] || args['delay-max']
    ? delayRangeFromArgs(args, 'delay-min', 'delay-max', { min: 20000, max: 60000 })
    : rangeMs(args['post-delay'], { min: 20000, max: 60000 });
  const postOpenDelayMs = args['post-open-delay-min'] || args['post-open-delay-max']
    ? delayRangeFromArgs(args, 'post-open-delay-min', 'post-open-delay-max', { min: 10000, max: 25000 })
    : rangeMs(args['open-delay'], { min: 10000, max: 25000 });
  const warmupMs = delayRangeFromArgs(args, 'warmup-min', 'warmup-max', { min: 0, max: 0 });
  const openDelayMs = { min: 2500, max: 6000 };

  if (!profileDir && !fs.existsSync(STORAGE_STATE)) {
    throw new Error(`Missing ${STORAGE_STATE}. Run npm run login first.`);
  }
  if (start > end) throw new Error('--start must be <= --end');
  if (sampleMode && !args['sample-query']) throw new Error('--sample-query is required with --sample-mode');

  appendLog(sampleMode
    ? `Collection started: mode=sample sampleQuery="${args['sample-query']}" maxCandidates=${parseNumber(args['max-candidates'], 30)} maxPosts=${maxPosts} dryRun=${dryRun}`
    : `Collection started: mode=index start=${start} end=${end} maxPosts=${maxPosts} dryRun=${dryRun}`);
  const completed = sampleMode ? new Set() : readCompletedIndices();
  const browser = profileDir ? null : await chromium.launch({ headless, slowMo: 250 });
  const context = profileDir
    ? await chromium.launchPersistentContext(profileDir, { headless, slowMo: 250 })
    : await browser.newContext({ storageState: STORAGE_STATE });
  const searchPage = await context.newPage();

  let processed = 0;
  try {
    if (sampleMode) {
      await runSampleMode(context, searchPage, {
        sampleQuery: args['sample-query'],
        maxCandidates: parseNumber(args['max-candidates'], 30),
        sampleOutput: args['sample-output'] || SAMPLE_OUTPUT,
        maxPosts,
        dryRun,
        warmupMs,
        openDelayMs,
        postOpenDelayMs,
        postDelayMs
      });
      return;
    }

    for (let index = start; index <= end; index += 1) {
      if (processed >= maxPosts) {
        appendLog(`Reached max posts per run: ${maxPosts}`);
        break;
      }
      if (!force && completed.has(index)) {
        appendLog(`Index ${index}: skipped because it already exists in xhs_posts.jsonl`);
        continue;
      }

      const result = await collectOne(context, searchPage, index, {
        dryRun,
        openDelayMs,
        postOpenDelayMs,
        collectionUrl,
        candidateLimit,
        collectionScrolls
      });
      processed += 1;
      console.log(`${index}: ${result.status}${result.url ? ` ${result.url}` : ''}`);
      if (index < end && processed < maxPosts) await humanDelay(postDelayMs, 'between posts');
    }
  } catch (error) {
    appendLog(`STOP: ${error.message}`);
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await searchPage.close().catch(() => null);
    await context.close().catch(() => null);
    if (browser) await browser.close().catch(() => null);
    appendLog('Collection finished');
  }
})();
