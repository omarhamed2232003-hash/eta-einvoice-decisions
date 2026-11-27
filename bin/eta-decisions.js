#!/usr/bin/env node
/**
 * Query the decisions dataset from the command line.
 *
 * Read-only: it prints what data/decisions.json holds and never edits it.
 * Exit codes: 0 for a successful query (including one with no matches),
 * 1 when `show` cannot find the id, 2 for bad usage.
 */
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/decisions.json', import.meta.url), 'utf8'));
const decisions = data.decisions;

const usage = `usage: eta-decisions <command> [options]

commands:
  list [filters]     list decisions (default: all)
  show <id>          print one decision in full
  stats              counts by system, year and verification level

filters for list:
  --system einvoice|ereceipt   --year 2024        --issuer minister_of_finance
  --verification document_read|official_summary|listing_only
  --effective-before 2022-01-01   --q "نص للبحث"
  --lang ar|en (text output)      --json      --format csv

examples:
  eta-decisions list --system ereceipt --year 2023
  eta-decisions list --effective-before 2022-01-01 --lang en
  eta-decisions show eta-einv-0188-2020
  eta-decisions stats --json`;

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(pkg.version);
  process.exit(0);
}

const argv = process.argv.slice(2);
const [command, ...rest] = argv;

if (!command || command === '--help' || command === '-h') {
  console.log(usage);
  process.exit(command ? 0 : 2);
}

const value = (name) => {
  const index = rest.indexOf(name);
  return index === -1 ? undefined : rest[index + 1];
};
const has = (name) => rest.includes(name);

const json = has('--json');
const format = value('--format') ?? (json ? 'json' : 'text');
if (!['text', 'json', 'csv'].includes(format)) {
  console.error(`--format must be text, json or csv, not ${format}`);
  process.exit(2);
}
if (format === 'csv' && command !== 'list') {
  console.error('--format csv applies to list');
  process.exit(2);
}
const lang = value('--lang') ?? 'ar';
if (lang !== 'ar' && lang !== 'en') {
  console.error(`--lang must be ar or en, not ${lang}`);
  process.exit(2);
}

const title = (row) => (lang === 'en' ? (row.title_en ?? row.title_ar) : row.title_ar);
const label = (row) => `${row.number}/${row.year}`;

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const CSV_COLUMNS = [
  'id', 'number', 'year', 'system', 'issuer', 'issued_on', 'effective_from',
  'verification_level', 'checked_on', 'title_ar', 'title_en', 'primary_source_id',
];

const csvRow = (row) => [
  row.id, row.number, row.year, row.system, row.issuer, row.issued_on, row.effective_from,
  row.verification?.level, row.verification?.checked_on, row.title_ar, row.title_en, row.primary_source_id,
].map(csvCell).join(',');

const emit = (rows) => {
  if (format === 'csv') {
    console.log([CSV_COLUMNS.join(','), ...rows.map(csvRow)].join('\n'));
    return;
  }
  if (json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  if (rows.length === 0) {
    console.log('no decisions match');
    return;
  }
  const lines = rows.map((row) => [
    row.issued_on ?? '----------',
    row.system,
    label(row).padEnd(10),
    `[${row.verification.level}]`,
    title(row),
  ].join('  '));
  console.log(lines.join('\n'));
  console.log(`${rows.length} of ${decisions.length} decisions`);
};

const filter = () => {
  const system = value('--system');
  const year = value('--year');
  const issuer = value('--issuer');
  const level = value('--verification');
  const before = value('--effective-before');
  const query = value('--q');
  const limit = value('--limit');

  if (system && system !== 'einvoice' && system !== 'ereceipt') {
    console.error('--system must be einvoice or ereceipt');
    process.exit(2);
  }
  if (year && !/^\d{4}$/.test(year)) {
    console.error('--year must be a four-digit year');
    process.exit(2);
  }
  if (before && !/^\d{4}-\d{2}-\d{2}$/.test(before)) {
    console.error('--effective-before must be YYYY-MM-DD');
    process.exit(2);
  }
  if (limit && !/^\d+$/.test(limit)) {
    console.error('--limit must be a number');
    process.exit(2);
  }

  let rows = decisions.filter((row) => {
    if (system && row.system !== system) return false;
    if (year && String(row.year) !== year) return false;
    if (issuer && row.issuer !== issuer) return false;
    if (level && row.verification.level !== level) return false;
    if (before && !(row.effective_from && row.effective_from < before)) return false;
    if (query) {
      const haystack = [row.title_ar, row.title_en, row.scope_ar, row.scope_en, label(row)]
        .filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  rows = [...rows].sort((left, right) => String(left.issued_on).localeCompare(String(right.issued_on)));
  if (limit) rows = rows.slice(0, Number(limit));
  return rows;
};

if (command === 'list') {
  emit(filter());
} else if (command === 'show') {
  const id = rest.find((item) => !item.startsWith('--'));
  if (!id) {
    console.error('show needs a decision id');
    process.exit(2);
  }
  const row = decisions.find((item) => item.id === id);
  if (!row) {
    console.error(`no decision with id ${id}`);
    process.exit(1);
  }
  if (json) {
    console.log(JSON.stringify(row, null, 2));
  } else {
    const lines = [
      `${label(row)} - ${title(row)}`,
      `system: ${row.system}`,
      `issuer: ${row.issuer}`,
      `issued: ${row.issued_on}`,
      `effective from: ${row.effective_from ?? 'not stated'}`,
      `phase: ${row.phase?.main ?? '-'}${row.phase?.sub ? ` / ${row.phase.sub}` : ''}`,
      `verification: ${row.verification.level} (checked ${row.verification.checked_on})`,
      `source: ${row.primary_source_id}`,
      '',
      lang === 'en' ? (row.scope_en ?? row.scope_ar) : row.scope_ar,
    ];
    console.log(lines.join('\n'));
  }
} else if (command === 'stats') {
  const count = (key) => decisions.reduce((acc, row) => {
    const name = key(row);
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});
  const result = {
    total: decisions.length,
    bySystem: count((row) => row.system),
    byYear: count((row) => String(row.year)),
    byVerification: count((row) => row.verification.level),
  };
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`total: ${result.total}`);
    for (const [name, count_] of Object.entries(result.bySystem)) console.log(`  ${name}: ${count_}`);
    console.log('by year:');
    for (const [name, count_] of Object.entries(result.byYear).sort()) console.log(`  ${name}: ${count_}`);
    console.log('by verification:');
    for (const [name, count_] of Object.entries(result.byVerification)) console.log(`  ${name}: ${count_}`);
  }
} else {
  console.error(`unknown command ${command}\n\n${usage}`);
  process.exit(2);
}
