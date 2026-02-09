# SEO Supporting Pages

Use these pages to capture search intent without changing your main landing copy. Create each as a new route under `src/app/` with its own `page.tsx`, unique `<title>` and `<meta name="description">`, and optional JSON-LD (e.g. `Article` or `WebPage`).

---

## 1. Google Forms alternative

| Field | Value |
|-------|--------|
| **URL** | `/google-forms-alternative` |
| **Target keywords** | google forms alternative, better than google forms, google forms replacement, professional form builder |
| **Intent** | Comparison / replacement; user is looking to move off Google Forms. |
| **Content angle** | Compare ShelfCue vs Google Forms: branding, Sheets/Calendar integration, scheduling, client intake. Reuse existing value props from the landing page; add a short comparison table and CTA to sign up. |

---

## 2. Client intake forms

| Field | Value |
|-------|--------|
| **URL** | `/client-intake-forms` |
| **Target keywords** | client intake form, intake form template, client onboarding form, professional intake form |
| **Intent** | Use-case; user needs intake/onboarding forms. |
| **Content angle** | Position ShelfCue for consultants, coaches, and small agencies: one form for intake + scheduling, data in Sheets, optional file uploads. Reuse “client intake & scheduling in one motion” messaging. |

---

## 3. Form to Google Sheets (how-to / feature)

| Field | Value |
|-------|--------|
| **URL** | `/form-to-google-sheets` |
| **Target keywords** | form to google sheets, send form responses to google sheets, form submissions to google sheets, form google sheets integration |
| **Intent** | How-to / feature; user wants forms that write to Sheets. |
| **Content angle** | Explain “form submissions go straight to your Sheet, no Zapier.” Short steps, screenshots or demo link, CTA to try ShelfCue. |

---

## 4. Appointment scheduling forms

| Field | Value |
|-------|--------|
| **URL** | `/appointment-scheduling-forms` |
| **Target keywords** | appointment scheduling form, booking form with calendar, schedule meeting from form, form that books calendar |
| **Intent** | Use-case; user wants scheduling + forms together. |
| **Content angle** | Emphasize “forms that book meetings into Google Calendar.” Tie to client intake and one-link flow. CTA to build a form. |

---

## 5. Typeform / Jotform alternative (optional)

| Field | Value |
|-------|--------|
| **URL** | `/typeform-alternative` or `/jotform-alternative` (or one page covering both) |
| **Target keywords** | typeform alternative, jotform alternative, typeform vs, form builder like typeform |
| **Intent** | Comparison; user is evaluating alternatives. |
| **Content angle** | Compare on branding, pricing, Google native (Sheets/Calendar), no-code. Keep tone factual; reuse landing differentiators. |

---

## Implementation notes

- **Canonical**: Set `metadataBase` and `alternates.canonical` per page to the same base URL used on the homepage (e.g. `https://www.shelfcue.com`).
- **Internal links**: Link from the main landing (e.g. Features or footer) to 1–2 of these pages with descriptive anchor text (e.g. “Google Forms alternative”, “Client intake forms”).
- **Schema**: For how-to or feature pages, add `WebPage` or `Article` JSON-LD; for comparisons, `WebPage` is enough.
- **No duplicate copy**: Repurpose and expand existing messaging; avoid copying the homepage hero word-for-word to prevent thin or duplicate content.
