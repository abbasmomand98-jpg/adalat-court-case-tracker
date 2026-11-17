# Adalat — Court Case Tracker & Lawyer Finder (UX Concept)

**Live demo:** https://abbasmomand98-jpg.github.io/adalat-court-case-tracker/
**Code:** https://github.com/abbasmomand98-jpg/adalat-court-case-tracker

Adalat is a court case tracker and lawyer finder for Pakistan. The country's courts carry about 2.3 million pending cases. A litigant's case drags for years — hearing dates change without notice, lawyers charge per hearing with no receipt, nobody explains in plain Urdu what happened in court, and finding a verified lawyer means asking around. People miss hearings, lose cases by default, and pay fees they can't account for.

Adalat tracks every case by its number — the next hearing, the stage, and a countdown; explains what happened in plain Urdu; finds verified lawyers with per-hearing fees; and keeps a receipt ledger for every rupee spent on the case.

## How it works

Open `index.html` in a browser — no build step, no framework, just HTML, CSS and JavaScript. The demo is split into three files so each part is easy to read and change:

- `data.js` — all the sample data: the four sample cases (Civil Suit 1284/2024, Family Suit 342/2025, Criminal Case 78/2025, Rent Case 56/2026), the six verified lawyers, the five-item cost ledger for Civil Suit 1284/2024, the three fee-spotter flags, and Ahmed Raza's story.
- `logic.js` — all the rules, with no DOM code at all: the hearing countdowns, the case search by number, the lawyer finder filters, the ledger maths, and the spotter-quiz scoring. Because it touches no DOM, it can be tested in Node with `node test.js`.
- `app.js` — the page wiring only: it reads the data, calls the logic, and renders the results into the page. Demo "today" is pinned to 17 Nov 2026 so the sample figures stay stable.

Try it with the sample figures:

1. **My Cases** — the board lists all four cases sorted by next hearing. Criminal Case 78/2025 — bail arguments in Karachi — is 2 days away, 19 Nov 2026. Family Suit 342/2025 in Peshawar is 3 days away, 20 Nov. Civil Suit 1284/2024 in Lahore is 7 days away, 24 Nov. Rent Case 56/2026 in Islamabad is 9 days away, 26 Nov. Search any case by its number — 1284/2024 finds the Civil Suit, 999/2026 finds nothing — filter by city, save a case for the court date, and switch hearing alerts on or off per case.
2. **Case Detail** — pick a case and see its hearing timeline, the countdown, and the plain-Urdu summary of what happened. Civil Suit 1284/2024: filed 2024; last hearing 3 Nov 2026, when the respondent sought adjournment and the court fixed 24 Nov for arguments; next hearing 24 Nov 2026, arguments, in 7 days. The Urdu box says the same in plain language: "پچھلی سماعت 3 نومبر کو ہوئی۔ مدعا علیہ نے مہلت مانگی۔ عدالت نے 24 نومبر کو دلائل کے لیے تاریخ مقرر کی۔"
3. **Lawyer Finder** — six verified lawyers, each with a per-hearing fee in rupees. Advocate Fatima Zahra, family law in Peshawar, Rs 6,000 a hearing, 7 years, 4.8. Advocate Ayesha Khan, family law in Lahore, Rs 8,000, 12 years, 4.8. Advocate Hamza Ali, property in Lahore, Rs 9,000, 11 years, 4.6. Advocate Bilal Hussain, property and civil in Rawalpindi, Rs 10,000, 15 years, 4.9. Advocate Sana Malik, criminal in Karachi, Rs 12,000, 9 years, 4.7. Advocate Usman Tariq, civil and corporate in Islamabad, Rs 15,000, 18 years, 4.9. Search by name or specialty, filter by city and case type, sort by fee, rating or experience.
4. **Cost Ledger** — Civil Suit 1284/2024 has cost Rs 87,500 across 9 hearings against a Rs 75,000 estimate — Rs 12,500 over, Rs 9,722 a hearing on average. Lawyer fees are Rs 72,000 (9 hearings × Rs 8,000, receipt AD-2026-1041); the official court fee is Rs 500 (receipt AD-2026-1042); the process server Rs 2,000; certified copies Rs 3,000. And Rs 10,000 of "misc facilitation" is flagged — there is no receipt for it.
5. **Fee Spotter** — a 4-question quiz: three red flags (a full fee upfront in cash with no written agreement; a "guaranteed win" promise — no lawyer can guarantee a verdict; a Rs 5,000 "court fee" when the official fee for most civil suits is Rs 500) and one safe habit (a written fee agreement with per-hearing rates, and a receipt after every hearing). Score 4 of 4 and you spot them all.

