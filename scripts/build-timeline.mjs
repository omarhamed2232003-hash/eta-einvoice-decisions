#!/usr/bin/env node
/**
 * Builds docs/TIMELINE.md from data/decisions.json.
 *
 * The timeline is generated, never hand-edited: a decision's place on it is a
 * fact about the dataset, and a hand-kept copy drifts. `npm test` fails when the
 * committed file is out of date, so the fix is always `npm run build:timeline`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const dataset = JSON.parse(readFileSync(new URL('../data/decisions.json', import.meta.url), 'utf8'));
const rows = dataset.decisions;

const byDate = (left, right) => {
  const a = left.effective_from ?? '9999-12-31';
  const b = right.effective_from ?? '9999-12-31';
  if (a !== b) return a < b ? -1 : 1;
  return left.id < right.id ? -1 : 1;
};

const escapeCell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function buildTimeline(data = dataset) {
  const einvoice = data.decisions.filter((row) => row.system === 'einvoice').sort(byDate);
  const ereceipt = data.decisions.filter((row) => row.system === 'ereceipt').sort(byDate);

  const table = (rows) => {
    const lines = [
      '| تاريخ السريان | القرار | المستوى | المرحلة | المعرّف |',
      '|---|---|---|---|---|',
    ];
    for (const row of rows) {
      const effective = row.effective_from ?? 'غير محدد';
      const phase = row.phase?.main == null
        ? '—'
        : (row.phase.sub == null ? `${row.phase.main}` : `${row.phase.main}.${row.phase.sub}`);
      lines.push(`| ${effective} | ${escapeCell(row.title_ar)} | \`${row.verification.level}\` | ${phase} | \`${row.id}\` |`);
    }
    return lines.join('\n');
  };

  return `# الخط الزمني للقرارات (Timeline)

ملف مُولَّد من \`data/decisions.json\` بالأمر \`npm run build:timeline\`. لا يُحرَّر يدويًا؛ الاختبارات تفشل إذا لم يطابق البيانات.

الترتيب بتاريخ السريان (\`effective_from\`)، والقرارات التي لم يُطبع لها تاريخ إصدار تظهر بتاريخ السريان المستخرج من نص القرار.

## قرارات الفاتورة الإلكترونية (${einvoice.length})

${table(einvoice)}

## قرارات الإيصال الإلكتروني (${ereceipt.length})

${table(ereceipt)}

الإجمالي: ${data.decisions.length} قرارًا. المصادر لكل صف في \`data/decisions.json\` وفي \`docs/SOURCES.md\`.
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('../docs/TIMELINE.md', import.meta.url), buildTimeline());
  console.log(`docs/TIMELINE.md written from ${rows.length} decisions`);
}
