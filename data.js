// Adalat — Court Case Tracker & Lawyer Finder (UX Concept).
// IMPORTANT: every case, lawyer, fee, figure and person below is
// SAMPLE data invented for this UX concept demo. These are NOT real
// court records — always check the case number with the court and
// the lawyer's standing with the bar council before you act on it.

// SAMPLE CASES (all marked sample):
//   (1) Civil Suit 1284/2024 — property inheritance, Lahore High
//       Court — next hearing 24 Nov 2026 — stage: Arguments — last
//       hearing 3 Nov 2026: respondent sought adjournment, court
//       fixed 24 Nov for arguments.
//   (2) Family Suit 342/2025 — khula & maintenance, Family Court
//       Peshawar — next hearing 20 Nov 2026 — stage: Evidence.
//   (3) Criminal Case 78/2025 — bail matter, District & Sessions
//       Court Karachi — next hearing 19 Nov 2026 — stage: Bail
//       arguments.
//   (4) Rent Case 56/2026 — eviction, Rent Controller Islamabad —
//       next hearing 26 Nov 2026 — stage: Written statement.
// From 17 Nov 2026 the countdowns read 2, 3, 7 and 9 days.
var CASES = [
  { id: "criminal-78-2025", number: "78/2025", title: "Criminal Case 78/2025",
    type: "Bail matter", court: "District & Sessions Court, Karachi",
    city: "Karachi", stage: "Bail arguments",
    nextISO: "2026-11-19", nextLabel: "19 Nov 2026",
    lastISO: "2026-11-03", lastLabel: "3 Nov 2026",
    lastNote: "Bail arguments partly heard. Court fixed 19 Nov to conclude arguments.",
    filed: "2025",
    urdu: ["پچھلی سماعت 3 نومبر کو ہوئی۔ ضمانت پر دلائل جزوی طور پر سنے گئے۔",
           "عدالت نے 19 نومبر کو دلائل مکمل کرنے کے لیے تاریخ مقرر کی۔"] },
  { id: "family-342-2025", number: "342/2025", title: "Family Suit 342/2025",
    type: "Khula & maintenance", court: "Family Court, Peshawar",
    city: "Peshawar", stage: "Evidence",
    nextISO: "2026-11-20", nextLabel: "20 Nov 2026",
    lastISO: "2026-11-05", lastLabel: "5 Nov 2026",
    lastNote: "Petitioner's evidence recorded. Court fixed 20 Nov for the respondent's evidence.",
    filed: "2025",
    urdu: ["پچھلی سماعت 5 نومبر کو ہوئی۔ درخواست گزار کی شہادت ریکارڈ ہوئی۔",
           "عدالت نے 20 نومبر کو مدعا علیہ کی شہادت کے لیے تاریخ مقرر کی۔"] },
  { id: "civil-1284-2024", number: "1284/2024", title: "Civil Suit 1284/2024",
    type: "Property inheritance", court: "Lahore High Court",
    city: "Lahore", stage: "Arguments",
    nextISO: "2026-11-24", nextLabel: "24 Nov 2026",
    lastISO: "2026-11-03", lastLabel: "3 Nov 2026",
    lastNote: "Respondent sought adjournment. Court fixed 24 Nov for arguments.",
    filed: "2024",
    urdu: ["پچھلی سماعت 3 نومبر کو ہوئی۔ مدعا علیہ نے مہلت مانگی۔",
           "عدالت نے 24 نومبر کو دلائل کے لیے تاریخ مقرر کی۔",
           "اصل ٹائٹل ڈیڈ ساتھ لائیں۔"] },
  { id: "rent-56-2026", number: "56/2026", title: "Rent Case 56/2026",
    type: "Eviction", court: "Rent Controller, Islamabad",
    city: "Islamabad", stage: "Written statement",
    nextISO: "2026-11-26", nextLabel: "26 Nov 2026",
    lastISO: "2026-11-10", lastLabel: "10 Nov 2026",
    lastNote: "Tenant asked for more time to file the written statement. Court fixed 26 Nov.",
    filed: "2026",
    urdu: ["پچھلی سماعت 10 نومبر کو ہوئی۔ کرایہ دار نے جواب داخل کرنے کے لیے وقت مانگا۔",
           "عدالت نے 26 نومبر کو تحریری جواب کے لیے تاریخ مقرر کی۔"] }
];

