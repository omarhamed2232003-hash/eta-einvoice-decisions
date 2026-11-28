# Where this stands

As of 28 November 2026. Version 0.11.0. **No tag, no release, no visibility change.**

## Verified, and how

- The suite passes locally and in CI on Node 20, 22 and 24 (CI run 46084556847 on commit e2ed1611). The CI log carries the count.
- `npm run validate` enforces the rule the dataset exists for: every row has a source, every row states a `verification.level`, and no date appears that was not read from an official document.
- The committed CSV is checked against the JSON by a test, so the two cannot drift.
- `docs/TIMELINE.md` is checked against the data by a test. `docs/COVERAGE.md` is written by hand from the same read of the two official listing pages on 27 November 2026 and is **not** test-checked against the data.
- One official file was damaged on the Authority's own site (PDF ending in an HTML page); it was repaired locally, its text extracted, and the row's `notes` say so rather than hiding it.

## Reviewed by a person

- The data has been read against its sources by the author only. There is no second reader and no lawyer or accountant has reviewed it.

## Not verified

- **Decision 188/2020**: its text has not been retrieved; it is cited as a basis in other decisions and the row says so.
- **Not tax or legal advice**, and not affiliated with the Authority. The README and the release notes both say this; keep them saying it.
- Coverage stops at 27 November 2026. Decisions published later are not included.

## Cross-repo truth

The register row in the Central KB carries the same version, commit and CI run as this page. If they disagree, the repository is right.

## Pending decisions

- **Tag and release are gated on Omar's review of the README and the release notes.** Nothing is tagged; no GitHub Release exists; visibility is unchanged.
- No npm publish unless Omar asks for it. A tag is not a publish.

## What this page is not

It is not a release announcement and it is not a quality claim. It is the shortest honest answer to "where does this actually stand", written so the reviewer does not have to reconstruct it from the changelog and the findings files.
