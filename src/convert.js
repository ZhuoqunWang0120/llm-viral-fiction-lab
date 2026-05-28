const fs = require('fs');

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

const args = parseArgs(process.argv);
const INPUT = args.input || 'xhs_posts.jsonl';
const OUTPUT = args.output || 'chatgpt_input.md';

function readPosts() {
  if (!fs.existsSync(INPUT)) return [];
  return fs.readFileSync(INPUT, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, lineNumber) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSON on ${INPUT}:${lineNumber + 1}: ${error.message}`);
      }
    })
    .sort((a, b) => Number(a.index || a.inferred_index || 0) - Number(b.index || b.inferred_index || 0));
}

const posts = readPosts();
const isSample = posts.some((post) => post.collection_mode === 'sample') || INPUT.includes('sample');
const chunks = [isSample ? '# RedNote/Xiaohongshu Sample Text Archive\n' : '# RedNote/Xiaohongshu Text Archive\n'];

for (const post of posts) {
  if (isSample) {
    chunks.push(`## Sample ${post.sample_id || '(unknown)'}`);
    chunks.push(`- Inferred index: ${post.inferred_index == null ? 'null' : post.inferred_index}`);
    chunks.push(`- Title: ${post.title || ''}`);
    chunks.push(`- Author: ${post.author || ''}`);
    chunks.push(`- URL: ${post.url || ''}`);
    chunks.push(`- Collected at: ${post.collected_at || ''}`);
    chunks.push('');
    chunks.push('Body:');
    chunks.push(post.content || '');
    chunks.push('');
  } else {
    chunks.push(`## ${post.index}. ${post.title || '(untitled)'}`);
    chunks.push('');
    chunks.push(`URL: ${post.url || ''}`);
    chunks.push('');
    chunks.push(post.content || '');
    chunks.push('');
  }
}

fs.writeFileSync(OUTPUT, chunks.join('\n'), 'utf8');
console.log(`Wrote ${posts.length} posts to ${OUTPUT}`);
