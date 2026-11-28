#!/usr/bin/env node
/**
 * Validate data/decisions.json against the dataset rules in docs/METHODOLOGY.md
 * and print a one-screen summary.
 *
 * The rules live in src/validate.js and are imported here rather than copied.
 * They used to be duplicated in this file, which meant a rule could be tightened
 * in one place and quietly stay loose in the other; a test now checks that this
 * script and the library agree on a broken fixture.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDataset } from '../src/validate.js';

const dataPath = fileURLToPath(new URL('../data/decisions.json', import.meta.url));
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

const { errors, stats } = validateDataset(data);

if (errors.length) {
  console.error(`FAIL data/decisions.json — ${errors.length} problem(s)`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(`ok   ${stats.decisions} decisions, ${stats.sources} sources`);
console.log(`     verification levels: ${Object.entries(stats.levels).map(([level, count]) => `${level}=${count}`).join(', ')}`);
console.log(`     einvoice=${stats.einvoice} ereceipt=${stats.ereceipt}`);
