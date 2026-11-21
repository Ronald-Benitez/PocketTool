#!/usr/bin/env node

/**
 * Audita el tamaño y la estructura de la documentación de PocketTool.
 *
 * - Falla si AGENTS.md (raíz o de área), docs/phases.md,
 *   docs/architecture/*.md, skills o comandos exceden su presupuesto.
 * - Advierte si un documento normal supera 20 KB.
 * - Advierte si un plan de docs/legacy no empieza con **Resumen:**.
 * - Advierte si un documento largo no tiene **Resumen:** o **Secciones:**.
 * - Advierte si falta un documento en docs/README.md o docs/legacy/README.md.
 * - Advierte si un enlace relativo o un ancla no resuelven.
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
  {
    match: (file) => file.endsWith('AGENTS.md') && file !== 'AGENTS.md',
    limit: 4 * KB,
    label: 'AGENTS de área',
  },
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

const targets = new Set([
  'AGENTS.md',
  ...walk('docs'),
  ...walk('src').filter((file) => file.endsWith('AGENTS.md')),
  ...walk('app').filter((file) => file.endsWith('AGENTS.md')),
]);

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

const warningsList = [];

const stripCode = (content) => content.replace(/```[\s\S]*?```/g, ' ');

const normalizeLink = (raw, fromFile) => {
  let target = raw.trim();
  if (!target) return null;
  if (/^(https?:|mailto:|tel:)/i.test(target)) return null;

  const hashIndex = target.indexOf('#');
  let anchor = null;
  if (hashIndex >= 0) {
    anchor = target.slice(hashIndex + 1);
    target = target.slice(0, hashIndex);
  }

  if (!target) return { path: fromFile, anchor };
  if (target.startsWith('/')) target = target.slice(1);

  return {
    path: path.posix.normalize(
      path.posix.join(path.posix.dirname(fromFile), target)
    ),
    anchor,
  };
};

const extractLinks = (content, file) => {
  const links = [];
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = re.exec(stripCode(content)))) {
    const normalized = normalizeLink(match[1], file);
    if (normalized) links.push(normalized);
  }
  return links;
};

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');

const collectHeadings = (content) => {
  const headings = new Set();
  const re = /^#{1,6}\s+(.+)$/gm;
  let match;
  while ((match = re.exec(content))) {
    headings.add(slugify(match[1]));
  }
  return headings;
};

const checkIndex = (indexFile, scopePrefix, excludePrefix = null) => {
  const indexPath = path.join(ROOT, indexFile);
  if (!fs.existsSync(indexPath)) return;

  const content = fs.readFileSync(indexPath, 'utf8');
  const linked = new Set(
    extractLinks(content, indexFile)
      .map((link) => link.path)
      .filter((file) => file.endsWith('.md'))
  );

  for (const file of targets) {
    if (!file.startsWith(scopePrefix) || !file.endsWith('.md')) continue;
    if (file === indexFile) continue;
    if (file.endsWith('/AGENTS.md') || file.endsWith('/README.md')) continue;
    if (excludePrefix && file.startsWith(excludePrefix)) continue;
    if (!linked.has(file)) {
      warningsList.push(`índice: ${indexFile} no enlaza ${file}`);
    }
  }
};

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

checkIndex('docs/README.md', 'docs/', 'docs/legacy/');
checkIndex('docs/legacy/README.md', 'docs/legacy/');

for (const file of targets) {
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) continue;

  const content = fs.readFileSync(absolute, 'utf8');

  if (
    file.startsWith('docs/') &&
    !file.startsWith('docs/legacy/') &&
    file !== 'docs/schema.md' &&
    Buffer.byteLength(content, 'utf8') >= 5 * KB
  ) {
    if (!content.includes('**Cuándo leer:**')) {
      warningsList.push(`cabecera: ${file} sin **Cuándo leer:**`);
    }
    if (!content.includes('**Resumen:**')) {
      warningsList.push(`cabecera: ${file} sin **Resumen:**`);
    }
    if (!content.includes('**Secciones:**')) {
      warningsList.push(`cabecera: ${file} sin **Secciones:**`);
    }
  }

  for (const link of extractLinks(content, file)) {
    const linkPath = path.join(ROOT, link.path);
    if (!fs.existsSync(linkPath)) {
      warningsList.push(`enlace: ${file} → ${link.path}`);
      continue;
    }

    if (link.anchor && link.path.endsWith('.md')) {
      let anchor = link.anchor;
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        // Keep the raw anchor if it is not valid percent-encoding.
      }
      if (!collectHeadings(fs.readFileSync(linkPath, 'utf8')).has(slugify(anchor))) {
        warningsList.push(`ancla: ${file} → ${link.path}#${link.anchor}`);
      }
    }
  }
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

const totalWarnings = warnings + warningsList.length;
if (totalWarnings > 0) {
  console.warn(`\n${totalWarnings} advertencia(s):`);
  if (warnings > 0) {
    console.warn(
      ` - ${warnings} legacy sin **Resumen:** en las primeras 45 líneas.`
    );
  }
  for (const warning of warningsList.slice(0, 30)) {
    console.warn(` - ${warning}`);
  }
  if (warningsList.length > 30) {
    console.warn(` ... y ${warningsList.length - 30} más.`);
  }
}
