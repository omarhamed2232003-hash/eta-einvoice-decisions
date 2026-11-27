import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const run = (...args) => execFileSync(process.execPath, ['bin/eta-decisions.js', ...args], { encoding: 'utf8' });

test('--version prints the package version', () => {
  assert.equal(run('--version').trim(), pkg.version);
});

test('--help prints the usage', () => {
  assert.match(run('--help'), /usage: eta-decisions/);
});
