# Release notes — draft for Omar to read

**Status: DRAFT. Not published. Nothing is tagged.**

## What this is

A dated, sourced dataset of Egyptian Tax Authority e-invoice and e-receipt decisions: 32 decisions (9 e-invoice, 23 e-receipt), each with its issuer, issue date, effective date, verification level and the official source it came from. Every row is `document_read` — the decision text itself was read, not a summary of it. A read-only CLI queries the dataset; a timeline and a coverage table are generated from it and checked by tests.

## What is in it

- **The dataset** — `data/decisions.json`, with a JSON schema, a validator that enforces source and date rules, and a CSV generator.
- **Verification levels** — `document_read` for every row today. The schema also carries `listing_only`, `official_summary` and `referenced` so an unread decision can never masquerade as a read one.
- **Coverage table** — `docs/COVERAGE.md` maps each official file on the Authority's two decision pages to its row, verified automatically: no file without a row, no row without a source.
- **Timeline** — `docs/TIMELINE.md`, generated from the data and checked so it cannot drift.
- **Glossary** — every field and repeating term in Arabic, with the note that the decision text wins over any summary here.
- **CLI** — `list` with filters, `show <id>`, `stats`, `--json` and `--lang ar|en`.

## What it does not do

- **It is not tax or legal advice.** It is a reference to what the decisions say, for someone who will then read the decision.
- It does not claim completeness. It covers the two official decision pages as read on 27 November 2026, and nothing else.
- Dates are only as good as the document: where a decision prints no issue date, the field is empty rather than guessed, and one row's schedule comes from the decision's own table.
- One decision (188/2020) is recorded from a copy of the Official Gazette issue; the row says so.
- It is not affiliated with, endorsed by or connected to the Egyptian Tax Authority.

## Use

```bash
git clone https://github.com/omarhamed2232003-hash/eta-einvoice-decisions.git
cd eta-einvoice-decisions
npm test
node bin/eta-decisions.js stats
```

MIT licensed for the code and the compilation; the decisions themselves are official documents.

## For the published body

Keep the "not tax or legal advice" line and the date of the read-through. The date is what makes the dataset honest a year from now.
