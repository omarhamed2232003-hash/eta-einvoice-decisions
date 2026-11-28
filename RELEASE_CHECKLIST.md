# Release checklist — eta-einvoice-decisions

## Before the tag

- [ ] **Omar reads the README and these release notes before anything is tagged or released.** This is a standing condition relayed by main, not something this file can grant or waive: nothing is tagged until he has read both.
- [ ] `package.json` version, `CHANGELOG.md` top entry and the tag name agree.
- [ ] CI is green on the default branch (`test.yml`, Node 20, 22 and 24).
- [ ] `npm test` passes locally on a clean clone.
- [ ] A read-through for personal data, secrets, API keys and copied or third-party content. Nothing of that kind ships: no author names, no addresses, no tokens, no scraped text.
- [ ] The scope statement below is still true, and the release notes say what the project does *not* do.
- [ ] No repository transfer, no visibility change, no GitHub Release draft. The Amberline move waits on Omar's per-repo approval.

## At the tag

- [ ] Annotated tag `vX.Y.Z` on the reviewed commit, message `vX.Y.Z: <one line>`.
- [ ] Release body is the text of `docs/RELEASE_NOTES_DRAFT.md` at that commit, unchanged except for the version.
- [ ] Check the published page once after creating it: title, tag, body, and that no attachment or asset was added by accident.

## After the tag

- [ ] No npm publish unless Omar asks for it. A tag is not a publish.
- [ ] Record the tag, the release URL and the CI run in the Central KB row.

## Specific to this repository

- [ ] **Open decision:** the `official_gazette` source type used for 188/2020 is still marked pending in the Central KB. Omar decides whether that source type stays as it is, is renamed, or the row is described differently.
- [ ] The read-through date in the README and `docs/SOURCES.md` matches the data (27 November 2026), and the release notes carry it.
- [ ] "Not tax or legal advice" and "not affiliated with the Authority" are in the release notes and the README.
- [ ] Every row's verification level is still `document_read`; if any row regresses, the level must change with it.
- [ ] `npm test` covers the schema rules, the source-per-row check, the coverage table and the timeline drift check (the count in the CI log is the authority; do not write one here).
- [ ] The CSV generator still runs, so a reader can take the data into a spreadsheet.
