import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const run = (...args) => execFileSync(process.execPath, ['bin/eta-decisions.js', ...args], { encoding: 'utf8' });

test('list --format csv prints a header and one row per decision', () => {
  const out = run('list', '--format', 'csv');
  const lines = out.trim().split('\n');
  assert.equal(lines[0], 'id,number,year,system,issuer,issued_on,effective_from,verification_level,checked_on,title_ar,title_en,primary_source_id');
  const total = Number(run('stats', '--json').match(/"total": (\d+)/)[1]);
  assert.equal(lines.length - 1, total);
});

test('csv keeps a filter', () => {
  const out = run('list', '--system', 'einvoice', '--format', 'csv');
  const rows = out.trim().split('\n').slice(1);
  assert.ok(rows.length > 0);
  assert.ok(rows.every((row) => row.split(',')[2] === 'einvoice' || row.includes('einvoice')));
});

test('a field with a comma or a quote is quoted properly', () => {
  const out = run('list', '--format', 'csv');
  const rows = out.trim().split('\n').slice(1);
  for (const row of rows) {
    // Every quoted cell must close, and internal quotes must be doubled.
    let inQuotes = false;
    for (let i = 0; i < row.length; i += 1) {
      if (row[i] === '"') {
        if (inQuotes && row[i + 1] === '"') { i += 1; continue; }
        inQuotes = !inQuotes;
      }
    }
    assert.equal(inQuotes, false, `unbalanced quotes in ${row}`);
  }
});

test('--format csv on another command is a usage error', () => {
  assert.throws(
    () => run('stats', '--format', 'csv'),
    (error) => error.status === 2 && /applies to list/.test(error.stderr),
  );
});

test('an unknown format is refused', () => {
  assert.throws(
    () => run('list', '--format', 'xml'),
    (error) => error.status === 2 && /text, json or csv/.test(error.stderr),
  );
});
