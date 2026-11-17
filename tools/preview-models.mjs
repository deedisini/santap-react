import fs from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
await fs.mkdir('docs/.model-preview', { recursive: true });
for (const name of await fs.readdir('docs/models')) {
  if (!name.endsWith('.svg')) continue;
  const svg = await fs.readFile(`docs/models/${name}`, 'utf8');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1600 }, background: 'white', font: { defaultFontFamily: 'Arial', sansSerifFamily: 'Arial', serifFamily: 'Times New Roman', monospaceFamily: 'Consolas' } }).render().asPng();
  await fs.writeFile(`docs/.model-preview/${name.replace('.svg', '.png')}`, png);
}
