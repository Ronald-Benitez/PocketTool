#!/usr/bin/env node

/**
 * Exporta los tokens de src/ui a un manifiesto para Penpot.
 *
 * Uso: npm run penpot:tokens
 * Salida: dist/penpot/tokens.json (ignorado por git).
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const THEME_DIR = path.join(ROOT, 'src', 'ui', 'theme');
const OUTPUT = path.join(ROOT, 'dist', 'penpot', 'tokens.json');

const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(THEME_DIR, file), 'utf8'));

const source = fs.readFileSync(path.join(THEME_DIR, 'tokens.ts'), 'utf8');

const flatBlock = (name) => {
  const match = source.match(
    new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\} as const;`)
  );
  if (!match) throw new Error(`No se encontró ${name} en tokens.ts`);

  const values = {};
  const row = /([a-zA-Z0-9_]+):\s*(\d+),/g;
  let entry = row.exec(match[1]);
  while (entry) {
    values[entry[1]] = Number(entry[2]);
    entry = row.exec(match[1]);
  }
  return values;
};

const typography = () => {
  const match = source.match(/export const typography = \{([\s\S]*?)\} as const;/);
  if (!match) throw new Error('No se encontró typography en tokens.ts');

  const values = {};
  const row =
    /([a-zA-Z0-9_]+):\s*\{\s*fontSize:\s*(\d+),\s*lineHeight:\s*(\d+),\s*fontWeight:\s*'(\d+)'\s*\}/g;
  let entry = row.exec(match[1]);
  while (entry) {
    values[entry[1]] = {
      fontSize: Number(entry[2]),
      lineHeight: Number(entry[3]),
      fontWeight: entry[4],
    };
    entry = row.exec(match[1]);
  }
  return values;
};

const manifest = {
  source: {
    palettes: ['bright.base.json', 'dark.base.json'],
    tokens: 'src/ui/theme/tokens.ts',
    typography: 'src/ui/theme/tokens.ts',
  },
  colors: {
    bright: readJson('palettes/bright.base.json'),
    dark: readJson('palettes/dark.base.json'),
  },
  spacing: flatBlock('spacing'),
  radii: flatBlock('radii'),
  controlHeight: flatBlock('controlHeight'),
  typography: typography(),
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);

const colorCount =
  Object.keys(manifest.colors.bright).length +
  Object.keys(manifest.colors.dark).length;

console.log(`Manifiesto escrito en ${path.relative(ROOT, OUTPUT)}`);
console.log(`Colores: ${colorCount} · tipografías: ${Object.keys(manifest.typography).length}`);
