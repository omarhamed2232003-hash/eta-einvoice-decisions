# المصادر الرسمية (Sources)

كل صف في `data/decisions.json` يشير إلى مصدر واحد أو أكثر من `sources`. جميعها على `eta.gov.eg` ما عدا مصدرًا واحدًا من نوع `official_gazette` (انظر آخر الصفحة).

## صفحات القرارات

| المعرّف | الصفحة |
|---|---|
| `src-einv-listing` | [قرارات الإلزام بمنظومة الفاتورة الإلكترونية](https://eta.gov.eg/ar/content/qrarat-alalzam-bmnzwmt-alfatwrt-alalktrwnyt) |
| `src-ereceipt-listing` | [قرارات الإلزام بالتعامل بالإيصال الإلكتروني](https://eta.gov.eg/ar/content/qrarat-alalzam-baltaml-balaysal-alalktrwny) |

## مستندات رسمية مساندة

| المعرّف | المستند |
|---|---|
| `src-pres-phase-1-2` | [E-Invoice Taxpayers presentation – Phase 1 & 2](https://eta.gov.eg/sites/default/files/2021-09/E-Invoice%20Taxpayers%20presentation-Phase%201%20%26%202.pdf) — يذكر تاريخي سريان المرحلتين الأولى والثانية |

## الوقائع المصرية

| المعرّف | المستند |
|---|---|
| `src-waqae-188-2020` | [الوقائع المصرية – العدد 72 (تابع) – 26 مارس 2020](https://www.elwatannews.com/data/iframe/pdf/12406271071585579395.pdf) — صورة العدد المنشورة على موقع الوطن، وقرار وزير المالية 188/2020 في صفحته الثانية |

هذا هو المصدر الأساسي الوحيد خارج `eta.gov.eg`، لأن القرار 188/2020 لم يُنشر على موقع المصلحة. السجل يوضح في `host_note_ar` أن الرابط نسخة من العدد وليس موقعًا رسميًا.

## ملفات القرارات

كل قرار له مصدره الخاص (`src-einv-*` أو `src-erec-*`) برابط ملف PDF على eta.gov.eg، ويظهر الرابط في عمود `primary_source_url` داخل `data/decisions.csv`.

## صفحات مساعدة

- الاستعلام عن الممولين بقرارات الإلزام بالفاتورة الإلكترونية: <https://eta.gov.eg/ar/einvoice-inquiry>
- الاستعلام عن الممولين بقرارات الإلزام بالإيصال الإلكتروني: <https://eta.gov.eg/ar/ereceipt-inquiry>

## تنبيه

بعض ملفات القرارات على موقع المصلحة ممسوحة ضوئيًا (صور) وليست نصًا قابلًا للبحث، وبعضها كبير الحجم (عشرات الميجابايت). لذلك يعتمد المشروع على قراءة المستند نفسه لكل صف يعلَّم `document_read`، ويسجّل في `notes` ما لم يُقرأ.
