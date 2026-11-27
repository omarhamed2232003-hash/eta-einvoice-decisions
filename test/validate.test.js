import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset } from '../src/validate.js';

const real = JSON.parse(await readFile(new URL('../data/decisions.json', import.meta.url), 'utf8'));

/** A deep copy of the real dataset, so a mutation cannot leak into another test. */
const copy = () => JSON.parse(JSON.stringify(real));
const row = (data, id) => data.decisions.find((item) => item.id === id);
const source = (data, id) => data.sources.find((item) => item.id === id);

const errorsFor = (mutate) => {
  const data = copy();
  mutate(data);
  return validateDataset(data).errors;
};

const expectError = (name, mutate, fragment) => {
  test(name, () => {
    const errors = errorsFor(mutate);
    assert.ok(
      errors.some((error) => error.includes(fragment)),
      `expected an error containing "${fragment}", got:\n${errors.join('\n') || '(none)'}`,
    );
  });
};

test('the real dataset is clean and its counts are right', () => {
  const { errors, stats } = validateDataset(real);
  assert.deepEqual(errors, []);
  assert.equal(stats.decisions, 32);
  assert.equal(stats.sources, 35);
  assert.equal(stats.einvoice, 9);
  assert.equal(stats.ereceipt, 23);
  assert.deepEqual(stats.levels, { document_read: 32 });
});

test('an empty decisions list is refused', () => {
  const errors = errorsFor((data) => { data.decisions = []; });
  assert.ok(errors.some((error) => error.includes('must be a non-empty array')));
});

/* ------------------------------------------------------------------ dataset */

expectError('a missing dataset field is reported', (data) => { data.dataset.id = ''; }, 'dataset.id: required non-empty string');
expectError('a non-ISO compiled_on is reported', (data) => { data.dataset.compiled_on = '27 Nov 2026'; }, 'dataset.compiled_on');

/* ------------------------------------------------------------------- sources */

expectError('a duplicate source id is reported', (data) => { data.sources.push({ ...data.sources[0] }); }, 'duplicate source id');
expectError('an unknown source type is reported', (data) => { source(data, data.sources[0].id).type = 'blog'; }, 'unexpected type');
expectError('a non-https source url is reported', (data) => { source(data, data.sources[0].id).url = 'http://eta.gov.eg/x'; }, 'url must be https');
expectError('an official source off eta.gov.eg is reported', (data) => {
  const eta = data.sources.find((item) => item.type !== 'official_gazette');
  eta.url = 'https://example.com/decision.pdf';
}, 'official sources must be on eta.gov.eg');
expectError('a gazette without an issue is reported', (data) => {
  const gazette = data.sources.find((item) => item.type === 'official_gazette');
  gazette.gazette.issue = '';
}, 'official_gazette needs gazette.issue');
expectError('a gazette without a publication date is reported', (data) => {
  const gazette = data.sources.find((item) => item.type === 'official_gazette');
  gazette.gazette.published_on = '26/03/2020';
}, 'gazette.published_on');
expectError('a gazette without a host note is reported', (data) => {
  const gazette = data.sources.find((item) => item.type === 'official_gazette');
  gazette.host_note_ar = '';
}, 'host_note_ar');
expectError('a bad retrieved_on is reported', (data) => { data.sources[0].retrieved_on = 'today'; }, 'retrieved_on must be an ISO date');

/* ----------------------------------------------------------------- decisions */

expectError('an id that does not follow the pattern is reported', (data) => { data.decisions[0].id = 'decision-1'; }, 'id must look like');
expectError('a duplicate decision id is reported', (data) => { data.decisions[1].id = data.decisions[0].id; }, 'duplicate decision id');
expectError('an unknown system is reported', (data) => { data.decisions[0].system = 'vat'; }, 'system must be one of');
expectError('an unknown issuer is reported', (data) => { data.decisions[0].issuer = 'unknown'; }, 'issuer must be one of');
expectError('a non-numeric number is reported', (data) => { data.decisions[0].number = '188/2020'; }, 'number must be digits');
expectError('a year out of range is reported', (data) => { data.decisions[0].year = 1999; }, 'year out of range');
expectError('a title that omits the number is reported', (data) => {
  data.decisions[0].title_ar = 'قرار بدون رقم';
}, 'title_ar does not mention the decision number');
expectError('a bad issued_on is reported', (data) => { data.decisions[0].issued_on = '2020-13-01'; }, 'issued_on must be null or an ISO date');
expectError('an effective date before the issue date is reported', (data) => {
  const target = data.decisions.find((item) => item.issued_on && item.effective_from);
  target.effective_from = '1999-01-01';
}, 'effective_from is before issued_on');
expectError('a bad phase is reported', (data) => { data.decisions[0].phase.main = 0; }, 'phase.main must be null or a positive integer');
expectError('a row without sources is reported', (data) => { data.decisions[0].source_ids = []; }, 'needs at least one source');
expectError('an unknown source reference is reported', (data) => { data.decisions[0].source_ids = ['src-does-not-exist']; }, 'unknown source id');
expectError('a primary source outside source_ids is reported', (data) => {
  const target = data.decisions[0];
  target.source_ids = target.source_ids.filter((id) => id !== target.primary_source_id);
}, 'primary_source_id must also appear in source_ids');
expectError('an unknown verification level is reported', (data) => { data.decisions[0].verification.level = 'read'; }, 'verification.level must be one of');
expectError('a bad checked_on is reported', (data) => { data.decisions[0].verification.checked_on = '27-11-2026'; }, 'verification.checked_on must be an ISO date');
expectError('missing verification notes are reported', (data) => { data.decisions[0].verification.notes = ' '; }, 'verification.notes must say how');

test('a listing-only row may not carry an effective date', () => {
  const errors = errorsFor((data) => {
    data.decisions[0].verification.level = 'listing_only';
  });
  assert.ok(errors.some((error) => error.includes('must not carry an effective_from')));
});

/* --------------------------------------------------------- effective_schedule */

const scheduleRow = (data) => row(data, 'eta-erec-0038-2024');

expectError('an empty schedule is reported', (data) => { scheduleRow(data).effective_schedule = []; }, 'effective_schedule must be a non-empty array');
expectError('a bad schedule date is reported', (data) => { scheduleRow(data).effective_schedule[0].from = '2024-02-30'; }, 'effective_schedule[0].from must be an ISO date');
expectError('a descending schedule is reported', (data) => {
  const schedule = scheduleRow(data).effective_schedule;
  [schedule[0].from, schedule[1].from] = [schedule[1].from, schedule[0].from];
  scheduleRow(data).effective_from = schedule[0].from;
}, 'ascending date order');
expectError('a schedule entry without scope text is reported', (data) => { scheduleRow(data).effective_schedule[0].scope_ar = ''; }, 'scope_ar missing');
expectError('an effective_from that disagrees with the schedule is reported', (data) => {
  scheduleRow(data).effective_from = '2030-01-01';
}, 'effective_from must equal the first schedule date');
