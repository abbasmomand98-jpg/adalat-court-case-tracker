// Adalat smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. The 4 sample cases: numbers, courts, stages, next hearings.
eq(data.CASES.length, 4, "board has 4 cases");
function byId(id) {
  for (var i = 0; i < data.CASES.length; i++) {
    if (data.CASES[i].id === id) return data.CASES[i];
  }
  return null;
}
deep(byId("civil-1284-2024"), { id: "civil-1284-2024", number: "1284/2024",
  title: "Civil Suit 1284/2024", type: "Property inheritance",
  court: "Lahore High Court", city: "Lahore", stage: "Arguments",
  nextISO: "2026-11-24", nextLabel: "24 Nov 2026",
  lastISO: "2026-11-03", lastLabel: "3 Nov 2026",
  lastNote: "Respondent sought adjournment. Court fixed 24 Nov for arguments.",
  filed: "2024",
  urdu: ["پچھلی سماعت 3 نومبر کو ہوئی۔ مدعا علیہ نے مہلت مانگی۔",
         "عدالت نے 24 نومبر کو دلائل کے لیے تاریخ مقرر کی۔",
         "اصل ٹائٹل ڈیڈ ساتھ لائیں۔"] },
     "Civil Suit 1284/2024: Lahore High Court, Arguments, next 24 Nov 2026");
deep(byId("family-342-2025"), { id: "family-342-2025", number: "342/2025",
  title: "Family Suit 342/2025", type: "Khula & maintenance",
  court: "Family Court, Peshawar", city: "Peshawar", stage: "Evidence",
  nextISO: "2026-11-20", nextLabel: "20 Nov 2026",
  lastISO: "2026-11-05", lastLabel: "5 Nov 2026",
  lastNote: "Petitioner's evidence recorded. Court fixed 20 Nov for the respondent's evidence.",
  filed: "2025",
  urdu: ["پچھلی سماعت 5 نومبر کو ہوئی۔ درخواست گزار کی شہادت ریکارڈ ہوئی۔",
         "عدالت نے 20 نومبر کو مدعا علیہ کی شہادت کے لیے تاریخ مقرر کی۔"] },
     "Family Suit 342/2025: Family Court Peshawar, Evidence, next 20 Nov 2026");
deep(byId("criminal-78-2025"), { id: "criminal-78-2025", number: "78/2025",
  title: "Criminal Case 78/2025", type: "Bail matter",
  court: "District & Sessions Court, Karachi", city: "Karachi",
  stage: "Bail arguments",
  nextISO: "2026-11-19", nextLabel: "19 Nov 2026",
  lastISO: "2026-11-03", lastLabel: "3 Nov 2026",
  lastNote: "Bail arguments partly heard. Court fixed 19 Nov to conclude arguments.",
  filed: "2025",
  urdu: ["پچھلی سماعت 3 نومبر کو ہوئی۔ ضمانت پر دلائل جزوی طور پر سنے گئے۔",
         "عدالت نے 19 نومبر کو دلائل مکمل کرنے کے لیے تاریخ مقرر کی۔"] },
     "Criminal Case 78/2025: District & Sessions Court Karachi, Bail arguments, next 19 Nov 2026");
deep(byId("rent-56-2026"), { id: "rent-56-2026", number: "56/2026",
  title: "Rent Case 56/2026", type: "Eviction",
  court: "Rent Controller, Islamabad", city: "Islamabad",
  stage: "Written statement",
  nextISO: "2026-11-26", nextLabel: "26 Nov 2026",
  lastISO: "2026-11-10", lastLabel: "10 Nov 2026",
  lastNote: "Tenant asked for more time to file the written statement. Court fixed 26 Nov.",
  filed: "2026",
  urdu: ["پچھلی سماعت 10 نومبر کو ہوئی۔ کرایہ دار نے جواب داخل کرنے کے لیے وقت مانگا۔",
         "عدالت نے 26 نومبر کو تحریری جواب کے لیے تاریخ مقرر کی۔"] },
     "Rent Case 56/2026: Rent Controller Islamabad, Written statement, next 26 Nov 2026");

// 2. Countdowns from 17 Nov 2026: 2, 3, 7 and 9 days.
eq(L.daysToHearing(byId("criminal-78-2025"), "2026-11-17"), 2, "Criminal Case is 2 days away");
eq(L.daysToHearing(byId("family-342-2025"), "2026-11-17"), 3, "Family Suit is 3 days away");
eq(L.daysToHearing(byId("civil-1284-2024"), "2026-11-17"), 7, "Civil Suit is 7 days away");
eq(L.daysToHearing(byId("rent-56-2026"), "2026-11-17"), 9, "Rent Case is 9 days away");
eq(L.daysBetween("2026-11-03", "2026-11-24"), 21, "3 Nov to 24 Nov is 21 days");
eq(L.daysBetween("2026-11-17", "2026-11-17"), 0, "same day is 0 days");