// SAMPLE LAWYERS (verified badge on all):
//   Advocate Ayesha Khan — family law, Lahore — Rs 8,000/hearing — 12 yrs — 4.8
//   Advocate Bilal Hussain — property/civil, Rawalpindi — Rs 10,000/hearing — 15 yrs — 4.9
//   Advocate Sana Malik — criminal, Karachi — Rs 12,000/hearing — 9 yrs — 4.7
//   Advocate Usman Tariq — civil/corporate, Islamabad — Rs 15,000/hearing — 18 yrs — 4.9
//   Advocate Fatima Zahra — family, Peshawar — Rs 6,000/hearing — 7 yrs — 4.8
//   Advocate Hamza Ali — property, Lahore — Rs 9,000/hearing — 11 yrs — 4.6
var LAWYERS = [
  { id: "ayesha-khan", name: "Advocate Ayesha Khan", specialty: "Family law",
    city: "Lahore", fee: 8000, years: 12, rating: 4.8, verified: true },
  { id: "bilal-hussain", name: "Advocate Bilal Hussain", specialty: "Property / civil",
    city: "Rawalpindi", fee: 10000, years: 15, rating: 4.9, verified: true },
  { id: "sana-malik", name: "Advocate Sana Malik", specialty: "Criminal",
    city: "Karachi", fee: 12000, years: 9, rating: 4.7, verified: true },
  { id: "usman-tariq", name: "Advocate Usman Tariq", specialty: "Civil / corporate",
    city: "Islamabad", fee: 15000, years: 18, rating: 4.9, verified: true },
  { id: "fatima-zahra", name: "Advocate Fatima Zahra", specialty: "Family law",
    city: "Peshawar", fee: 6000, years: 7, rating: 4.8, verified: true },
  { id: "hamza-ali", name: "Advocate Hamza Ali", specialty: "Property",
    city: "Lahore", fee: 9000, years: 11, rating: 4.6, verified: true }
];

// COST LEDGER (Civil Suit 1284/2024, sample): total spent Rs 87,500
// across 9 hearings vs estimate Rs 75,000 — Rs 12,500 over.
//   Lawyer fees Rs 72,000 (9 x Rs 8,000) — receipt AD-2026-1041
//   Official court fee Rs 500 — receipt AD-2026-1042
//   Process server Rs 2,000 — receipt AD-2026-1043
//   Certified copies Rs 3,000 — receipt AD-2026-1044
//   "Misc facilitation" Rs 10,000 — FLAGGED, no receipt.
//   72,000 + 500 + 2,000 + 3,000 + 10,000 = 87,500.
var LEDGER_CASE = { caseId: "civil-1284-2024", caseTitle: "Civil Suit 1284/2024",
  estimate: 75000, hearings: 9 };
var LEDGER_ITEMS = [
  { id: "lawyer-fees", label: "Lawyer fees — 9 hearings × Rs 8,000",
    amount: 72000, receipt: "AD-2026-1041", flagged: false },
  { id: "court-fee", label: "Official court fee",
    amount: 500, receipt: "AD-2026-1042", flagged: false },
  { id: "process-server", label: "Process server",
    amount: 2000, receipt: "AD-2026-1043", flagged: false },
  { id: "certified-copies", label: "Certified copies",
    amount: 3000, receipt: "AD-2026-1044", flagged: false },
  { id: "misc-facilitation", label: "\u201cMisc facilitation\u201d",
    amount: 10000, receipt: null, flagged: true }
];

// FEE SPOTTER: 3 red flags, plus one safe habit as a control question.
//   1. Lawyer demands the full case fee upfront in cash with no
//      written agreement — walk away.
//   2. A "guaranteed win" promise — no lawyer can guarantee a verdict.
//   3. Charges Rs 5,000 for a "court fee" — the official court fee
//      for most civil suits is Rs 500; always ask for the official
//      receipt.
var SPOTTER_FLAGS = [
  { id: "full-fee-cash", scenario: "The lawyer demands the full case fee upfront in cash, with no written agreement.",
    isFlag: true, why: "RED FLAG — full fee upfront in cash with nothing in writing means you have no record of what you paid or what was promised. Walk away." },
  { id: "guaranteed-win", scenario: "The lawyer promises a \u201cguaranteed win\u201d if you hire him.",
    isFlag: true, why: "RED FLAG — no lawyer can guarantee a verdict. A judge decides the case, not the lawyer. A guarantee is a sales line, not a legal fact." },
  { id: "five-thousand-fee", scenario: "The lawyer charges Rs 5,000 for the \u201ccourt fee\u201d on a civil suit.",
    isFlag: true, why: "RED FLAG — the official court fee for most civil suits is Rs 500. Rs 5,000 is ten times the official fee. Always ask for the official receipt." },
  { id: "written-agreement", scenario: "The lawyer gives a written fee agreement with per-hearing rates, and a receipt after every hearing.",
    isFlag: false, why: "SAFE — a written agreement with per-hearing rates and a receipt after every hearing is how an honest lawyer works. That is exactly what Adalat\u2019s ledger tracks." }
];

// PERSONA: Ahmed Raza, 42, Rawalpindi — inherited-property case
// pending 3 years; missed one hearing when the date changed without
// notice; paid Rs 15,000 per hearing with no receipts. Illustrative
// proto-persona — a design hypothesis, not an interviewed participant.
var PERSONA = { name: "Ahmed Raza", age: 42, city: "Rawalpindi",
  caseType: "inherited-property", yearsPending: 3, missedHearings: 1,
  feePerHearing: 15000, receipts: false };

if (typeof module !== "undefined") {
  module.exports = { CASES: CASES, LAWYERS: LAWYERS,
    LEDGER_CASE: LEDGER_CASE, LEDGER_ITEMS: LEDGER_ITEMS,
    SPOTTER_FLAGS: SPOTTER_FLAGS, PERSONA: PERSONA };
}
