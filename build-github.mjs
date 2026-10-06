import { readdir, readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const base = '/kristina-shynkaruk-portfolio';
async function copyDirectory(relative = '') {
  const source = path.join(root, 'dist', relative);
  const target = path.join(root, 'docs', relative);
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    // The owner workspace requires an authenticated API; never publish it on GitHub Pages.
    if (!relative && ['admin', 'staticwebapp.config.json'].includes(entry.name)) continue;
    if (entry.isDirectory()) { await copyDirectory(path.join(relative, entry.name)); continue; }
    if (/\.(html|js|css)$/.test(entry.name)) {
      let text = await readFile(path.join(source, entry.name), 'utf8');
      text = text.replaceAll('href="/', `href="${base}/`)
        .replaceAll('/images/', `${base}/images/`)
        .replaceAll('/flags/', `${base}/flags/`)
        .replaceAll('src="/app.js"', `src="${base}/app.js"`)
        .replaceAll('src="/language.js"', `src="${base}/language.js"`)
        .replaceAll('src="/managed-stories.js"', `src="${base}/managed-stories.js"`)
        .replaceAll('src="/managed-portfolio.js"', `src="${base}/managed-portfolio.js"`);
      await writeFile(path.join(target, entry.name), text);
    } else {
      await copyFile(path.join(source, entry.name), path.join(target, entry.name));
    }
  }
}
await copyDirectory();
await writeFile(path.join(root, 'docs', '.nojekyll'), '');
console.log('GitHub Pages files generated in docs/.');