// 3. Sort by next hearing: Criminal, Family, Civil, Rent.
deep(L.sortCasesByNext(data.CASES).map(function (c) { return c.id; }),
     ["criminal-78-2025", "family-342-2025", "civil-1284-2024", "rent-56-2026"],
     "next-hearing sort puts Criminal first and Rent last");

// 4. Case search by number: normalisation, found, not-found.
eq(L.normalizeCaseNo("1284 / 2024"), "1284/2024", "spaces are stripped from a case number");
eq(L.normalizeCaseNo("Civil Suit 1284/2024"), "civilsuit1284/2024", "a full case title normalises");
eq(L.findCaseByNumber(data.CASES, "1284/2024").id, "civil-1284-2024", "1284/2024 finds the Civil Suit");
eq(L.findCaseByNumber(data.CASES, "1284 / 2024").id, "civil-1284-2024", "1284 / 2024 with spaces finds the Civil Suit");
eq(L.findCaseByNumber(data.CASES, "342/2025").id, "family-342-2025", "342/2025 finds the Family Suit");
eq(L.findCaseByNumber(data.CASES, "78/2025").id, "criminal-78-2025", "78/2025 finds the Criminal Case");
eq(L.findCaseByNumber(data.CASES, "56/2026").id, "rent-56-2026", "56/2026 finds the Rent Case");
eq(L.findCaseByNumber(data.CASES, "999/2026"), null, "999/2026 finds no case");
eq(L.findCaseByNumber(data.CASES, ""), null, "an empty search finds no case");

// 5. Case board: search + city filter.
eq(L.filterCases(data.CASES, "", "all").length, 4, "no filter shows 4 cases");
eq(L.filterCases(data.CASES, "", "Lahore").length, 1, "Lahore filter keeps 1 case");
eq(L.filterCases(data.CASES, "", "Karachi").length, 1, "Karachi filter keeps 1 case");
eq(L.filterCases(data.CASES, "1284", "all").length, 1, "searching 1284 finds 1 case");
eq(L.filterCases(data.CASES, "FAMILY", "all").length, 1, "search is case-insensitive");
eq(L.filterCases(data.CASES, "xyz", "all").length, 0, "an unknown search finds nothing");

// 6. The 6 verified lawyers: fees, cities, ratings.
eq(data.LAWYERS.length, 6, "finder has 6 lawyers");
eq(data.LAWYERS.filter(function (l) { return l.verified; }).length, 6, "all 6 lawyers are verified");
function lawyerById(id) {
  for (var i = 0; i < data.LAWYERS.length; i++) {
    if (data.LAWYERS[i].id === id) return data.LAWYERS[i];
  }
  return null;
}
deep(lawyerById("ayesha-khan"), { id: "ayesha-khan", name: "Advocate Ayesha Khan",
  specialty: "Family law", city: "Lahore", fee: 8000, years: 12, rating: 4.8, verified: true },
     "Ayesha Khan: family law, Lahore, Rs 8,000/hearing, 12 yrs, 4.8");
deep(lawyerById("bilal-hussain"), { id: "bilal-hussain", name: "Advocate Bilal Hussain",
  specialty: "Property / civil", city: "Rawalpindi", fee: 10000, years: 15, rating: 4.9, verified: true },
     "Bilal Hussain: property/civil, Rawalpindi, Rs 10,000/hearing, 15 yrs, 4.9");
deep(lawyerById("sana-malik"), { id: "sana-malik", name: "Advocate Sana Malik",
  specialty: "Criminal", city: "Karachi", fee: 12000, years: 9, rating: 4.7, verified: true },
     "Sana Malik: criminal, Karachi, Rs 12,000/hearing, 9 yrs, 4.7");
deep(lawyerById("usman-tariq"), { id: "usman-tariq", name: "Advocate Usman Tariq",
  specialty: "Civil / corporate", city: "Islamabad", fee: 15000, years: 18, rating: 4.9, verified: true },
     "Usman Tariq: civil/corporate, Islamabad, Rs 15,000/hearing, 18 yrs, 4.9");
