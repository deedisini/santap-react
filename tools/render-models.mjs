// PlantUML rendering through Kroki. Sends only selected .puml source files.
// Usage: node tools/render-models.mjs MODEL_NAME [MODEL_NAME...]
// Set KROKI_URL to a local Kroki instance when external rendering is unsuitable.
import fs from 'node:fs/promises';
import path from 'node:path';
const folder = path.resolve('docs/models');
const base = process.env.KROKI_URL || 'https://kroki.io';
const names = process.argv.slice(2);
if (!names.length) throw new Error('Berikan nama model tanpa ekstensi.');
for (const name of names) {
  if (!/^SANTAP_[A-Z0-9_]+$/.test(name)) throw new Error('Nama model tidak valid.');
  const source = await fs.readFile(path.join(folder, `${name}.puml`), 'utf8');
  const response = await fetch(`${base}/plantuml/svg`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: source, signal: AbortSignal.timeout(30000) });
  const svg = await response.text();
  if (!response.ok || !svg.includes('<svg')) throw new Error(`${name}: render gagal ${response.status}: ${svg.slice(0, 200)}`);
  await fs.writeFile(path.join(folder, `${name}.svg`), svg);
  console.log(`${name}.svg`);
}