Run the tests with `node test.js` — they assert every canonical figure above, plus that all element IDs referenced by `app.js` exist in `index.html` and that the HTML tags balance. `node dom-smoke.js` renders the whole page in a fake DOM and asserts the canonical figures appear on load.

## What you can learn from this project

- **Separating data, logic, and rendering.** `data.js` holds facts, `logic.js` holds rules, `app.js` holds rendering. When the facts change (a new case, a new lawyer), only `data.js` changes. When a rule changes (how the countdown is computed), only `logic.js` changes. This is the single most useful habit in front-end work.
- **Pure functions are testable functions.** Every rule in `logic.js` takes inputs and returns outputs — no DOM, no dates from the clock, no hidden state. That is why `node test.js` can check the countdowns (2, 3, 7 and 9 days) and the ledger maths (Rs 87,500, Rs 12,500 over) without opening a browser.
- **Dates are just subtraction.** `daysBetween` subtracts two ISO dates, so "in 7 days" and "the last hearing was 21 days ago" come from the same function — and `daysToHearing` reuses it for every case on the board. Pin "today" to a fixed date in a demo so the numbers never drift.
- **Normalise input before you look it up.** `normalizeCaseNo` strips spaces and lowercases, so "1284 / 2024" finds the same case as "1284/2024". Users type case numbers in all kinds of formats; the lookup should never fail because of a space.
- **A total is an argument.** `ledgerTotal` adds the five items into one number — Rs 87,500 — and `ledgerOver` subtracts the estimate to name the overrun: Rs 12,500. A list of expenses with no total is just a list; the total is what makes the overrun visible.
- **Flag what has no proof.** `ledgerFlagged` picks out the items with no receipt — only the Rs 10,000 "misc facilitation". The ledger does not delete the suspicious line; it marks it, so the litigant can ask for the receipt before paying it again.
- **A fee is a rate, not a mystery.** Every lawyer shows a per-hearing fee in rupees, so Rs 6,000 and Rs 15,000 can be compared on the same scale. A lawyer who will not name a per-hearing rate is hiding the price — the finder makes the comparison the default.
- **Number formatting that matches everywhere.** `formatPKR` groups digits in thousands — 87,500 stays "87,500" and 15,000 stays "15,000" — the exact figures the mockups, slides and copy use, so a litigant sees the same number on every surface. One formatter, used by every render, is what keeps them identical.
- **localStorage for saved cases, alert toggles and quiz answers.** Your saved cases, your hearing-alert choices and your spotter answers survive a page refresh because `app.js` saves them under three keys (`adalat-saved`, `adalat-alerts`, `adalat-spotter-answers`) and loads them back on start.

## Sample-data honesty note

Every case, lawyer, fee, figure and person in this demo is invented sample data for an unofficial UX concept. These are NOT real court records — always check the case number with the court and the lawyer's standing with the bar council before you act on it.

## Fork it and make it yours

This project is a pattern, not just a demo: a **track the case → explain it plainly → find verified help → count every rupee** tool for any process where the dates move, the jargon hides the truth, and the money has no receipts. Fork the repo and adapt it to a problem people face where you live — tracking a government application through its stages, following a hospital referral and its bills, keeping a receipt ledger for a house renovation with daily-wage workers, or checking a landlord's charges against the rent agreement. Keep the data in `data.js`, the rules in `logic.js`, and the honesty note — and the same pattern will work for your problem too.

---

Adalat is an unofficial UX concept by Muhammad Abbas Khan.
Available for new projects: abbasmomand98@gmail.com
