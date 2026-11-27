#!/usr/bin/env node
/**
 * Build data/decisions.csv from data/decisions.json.
 * `--check` regenerates in memory and fails when the committed CSV is out of date.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const jsonPath = fileURLToPath(new URL('../data/decisions.json', import.meta.url));
const csvPath = fileURLToPath(new URL('../data/decisions.csv', import.meta.url));
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const byId = new Map(data.sources.map((source) => [source.id, source]));

const COLUMNS = [
  'id', 'system', 'number', 'year', 'issuer', 'title_ar', 'title_en', 'issued_on',
  'effective_from', 'phase_main', 'phase_sub', 'verification_level', 'checked_on',
  'primary_source_url', 'listing_url',
];

const escape = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const listingFor = (row) => {
  const listingId = row.source_ids.find((id) => id.endsWith('-listing'));
  return listingId ? byId.get(listingId)?.url ?? '' : '';
};

const lines = [COLUMNS.join(',')];
for (const row of data.decisions) {
  lines.push([
    row.id, row.system, row.number, row.year, row.issuer, row.title_ar, row.title_en,
    row.issued_on, row.effective_from, row.phase.main, row.phase.sub,
    row.verification.level, row.verification.checked_on,
    byId.get(row.primary_source_id)?.url ?? '', listingFor(row),
  ].map(escape).join(','));
}
const csv = `${lines.join('\n')}\n`;

if (process.argv.includes('--check')) {
  const current = readFileSync(csvPath, 'utf8');
  if (current !== csv) {
    console.error('FAIL data/decisions.csv is out of date. Run: npm run build:csv');
    process.exit(1);
  }
  console.log(`ok   data/decisions.csv is in sync (${data.decisions.length} rows)`);
} else {
  writeFileSync(csvPath, csv);
  console.log(`wrote data/decisions.csv (${data.decisions.length} rows)`);
}
