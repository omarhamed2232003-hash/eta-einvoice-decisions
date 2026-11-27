import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const run = (...args) => execFileSync(process.execPath, ['bin/eta-decisions.js', ...args], { encoding: 'utf8', stdio: 'pipe' });

const fails = (args, status, pattern) => assert.throws(
  () => run(...args),
  (error) => error.status === status && pattern.test(error.stderr),
);

test('an unknown command is a usage error', () => fails(['frobnicate'], 2, /unknown command/));
test('show without an id is a usage error', () => fails(['show'], 2, /show needs a decision id/));
test('show with an unknown id exits 1', () => fails(['show', 'eta-einv-9999-2020'], 1, /no decision with id/));
test('a bad --lang is a usage error', () => fails(['list', '--lang', 'fr'], 2, /--lang must be ar or en/));
test('a bad --system is a usage error', () => fails(['list', '--system', 'vat'], 2, /--system must be einvoice or ereceipt/));
test('a bad --year is a usage error', () => fails(['list', '--year', '20'], 2, /--year must be a four-digit year/));
test('a bad --effective-before is a usage error', () => fails(['list', '--effective-before', '2022'], 2, /must be YYYY-MM-DD/));
test('a bad --limit is a usage error', () => fails(['list', '--limit', 'ten'], 2, /--limit must be a number/));
test('a filter that matches nothing still exits 0', () => {
  assert.match(run('list', '--q', 'zzzz-no-match'), /no decisions match/);
});
test('show prints the row in English when asked', () => {
  const out = run('show', 'eta-einv-0188-2020', '--lang', 'en');
  assert.match(out, /system: einvoice/);
  assert.match(out, /effective from: 2020-03-27/);
});
