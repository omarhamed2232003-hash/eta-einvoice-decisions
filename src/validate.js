/**
 * Dataset rules, as a function over the parsed JSON.
 *
 * The rules are deliberately strict: a row without an official source, or a date
 * that was not read from an official document, must not pass. Kept separate from
 * scripts/validate.mjs so the rules can be tested against broken fixtures without
 * a file on disk.
 */

export function validateDataset(data) {
  const SYSTEMS = new Set(['einvoice', 'ereceipt']);
  const ISSUERS = new Set(['head_of_eta', 'minister_of_finance']);
  const LEVELS = new Set(['document_read', 'official_summary', 'listing_only', 'referenced']);
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  const errors = [];
  const fail = (where, message) => errors.push(`${where}: ${message}`);

  const isDate = (value) => {
    if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };

  /* ---------------------------------------------------------------- dataset block */

  const dataset = data.dataset ?? {};
  ['id', 'title_en', 'title_ar', 'jurisdiction', 'authority', 'compiled_on', 'disclaimer_en', 'disclaimer_ar']
    .forEach((field) => {
      if (typeof dataset[field] !== 'string' || dataset[field].trim() === '') {
        fail(`dataset.${field}`, 'required non-empty string');
      }
    });
  if (!isDate(dataset.compiled_on)) fail('dataset.compiled_on', 'must be an ISO date');

  /* --------------------------------------------------------------------- sources */

  const sourceIds = new Set();
  for (const [index, source] of (data.sources ?? []).entries()) {
    const at = `sources[${index}]`;
    if (!source.id) fail(at, 'missing id');
    if (sourceIds.has(source.id)) fail(at, `duplicate source id ${source.id}`);
    sourceIds.add(source.id);
    if (!['official_web_page', 'official_pdf', 'official_news', 'official_gazette'].includes(source.type)) {
      fail(at, `unexpected type ${source.type}`);
    }
    if (typeof source.url !== 'string' || !source.url.startsWith('https://')) {
      fail(at, 'url must be https');
    } else {
      const host = new URL(source.url).hostname;
      // ETA's own pages and PDFs must sit on eta.gov.eg. The Official Gazette is the
      // publication of record and is not always hosted by ETA, so a gazette source
      // may live on another host, but it must name the issue and its date and say
      // in the record that it is a copy.
      if (source.type === 'official_gazette') {
        if (!source.gazette || typeof source.gazette.issue !== 'string' || source.gazette.issue.trim() === '') {
          fail(at, 'official_gazette needs gazette.issue');
        }
        if (!isDate(source.gazette?.published_on)) fail(at, 'official_gazette needs gazette.published_on as an ISO date');
        if (typeof source.host_note_ar !== 'string' || source.host_note_ar.trim() === '') {
          fail(at, 'official_gazette needs host_note_ar explaining where the copy is hosted');
        }
      } else if (!host.endsWith('eta.gov.eg')) {
        fail(at, `official sources must be on eta.gov.eg, got ${host}`);
      }
    }
    if (!isDate(source.retrieved_on)) fail(at, 'retrieved_on must be an ISO date');
    if (!source.title_ar) fail(at, 'missing title_ar');
  }

  /* ------------------------------------------------------------------- decisions */

  const decisionIds = new Set();
  const rows = data.decisions ?? [];
  if (!Array.isArray(rows) || rows.length === 0) fail('decisions', 'must be a non-empty array');

  for (const [index, row] of rows.entries()) {
    const at = `decisions[${index}] (${row.id ?? 'no id'})`;

    if (!/^eta-(einv|erec)-\d{4}-\d{4}$/.test(row.id ?? '')) fail(at, 'id must look like eta-einv-0386-2020');
    if (decisionIds.has(row.id)) fail(at, 'duplicate decision id');
    decisionIds.add(row.id);

    if (!SYSTEMS.has(row.system)) fail(at, `system must be one of ${[...SYSTEMS].join(', ')}`);
    if (!ISSUERS.has(row.issuer)) fail(at, `issuer must be one of ${[...ISSUERS].join(', ')}`);
    if (!/^\d{1,4}$/.test(String(row.number ?? ''))) fail(at, 'number must be digits');
    if (!Number.isInteger(row.year) || row.year < 2000 || row.year > 2100) fail(at, 'year out of range');
    if (typeof row.title_ar !== 'string' || row.title_ar.trim() === '') fail(at, 'missing title_ar');
    else if (row.number && !row.title_ar.includes(String(row.number))) {
      fail(at, 'title_ar does not mention the decision number');
    }

    if (row.issued_on !== null && !isDate(row.issued_on)) fail(at, 'issued_on must be null or an ISO date');
    if (row.effective_from !== null && !isDate(row.effective_from)) fail(at, 'effective_from must be null or an ISO date');
    if (row.issued_on && row.effective_from && row.effective_from < row.issued_on) {
      fail(at, 'effective_from is before issued_on');
    }

    if (!row.phase || typeof row.phase !== 'object') fail(at, 'missing phase object');
    else {
      const { main, sub } = row.phase;
      if (main !== null && (!Number.isInteger(main) || main < 1)) fail(at, 'phase.main must be null or a positive integer');
      if (sub !== null && (!Number.isInteger(sub) || sub < 1)) fail(at, 'phase.sub must be null or a positive integer');
    }

    if (!Array.isArray(row.source_ids) || row.source_ids.length === 0) fail(at, 'needs at least one source');
    else row.source_ids.forEach((id) => {
      if (!sourceIds.has(id)) fail(at, `unknown source id ${id}`);
    });
    if (!sourceIds.has(row.primary_source_id)) fail(at, 'primary_source_id must reference a known source');
    else if (!(row.source_ids ?? []).includes(row.primary_source_id)) {
      fail(at, 'primary_source_id must also appear in source_ids');
    }

    const verification = row.verification ?? {};
    if (!LEVELS.has(verification.level)) fail(at, `verification.level must be one of ${[...LEVELS].join(', ')}`);
    if (!isDate(verification.checked_on)) fail(at, 'verification.checked_on must be an ISO date');
    if (typeof verification.notes !== 'string' || verification.notes.trim() === '') {
      fail(at, 'verification.notes must say how the row was checked');
    }

    // A row whose text was never read may not carry an effective date.
    if (['listing_only', 'referenced'].includes(verification.level) && row.effective_from !== null) {
      fail(at, 'listing_only/referenced rows must not carry an effective_from date');
    }

    if (row.effective_schedule !== undefined) {
      if (!Array.isArray(row.effective_schedule) || row.effective_schedule.length === 0) {
        fail(at, 'effective_schedule must be a non-empty array when present');
      } else {
        let previous = '';
        for (const [step, entry] of row.effective_schedule.entries()) {
          if (!isDate(entry.from)) fail(at, `effective_schedule[${step}].from must be an ISO date`);
          if (previous && entry.from < previous) fail(at, 'effective_schedule must be in ascending date order');
          previous = entry.from;
          if (!entry.scope_ar) fail(at, `effective_schedule[${step}].scope_ar missing`);
        }
        if (row.effective_from && row.effective_from !== row.effective_schedule[0].from) {
          fail(at, 'effective_from must equal the first schedule date');
        }
      }
    }
  }

  const counts = rows.reduce((acc, row) => {
    acc[row.verification.level] = (acc[row.verification.level] ?? 0) + 1;
    return acc;
  }, {});

  return {
    errors,
    stats: {
      decisions: rows.length,
      sources: sourceIds.size,
      levels: counts,
      einvoice: rows.filter((row) => row.system === 'einvoice').length,
      ereceipt: rows.filter((row) => row.system === 'ereceipt').length,
    },
  };
}
