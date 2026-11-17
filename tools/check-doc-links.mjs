import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ignore = new Set(['.git', 'node_modules', '.venv', 'dist', '.codex-remote-attachments', '.srs_build']);
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => ignore.has(e.name) ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
let errors = 0, count = 0;
for (const file of walk(root).filter(f => f.endsWith('.md'))) {
  // Archived source notes can contain illustrative links, not deliverable references.
  if (file.includes(`${path.sep}references${path.sep}`)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    count++;
    if (!fs.existsSync(path.resolve(path.dirname(file), decodeURIComponent(target.split('#')[0])))) {
      console.error(`${path.relative(root, file)}: ${target}`); errors++;
    }
  }
}
console.log(`${count} tautan lokal diperiksa; ${errors} rusak.`);
process.exitCode = errors ? 1 : 0;
