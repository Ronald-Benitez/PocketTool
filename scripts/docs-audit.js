#!/usr/bin/env node

/**
 * Audita el tamaño y la estructura de la documentación de PocketTool.
 *
 * - Falla si AGENTS.md, docs/phases.md, docs/architecture/*.md, skills o
 *   comandos exceden su presupuesto.
 * - Advierte si un documento normal supera 20 KB.
 * - Advierte si un plan de docs/legacy no empieza con **Resumen:**.
 * - docs/schema.md está exento por ser generado.
 *
 * Uso:
 *   node scripts/docs-audit.js
 *   node scripts/docs-audit.js --warn-only
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const WARN_ONLY = process.argv.includes('--warn-only');

const KB = 1024;

const budgets = [
  { match: (file) => file === 'AGENTS.md', limit: 8 * KB, label: 'AGENTS.md' },
  { match: (file) => file === 'docs/phases.md', limit: 12 * KB, label: 'phases' },
  {
    match: (file) => file.startsWith('docs/architecture/') && file.endsWith('.md'),
    limit: 12 * KB,
    label: 'arquitectura',
  },
  {
    match: (file) => file.startsWith('.opencode/skills/') && file.endsWith('SKILL.md'),
    limit: 4 * KB,
    label: 'skill',
  },
  {
    match: (file) => file.startsWith('.opencode/commands/') && file.endsWith('.md'),
    limit: 2 * KB,
    label: 'comando',
  },
  {
    match: (file) =>
      file.startsWith('docs/') &&
      !file.startsWith('docs/legacy/') &&
      file !== 'docs/schema.md' &&
      file.endsWith('.md'),
    limit: 20 * KB,
    label: 'documento',
  },
];

const walk = (directory) => {
  const absolute = path.join(ROOT, directory);
  if (!fs.existsSync(absolute)) return [];

  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(relative));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(relative);
    }
  }

  return files;
};

const targets = new Set(['AGENTS.md', ...walk('docs')]);

for (const directory of ['.opencode/skills', '.opencode/commands']) {
  const absolute = path.join(ROOT, directory);
  if (!fs.existsSync(absolute)) continue;

  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const skill = path.posix.join(directory, entry.name, 'SKILL.md');
      if (fs.existsSync(path.join(ROOT, skill))) targets.add(skill);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      targets.add(path.posix.join(directory, entry.name));
    }
  }
}

const rows = [];
let failures = 0;
let warnings = 0;

for (const file of [...targets].sort()) {
  const absolute = path.join(ROOT, file);
  const content = fs.readFileSync(absolute, 'utf8');
  const bytes = Buffer.byteLength(content, 'utf8');
  const tokens = Math.ceil(content.length / 4);
  const budget = budgets.find((entry) => entry.match(file));

  const isGenerated = file === 'docs/schema.md';
  const isLegacy = file.startsWith('docs/legacy/');
  const isLegacyIndex =
    file === 'docs/legacy/README.md' || file === 'docs/legacy/AGENTS.md';

  let status = 'ok';
  let note = '';

  if (isGenerated) {
    status = 'exempt';
    note = 'generado';
  } else if (isLegacy) {
    status = 'exempt';
    if (!isLegacyIndex) {
      const head = content.split(/\r?\n/).slice(0, 45).join('\n');
      if (!head.includes('**Resumen:**')) {
        status = 'warn';
        note = 'legacy sin **Resumen:** en las primeras 45 líneas';
        warnings += 1;
      } else {
        note = 'legacy';
      }
    } else {
      note = 'índice legacy';
    }
  } else if (budget && bytes > budget.limit) {
    status = 'fail';
    note = `excede ${budget.label} (${Math.round(budget.limit / KB)} KB)`;
    failures += 1;
  } else if (budget) {
    note = budget.label;
  }

  rows.push({ file, bytes, tokens, status, note });
}

const statusOrder = { fail: 0, warn: 1, ok: 2, exempt: 3 };
rows.sort(
  (a, b) => statusOrder[a.status] - statusOrder[b.status] || b.bytes - a.bytes
);

const line = (row) =>
  [
    row.status.toUpperCase().padEnd(7),
    `${(row.bytes / KB).toFixed(1)} KB`.padStart(9),
    `~${row.tokens} tok`.padStart(11),
    row.file.padEnd(52),
    row.note,
  ].join(' ');

console.log('Documentation audit');
console.log('===================');
console.log(
  ['ESTADO ', 'TAMAÑO ', 'TOKENS ', 'ARCHIVO'.padEnd(52), 'NOTA'].join(' ')
);
console.log('-'.repeat(110));
for (const row of rows) console.log(line(row));
console.log('-'.repeat(110));

if (!WARN_ONLY && failures > 0) {
  console.error(
    `\n${failures} archivo(s) exceden su presupuesto. Recorta, divide o archiva.`
  );
  process.exitCode = 1;
} else if (failures > 0) {
  console.warn(`\n${failures} archivo(s) exceden su presupuesto (--warn-only).`);
} else {
  console.log('\nPresupuesto de documentación en verde.');
}

if (warnings > 0) {
  console.warn(`${warnings} advertencia(s). Revisa los legacy sin resumen.`);
}