deep(lawyerById("fatima-zahra"), { id: "fatima-zahra", name: "Advocate Fatima Zahra",
  specialty: "Family law", city: "Peshawar", fee: 6000, years: 7, rating: 4.8, verified: true },
     "Fatima Zahra: family, Peshawar, Rs 6,000/hearing, 7 yrs, 4.8");
deep(lawyerById("hamza-ali"), { id: "hamza-ali", name: "Advocate Hamza Ali",
  specialty: "Property", city: "Lahore", fee: 9000, years: 11, rating: 4.6, verified: true },
     "Hamza Ali: property, Lahore, Rs 9,000/hearing, 11 yrs, 4.6");

// 7. Lawyer finder: search + city/type filter + sort by fee.
eq(L.filterLawyers(data.LAWYERS, "", "all", "all").length, 6, "no filter shows 6 lawyers");
eq(L.filterLawyers(data.LAWYERS, "", "Lahore", "all").length, 2, "Lahore filter keeps 2 lawyers");
eq(L.filterLawyers(data.LAWYERS, "", "all", "family").length, 2, "family filter keeps 2 lawyers");
eq(L.filterLawyers(data.LAWYERS, "", "all", "criminal").length, 1, "criminal filter keeps 1 lawyer");
eq(L.filterLawyers(data.LAWYERS, "ayesha", "all", "all").length, 1, "searching ayesha finds 1 lawyer");
eq(L.filterLawyers(data.LAWYERS, "", "Peshawar", "family").length, 1, "Peshawar + family keeps Fatima Zahra");
deep(L.sortLawyers(data.LAWYERS, "fee").map(function (l) { return l.id; }),
     ["fatima-zahra", "ayesha-khan", "hamza-ali", "bilal-hussain", "sana-malik", "usman-tariq"],
     "fee sort puts Fatima Zahra (Rs 6,000) first and Usman Tariq (Rs 15,000) last");
eq(L.sortLawyers(data.LAWYERS, "rating")[0].id, "bilal-hussain", "rating sort puts a 4.9 lawyer first");
eq(L.sortLawyers(data.LAWYERS, "years")[0].id, "usman-tariq", "years sort puts Usman Tariq (18 yrs) first");

// 8. Cost ledger: total Rs 87,500 vs estimate Rs 75,000.
deep(data.LEDGER_CASE, { caseId: "civil-1284-2024", caseTitle: "Civil Suit 1284/2024",
  estimate: 75000, hearings: 9 }, "ledger is Civil Suit 1284/2024, estimate Rs 75,000, 9 hearings");
eq(data.LEDGER_ITEMS.length, 5, "ledger has 5 items");
eq(L.ledgerTotal(data.LEDGER_ITEMS), 87500, "ledger total is Rs 87,500");
eq(L.ledgerOver(data.LEDGER_ITEMS, 75000), 12500, "ledger is Rs 12,500 over estimate");
eq(L.ledgerOver(data.LEDGER_ITEMS, 100000), 0, "a higher estimate is never negative over");
eq(L.ledgerFlagged(data.LEDGER_ITEMS).length, 1, "one item is flagged");
eq(L.ledgerFlagged(data.LEDGER_ITEMS)[0].id, "misc-facilitation", "the flagged item is misc facilitation");
eq(L.ledgerFlagged(data.LEDGER_ITEMS)[0].amount, 10000, "the flagged item is Rs 10,000");
eq(L.ledgerFlagged(data.LEDGER_ITEMS)[0].receipt, null, "the flagged item has no receipt");
eq(L.costPerHearing(data.LEDGER_ITEMS, 9), 9722, "Rs 87,500 across 9 hearings is Rs 9,722 a hearing");
eq(L.costPerHearing(data.LEDGER_ITEMS, 0), 0, "zero hearings is zero a hearing");
deep(data.LEDGER_ITEMS[0], { id: "lawyer-fees", label: "Lawyer fees — 9 hearings × Rs 8,000",
  amount: 72000, receipt: "AD-2026-1041", flagged: false },
     "lawyer fees: Rs 72,000, receipt AD-2026-1041");
deep(data.LEDGER_ITEMS[1], { id: "court-fee", label: "Official court fee",
  amount: 500, receipt: "AD-2026-1042", flagged: false },
     "official court fee: Rs 500, receipt AD-2026-1042");

