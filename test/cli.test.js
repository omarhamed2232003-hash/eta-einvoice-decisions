import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/eta-decisions.js', import.meta.url));
const data = JSON.parse(readFileSync(new URL('../data/decisions.json', import.meta.url), 'utf8'));

const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('list prints every decision by default', () => {
  const result = run('list');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`${data.decisions.length} of ${data.decisions.length} decisions`));
});

test('--system and --year narrow the list to what the data holds', () => {
  const expected = data.decisions.filter((row) => row.system === 'ereceipt' && row.year === 2023);
  const result = run('list', '--system', 'ereceipt', '--year', '2023');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(expected.length > 0);
  assert.match(result.stdout, new RegExp(`${expected.length} of ${data.decisions.length}`));
});

test('--effective-before keeps only rows with an earlier start date', () => {
  const expected = data.decisions.filter((row) => row.effective_from && row.effective_from < '2022-01-01');
  const result = run('list', '--effective-before', '2022-01-01', '--json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).length, expected.length);
});

test('--q searches Arabic titles', () => {
  const result = run('list', '--q', 'الفاتورة الضريبية', '--json');
  assert.equal(result.status, 0, result.stderr);
  const rows = JSON.parse(result.stdout);
  assert.ok(rows.length > 0);
  assert.ok(rows.every((row) => `${row.title_ar} ${row.scope_ar ?? ''}`.includes('الفاتورة الضريبية')));
});

test('list --json returns whole rows', () => {
  const result = run('list', '--limit', '3', '--json');
  const rows = JSON.parse(result.stdout);
  assert.equal(rows.length, 3);
  rows.forEach((row) => assert.ok(row.id && row.verification.level));
});

test('a query that matches nothing says so and still exits 0', () => {
  const result = run('list', '--q', 'zzz-no-such-thing');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /no decisions match/);
});

test('show prints one decision, and an unknown id exits 1', () => {
  const known = data.decisions[0].id;
  const result = run('show', known);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /verification:/);

  const missing = run('show', 'no-such-id');
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /no decision with id/);
});

test('stats adds up to the whole dataset', () => {
  const result = run('stats', '--json');
  assert.equal(result.status, 0, result.stderr);
  const stats = JSON.parse(result.stdout);
  assert.equal(stats.total, data.decisions.length);
  const sum = (object) => Object.values(object).reduce((total, value) => total + value, 0);
  assert.equal(sum(stats.bySystem), data.decisions.length);
  assert.equal(sum(stats.byYear), data.decisions.length);
  assert.equal(sum(stats.byVerification), data.decisions.length);
});

test('bad usage exits 2', () => {
  assert.equal(run().status, 2);
  assert.equal(run('list', '--system', 'vat').status, 2);
  assert.equal(run('list', '--year', '24').status, 2);
  assert.equal(run('list', '--effective-before', '2022').status, 2);
  assert.equal(run('list', '--lang', 'fr').status, 2);
  assert.equal(run('nonsense').status, 2);
});
