# Changelog

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
