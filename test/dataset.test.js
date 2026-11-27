import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(new URL('../data/decisions.json', import.meta.url), 'utf8'));

test('the dataset passes the repository validator', () => {
  const output = execFileSync('node', ['scripts/validate.mjs'], { cwd: root, encoding: 'utf8' });
  assert.match(output, /^ok/);
});

test('the committed CSV is in sync with the JSON', () => {
  const output = execFileSync('node', ['scripts/build-csv.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  assert.match(output, /in sync/);
});

test('every decision cites an official source (eta.gov.eg or the Official Gazette)', () => {
  const byId = new Map(data.sources.map((source) => [source.id, source]));
  data.decisions.forEach((row) => {
    const primary = byId.get(row.primary_source_id);
    assert.ok(primary, row.id);
    if (primary.type === 'official_gazette') {
      assert.ok(primary.gazette?.published_on, `${row.id} gazette date`);
      assert.ok(primary.host_note_ar, `${row.id} gazette host note`);
    } else {
      assert.ok(primary.url.startsWith('https://eta.gov.eg/'), `${row.id} source host`);
    }
  });
});

test('no row claims a date it did not verify', () => {
  data.decisions.forEach((row) => {
    if (row.effective_from) {
      assert.ok(
        ['document_read', 'official_summary'].includes(row.verification.level),
        `${row.id} has a date but level ${row.verification.level}`,
      );
    }
  });
});

test('the two systems and both issuers are represented', () => {
  const systems = new Set(data.decisions.map((row) => row.system));
  assert.deepEqual([...systems].sort(), ['einvoice', 'ereceipt']);
  const issuers = new Set(data.decisions.map((row) => row.issuer));
  assert.ok(issuers.has('head_of_eta'));
  assert.ok(issuers.has('minister_of_finance'));
});

test('the e-invoice mandate phases are complete and in order', () => {
  const phases = data.decisions
    .filter((row) => row.system === 'einvoice' && row.phase.main !== null)
    .map((row) => row.phase.main)
    .sort((a, b) => a - b);
  assert.deepEqual(phases, [1, 2, 3, 5, 6, 8]);
});

test('every source in the file is used by at least one decision', () => {
  const used = new Set();
  data.decisions.forEach((row) => row.source_ids.forEach((id) => used.add(id)));
  const orphans = data.sources.filter((source) => !used.has(source.id)).map((source) => source.id);
  assert.deepEqual(orphans, []);
});

test('docs/TIMELINE.md matches the dataset', async () => {
  const { buildTimeline } = await import('../scripts/build-timeline.mjs');
  const { readFileSync } = await import('node:fs');
  const committed = readFileSync(new URL('../docs/TIMELINE.md', import.meta.url), 'utf8');
  assert.equal(committed, buildTimeline(), 'run npm run build:timeline');
});
