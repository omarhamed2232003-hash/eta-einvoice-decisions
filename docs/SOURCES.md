# المصادر الرسمية (Sources)

كل صف في `data/decisions.json` يشير إلى مصدر واحد أو أكثر من `sources`، وجميعها على `eta.gov.eg`.

## صفحات القرارات

| المعرّف | الصفحة |
|---|---|
| `src-einv-listing` | [قرارات الإلزام بمنظومة الفاتورة الإلكترونية](https://eta.gov.eg/ar/content/qrarat-alalzam-bmnzwmt-alfatwrt-alalktrwnyt) |
| `src-ereceipt-listing` | [قرارات الإلزام بالتعامل بالإيصال الإلكتروني](https://eta.gov.eg/ar/content/qrarat-alalzam-baltaml-balaysal-alalktrwny) |

## مستندات رسمية مساندة

| المعرّف | المستند |
|---|---|
| `src-pres-phase-1-2` | [E-Invoice Taxpayers presentation – Phase 1 & 2](https://eta.gov.eg/sites/default/files/2021-09/E-Invoice%20Taxpayers%20presentation-Phase%201%20%26%202.pdf) — يذكر تاريخي سريان المرحلتين الأولى والثانية |

## ملفات القرارات

كل قرار له مصدره الخاص (`src-einv-*` أو `src-erec-*`) برابط ملف PDF على eta.gov.eg، ويظهر الرابط في عمود `primary_source_url` داخل `data/decisions.csv`.

## صفحات مساعدة

- الاستعلام عن الممولين بقرارات الإلزام بالفاتورة الإلكترونية: <https://eta.gov.eg/ar/einvoice-inquiry>
- الاستعلام عن الممولين بقرارات الإلزام بالإيصال الإلكتروني: <https://eta.gov.eg/ar/ereceipt-inquiry>

## تنبيه

بعض ملفات القرارات على موقع المصلحة ممسوحة ضوئيًا (صور) وليست نصًا قابلًا للبحث، وبعضها كبير الحجم (عشرات الميجابايت). لذلك يعتمد المشروع على قراءة المستند نفسه لكل صف يعلَّم `document_read`، ويسجّل في `notes` ما لم يُقرأ.
