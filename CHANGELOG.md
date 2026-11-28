# Changelog

## 0.11.0

- `official_gazette` sources now have to be checkable before they can be used.
  The record must carry `gazette.page` (where the decision text starts),
  `gazette.read_as` (`text` or `scan`) and `gazette.is_mirror`, and a mirror
  needs its host note in English as well as Arabic. A row that claims
  `document_read` from a scanned gazette copy must say in `verification.notes`
  that the scan was read and transcribed.
- `docs/SOURCES.md` states the requirement in full, and why `is_mirror` exists:
  the Official Gazette has no public portal serving these issues, so copies sit
  with other publishers, and saying so is the point rather than an exception.
- The validator rules are no longer duplicated: `scripts/validate.mjs` imports
  `src/validate.js`, and a test fails if the CLI and the library disagree on a
  broken fixture. The duplicated copy is how a rule gets tightened in one place
  and left loose in the other.
- The existing 188/2020 gazette record gains its page, read mode and mirror flag
  from what the record already said in prose.

## 0.10.7

- STATUS.md: three claims corrected after checking them against the tests rather
  than against memory — the review rounds are described without a count that
  reads wrong, the coverage table is marked as hand-written and not test-checked
  (only the timeline is), and the linter's README check is described as what it
  is: an undocumented export fails the suite.

## 0.10.6

- `STATUS.md`: a short page saying where the repository actually stands — what
  was verified and how, who has reviewed it, what is not verified, and what is
  waiting on a decision. It exists so the README review is a two-minute read
  instead of a reconstruction from the changelog and the findings files. Linked
  from the top of the README.
- `test/docs-truth.test.js` now also fails if the version on that page and the
  version in `package.json` disagree.

## 0.10.5

- `test/docs-truth.test.js`: the suite now fails if any document outside the
  changelog and the review findings states a test count. A count written into
  prose goes stale the next time a test is added, and a stale number in a release
  checklist is a claim nobody rechecks.
- RELEASE_CHECKLIST.md: the test-count line no longer carries a number; it says
  `npm test` passes and that the CI log is the authority.

## 0.10.4

- README: added the "جزء من مجموعة" section, which says plainly that this
  dataset is a different subject from the question-bank tools and shares only
  their two rules: every value traces to an official document, and no date is
  written that was not read from one.

## 0.10.3

- `test/docs-links.test.js`: every relative link in the documentation must point
  at a file that exists. Tests 70/70.
## 0.10.2

- The dataset rules moved out of `scripts/validate.mjs` into `src/validate.js`
  as `validateDataset(data)`, so they can be tested against broken fixtures
  without a file on disk. The script now only reads, prints and sets the exit
  code, and it accepts an optional path argument.
- Tests 69/69: every rule in the validator now has a fixture that breaks it —
  dataset fields, source hosts, the gazette source type, id patterns, duplicate
  ids, dates, phases, source references, verification levels and the effective
  schedule — plus a test that the real dataset is clean.
## 0.10.1

- `--version` on the CLI, alongside the existing `--help`.
- CI matrix now runs Node 20, 22 and 24. Tests 25/25.
## 0.10.0

- `list --format csv`: the filtered list as RFC 4180 CSV with a fixed header
  (id, number, year, system, issuer, issued_on, effective_from,
  verification_level, checked_on, title_ar, title_en, primary_source_id), so
  the dataset opens in a spreadsheet without a separate script. Works with the
  same filters as the text output.
- Tests 23/23, including quote balancing over the whole file and the refusal of
  `--format csv` on a command that does not list.
## 0.9.1

- `RELEASE_CHECKLIST.md`: what has to happen before the first tag, split into
  before, at, and after, with the repository-specific gates underneath.
- `docs/RELEASE_NOTES_DRAFT.md`: draft first-release notes for Omar to read
  next to the README, including a plain "what it does not do" section. Draft
  only: nothing is tagged or published.
## 0.9.0

- `bin/eta-decisions.js`: a read-only query tool over the dataset, so the
  decisions are usable without opening the JSON. `list` with filters
  (`--system`, `--year`, `--issuer`, `--verification`, `--effective-before`,
  `--q`, `--limit`), `show <id>` for one decision in full, `stats` for counts
  by system, year and verification level; `--json` and `--lang ar|en`.
- Exit codes are deliberate: 0 for a successful query even with no matches,
  1 when `show` cannot find the id, 2 for bad usage. A missing date prints as
  `----------` rather than being guessed.
- Tests: 9 new CLI tests (18 total), covering each filter against what the data
  actually holds, the JSON output, the empty result, `show`, `stats` totals and
  the usage errors.
## 0.8.0

- Add `docs/GLOSSARY.md`: every data field and the terms that repeat across the
  decisions, in Arabic, with a note that the decision text wins over the summary.
- Add a test that fails when a field appears in the data without being
  documented. It immediately found one: `effective_schedule`, the per-governorate
  schedule used by 323/2022, which is now documented.
## 0.7.0

- Add `docs/TIMELINE.md`, generated from `data/decisions.json` by
  `npm run build:timeline` and checked by a test so it cannot drift.
## 0.6.0 — 2026-11-27