// 9. Fee-spotter quiz: 3 red flags + 1 safe habit.
eq(data.SPOTTER_FLAGS.length, 4, "spotter quiz has 4 scenarios");
eq(data.SPOTTER_FLAGS.filter(function (f) { return f.isFlag; }).length, 3,
   "spotter quiz has 3 red flags");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[0], true), true, "full fee upfront in cash is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[0], false), false, "calling it safe is wrong");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[1], true), true, "a guaranteed win is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[2], true), true, "a Rs 5,000 court fee is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[3], false), true, "a written agreement with receipts is safe");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[3], true), false, "calling the safe habit a flag is wrong");
var perfect = {};
data.SPOTTER_FLAGS.forEach(function (f) { perfect[f.id] = f.isFlag; });
var sPerfect = L.scoreQuiz(data.SPOTTER_FLAGS, perfect);
eq(sPerfect.correct, 4, "perfect answers score 4 of 4");
eq(sPerfect.perfect, true, "perfect answers are perfect");
var sNone = L.scoreQuiz(data.SPOTTER_FLAGS, {});
eq(sNone.correct, 0, "no answers score 0 of 4");
eq(sNone.perfect, false, "no answers are not perfect");
var sHalf = L.scoreQuiz(data.SPOTTER_FLAGS, { "full-fee-cash": true, "guaranteed-win": true });
eq(sHalf.correct, 2, "two right answers score 2 of 4");

// 10. Pakistani digit grouping.
eq(L.formatPKR(500), "500", "Rs 500");
eq(L.formatPKR(2000), "2,000", "Rs 2,000");
eq(L.formatPKR(8000), "8,000", "Rs 8,000");
eq(L.formatPKR(10000), "10,000", "Rs 10,000");
eq(L.formatPKR(12500), "12,500", "Rs 12,500");
eq(L.formatPKR(72000), "72,000", "Rs 72,000");
eq(L.formatPKR(75000), "75,000", "Rs 75,000");
eq(L.formatPKR(87500), "87,500", "Rs 87,500");

// 11. Persona: the canonical facts.
deep(data.PERSONA, { name: "Ahmed Raza", age: 42, city: "Rawalpindi",
  caseType: "inherited-property", yearsPending: 3, missedHearings: 1,
  feePerHearing: 15000, receipts: false },
     "Ahmed Raza, 42, Rawalpindi, 3 years pending, 1 missed hearing, Rs 15,000/hearing, no receipts");

// 12. Every element id referenced by app.js exists in index.html.
var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var appJs = fs.readFileSync(__dirname + "/app.js", "utf8");
var ids = {};
var m;
var idRe = /el\("([^"]+)"\)/g;
while ((m = idRe.exec(appJs)) !== null) ids[m[1]] = true;
var idList = Object.keys(ids);
ok(idList.length >= 20, "app.js references at least 20 element ids (" + idList.length + " found)");
idList.forEach(function (id) {
  ok(html.indexOf('id="' + id + '"') !== -1, "index.html defines id " + id);
});
["data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(html.indexOf('src="' + f + '"') !== -1, "index.html loads " + f);
});
ok(html.indexOf('href="style.css"') !== -1, "index.html loads style.css");
// Tab buttons and sections exist for all five tabs.
["cases", "detail", "lawyers", "ledger", "spotter"].forEach(function (t) {
  ok(html.indexOf('id="tab-' + t + '"') !== -1, "index.html defines tab " + t);
  ok(html.indexOf('id="section-' + t + '"') !== -1, "index.html defines section " + t);
});
// No phone number and no leftover text from previous projects.
ok(html.indexOf("0342") === -1 && html.indexOf("9011609") === -1, "index.html carries no phone number");
["MobilePak", "NetPak", "Challan", "Kiraya", "Silinder", "RemitPak"].forEach(function (word) {
  ok(html.indexOf(word) === -1, "index.html has no leftover " + word + " text");
});
// No real judges' names: only role titles appear anywhere in the demo.
ok(html.indexOf("Judge") === -1, "index.html names no judge");

// 13. HTML tag balance: every opened tag is closed (void elements excluded).
var voidTags = { meta: 1, link: 1, input: 1, br: 1, hr: 1, img: 1 };
var stack = [];
var tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
while ((m = tagRe.exec(html)) !== null) {
  var tag = m[1].toLowerCase();
  var raw = m[0];
  if (voidTags[tag]) continue;
  if (raw[1] === "/") {
    eq(stack.pop(), tag, "closing tag </" + tag + "> matches the last opened tag");
  } else if (raw[raw.length - 2] !== "/") {
    stack.push(tag);
  }
}
eq(stack.length, 0, "no unclosed tags remain (stack empty)");

console.log("\n" + n + " assertions passed.");
