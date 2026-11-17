// Maintenance helper: repair relative links by matching unique project filenames.
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', '.venv', 'dist', '.codex-remote-attachments', '.srs_build']);
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => ignored.has(e.name) ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
const files = walk(root);
for (const file of files.filter(f => f.endsWith('.md'))) {
  const original = fs.readFileSync(file, 'utf8');
  const next = original.replace(/(\]\()([^\n)]+)(\))/g, (match, start, target, end) => {
    if (/^(https?:|mailto:|#)/.test(target)) return match;
    const clean = target.replace(/^<|>$/g, '').split('#')[0];
    if (fs.existsSync(path.resolve(path.dirname(file), clean))) return match;
    const matches = files.filter(f => path.basename(f) === path.basename(clean));
    if (matches.length !== 1) return match;
    const relative = path.relative(path.dirname(file), matches[0]).split(path.sep).join('/');
    return `${start}${relative.includes(' ') ? `<${relative}>` : relative}${end}`;
  });
  if (original !== next) fs.writeFileSync(file, next);
}