- استرجاع قرار وزير المالية 38/2024: ملف المصلحة تالف (PDF ينتهي بصفحة HTML)، فأُصلح محليًا بأداة `mutool clean` ثم استُخرج نصه المطبوع.
- الصف أصبح `document_read`: صدر في 2024-01-30 في الوقائع المصرية العدد 24 تابع (ب)، ويُعمل به من اليوم التالي للنشر، وأول تاريخ إلزام في جدوله 2024-02-01.
- `effective_schedule` كامل: المراحل الفرعية 3 و4 و5 من المرحلة الرابعة (2024-02-01، 2024-05-15، 2024-07-15)، والمرحلة الخامسة (2024-09-15)، والمراحل السادسة إلى التاسعة بفرعيها (من 2024-11-15 إلى 2025-12-31).
- جميع الصفوف الـ32 الآن `document_read`، ولا صف في `listing_only` أو `official_summary` أو `referenced`.
- تحديث `docs/COVERAGE.md` وREADME.

## 0.5.0 — 2026-11-27

- `docs/COVERAGE.md`: جدول يربط كل ملف قرار على صفحتي المصلحة الرسميتين (8 ملفات للفاتورة، 23 للإيصال) بصفه في البيانات ومستواه وتاريخ سريانه. تم التحقق آليًا: لا ملف بلا صف ولا صف بلا مصدر.
- `schema/decision.schema.json` تحديث ليطابق البيانات: نوع المصدر `official_gazette` وحقلا `gazette` و`host_note_ar`.
- اختبار جديد: كل مصدر في الملف مستخدم في صف واحد على الأقل.
- 7 اختبارات بدل 6.

## 0.4.0 — 2026-11-27

- قراءة نص القرارين 386/2020 (المرحلة الأولى) و518/2020 (المرحلة الثانية) من ملفي المصلحة الرسميين، بعد أن كان تاريخهما مأخوذًا من عرض تقديمي رسمي فقط.
- 386/2020: المادة الأولى تُلزم 134 شركة اعتبارًا من 2020-11-15، والمادة الثانية تسرد الشروط الفنية، والرابعة تنص على العمل به من تاريخ صدوره.
- 518/2020: المادة الأولى تُلزم 347 شركة اعتبارًا من 2021-02-15، والقرار يستند إلى 188/2020 و386/2020.
- الصفان أصبحا `document_read`؛ لم يُطبع تاريخ إصدار على نص أي منهما فبقي `issued_on` فارغًا.
- المستويات الآن: 31 `document_read`، 1 `listing_only`، ولا صف في `official_summary`.

## 0.3.0 — 2026-11-27

- استرجاع نص قرار وزير المالية 188/2020 (الأساس القانوني للمنظومة) من صورة عدد الوقائع المصرية 72 (تابع) الصادر في 26 مارس 2020: ثلاث مواد، والتوقيع الإلكتروني والكود الموحد في المادة الأولى، والسريان من اليوم التالي للنشر.
- الصف أصبح `document_read` بتاريخ إصدار 2020-03-26 وسريان 2020-03-27 بدل `referenced` بلا تواريخ.
- نوع مصدر جديد `official_gazette` مع شروط في المدقق: رقم العدد وتاريخه وتوضيح أن الرابط نسخة من العدد. المدقق والاختبارات تفرضها.
- تحديث `docs/SOURCES.md` و`docs/METHODOLOGY.md` وREADME.
- المستويات الآن: 29 `document_read`، 2 `official_summary`، 1 `listing_only`.

## 0.2.0 — 2026-11-27

- قراءة نص 19 قرارًا إضافيًا من قرارات الإيصال الإلكتروني (ملفات PDF ممسوحة) واستخراج تاريخ السريان والنطاق لكل منها، إضافة إلى قرار وزير المالية 230/2022 وجدوله الزمني.
- مستويات التحقق أصبحت: 28 `document_read`، 2 `official_summary`، 1 `referenced`، 1 `listing_only`.
- إضافة جدول مراحل الإيصال الإلكتروني إلى README.
- تسجيل أن ملف قرار 38/2024 الرسمي تالف على موقع المصلحة (PDF ينتهي بصفحة HTML) ولم يُقرأ نصه.

## 0.1.0 — 2026-11-27

- الإصدار الأول: 32 قرارًا (9 للفاتورة الإلكترونية، 23 للإيصال الإلكتروني) مجمّعة من صفحتي القرارات الرسميتين على eta.gov.eg.
- 9 قرارات بمستوى `document_read` (قُرئ نصها)، منها 6 قرارات فاتورة إلكترونية و3 قرارات إيصال إلكتروني.
- قرارا الفاتورة الإلكترونية 386/2020 و518/2020 بمستوى `official_summary` (التاريخ من عرض رسمي للمصلحة).
- قرار وزير المالية 188/2020 مسجّل بمستوى `referenced` (مذكور في قرارات أخرى، نصه لم يُسترجع).
- 20 قرار إيصال إلكتروني بمستوى `listing_only`: الرابط الرسمي مثبت، والنص لم يُقرأ بعد.
- مدقق يفرض قواعد المصدر والتاريخ ومستويات التحقق، ومولّد CSV، و6 اختبارات، وCI على Node 20 و22.
