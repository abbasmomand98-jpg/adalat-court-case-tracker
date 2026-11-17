// Adalat DOM smoke test — run with: node dom-smoke.js
// Executes data.js + logic.js + app.js in a tiny fake DOM (vm sandbox)
// and asserts the page renders the canonical figures.
var fs = require("fs");
var vm = require("vm");
var assert = require("assert");

function FakeEl(tag) {
  this.tagName = (tag || "div").toUpperCase();
  this.children = [];
  this._html = "";
  this.textContent = "";
  this.value = "";
  this.checked = false;
  this.disabled = false;
  this.className = "";
  this.style = {};
  this.listeners = {};
  this.attributes = {};
  this.type = "";
}
FakeEl.prototype.addEventListener = function (ev, fn) {
  (this.listeners[ev] = this.listeners[ev] || []).push(fn);
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
FakeEl.prototype.getAttribute = function (k) { return this.attributes[k]; };
Object.defineProperty(FakeEl.prototype, "innerHTML", {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); this.children = []; }
});

var byId = {};
function el(id) {
  if (!byId[id]) byId[id] = new FakeEl("div");
  return byId[id];
}
var documentStub = {
  getElementById: el,
  createElement: function (tag) { return new FakeEl(tag); }
};
var store = {};
var localStorageStub = {
  getItem: function (k) { return store[k] || null; },
  setItem: function (k, v) { store[k] = String(v); }
};
function fire(id, ev, arg) {
  (byId[id].listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}
function fireEl(node, ev, arg) {
  (node.listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}

var sandbox = { document: documentStub, localStorage: localStorageStub, console: console,
  Date: Date, setInterval: function () { return 0; }, clearInterval: function () {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
// Pre-seed the fake DOM with the defaults index.html declares in markup
// (the fake DOM does not parse value/selected attributes).
el("search-input").value = "";
el("city-filter").value = "all";
el("case-select").value = "civil-1284-2024";
el("lawyer-search").value = "";
el("lawyer-city-filter").value = "all";
el("lawyer-type-filter").value = "all";
el("lawyer-sort").value = "fee";
["data.js", "logic.js", "app.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
});

var n = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }

// 1. Cases tab is active on load; board renders 4 cases, Criminal first.
eq(el("section-cases").style.display, "block", "cases section shows on load");
eq(el("case-list").children.length, 4, "board renders 4 cases on load");
ok(el("case-list").children[0].innerHTML.indexOf("Criminal Case 78/2025") !== -1, "first case is Criminal Case 78/2025");
ok(el("case-list").children[0].innerHTML.indexOf("IN 2 DAYS") !== -1, "Criminal Case shows IN 2 DAYS");
ok(el("case-list").children[1].innerHTML.indexOf("Family Suit 342/2025") !== -1, "second case is Family Suit 342/2025");
ok(el("case-list").children[1].innerHTML.indexOf("IN 3 DAYS") !== -1, "Family Suit shows IN 3 DAYS");
ok(el("case-list").children[2].innerHTML.indexOf("Civil Suit 1284/2024") !== -1, "third case is Civil Suit 1284/2024");
ok(el("case-list").children[2].innerHTML.indexOf("IN 7 DAYS") !== -1, "Civil Suit shows IN 7 DAYS");
ok(el("case-list").children[3].innerHTML.indexOf("Rent Case 56/2026") !== -1, "last case is Rent Case 56/2026");
ok(el("case-list").children[3].innerHTML.indexOf("IN 9 DAYS") !== -1, "Rent Case shows IN 9 DAYS");
ok(el("case-summary").textContent.indexOf("4 of 4 cases") !== -1, "summary counts 4 of 4 cases");
ok(el("case-summary").textContent.indexOf("17 Nov 2026") !== -1, "summary names 17 Nov 2026");
ok(el("saved-list").innerHTML.indexOf("No cases saved yet") !== -1, "saved list starts empty");
eq(el("alerts-list").children.length, 4, "alerts list has 4 cases");
ok(el("alerts-list").children[0].children[0].checked, "alerts default ON");

// 2. City filter: Lahore keeps 1; search for 342 keeps 1.
el("city-filter").value = "Lahore";
fire("city-filter", "change");
eq(el("case-list").children.length, 1, "Lahore filter keeps 1 case");
ok(el("case-list").children[0].innerHTML.indexOf("Civil Suit 1284/2024") !== -1, "Lahore filter shows the Civil Suit");
el("city-filter").value = "all";
el("search-input").value = "342";
fire("search-input", "input");
eq(el("case-list").children.length, 1, "searching 342 keeps 1 case");
ok(el("case-list").children[0].innerHTML.indexOf("Family Suit 342/2025") !== -1, "342 search shows the Family Suit");
el("search-input").value = "xyz";
fire("search-input", "input");
eq(el("case-list").children.length, 0, "an unknown search renders no cases");
ok(el("case-list").innerHTML.indexOf("No cases match") !== -1, "unknown search shows not-found");
el("search-input").value = "";
fire("search-input", "input");
eq(el("case-list").children.length, 4, "clearing the search restores 4 cases");

// 3. Case-number search: 1284/2024 found, 999/2026 not found.
el("search-input").value = "1284/2024";
fire("search-input", "input");
ok(el("search-result").innerHTML.indexOf("FOUND") !== -1, "1284/2024 is found");
ok(el("search-result").innerHTML.indexOf("Civil Suit 1284/2024") !== -1, "found result names the Civil Suit");
ok(el("search-result").innerHTML.indexOf("in 7 days") !== -1, "found result shows 7 days");
el("search-input").value = "999/2026";
fire("search-input", "input");
ok(el("search-result").innerHTML.indexOf("NO CASE WITH THAT NUMBER") !== -1, "999/2026 is not found");
el("search-input").value = "";
fire("search-input", "input");
eq(el("search-result").innerHTML, "", "clearing the search clears the result");

// 4. Saving a case: tap Save on Criminal, it appears in the saved list.
var criminalRow = el("case-list").children[0];
var saveBtn = criminalRow.children[0];
eq(saveBtn.tagName, "BUTTON", "case row carries a save button");
fireEl(saveBtn, "click");
eq(el("saved-list").children.length, 1, "saved list has 1 case after saving");
ok(el("saved-list").children[0].innerHTML.indexOf("Criminal Case 78/2025") !== -1, "saved list shows Criminal Case 78/2025");
ok((store["adalat-saved"] || "").indexOf("criminal-78-2025") !== -1, "saved case persists in localStorage");

// 5. Case detail tab: Civil Suit shows timeline, Urdu summary, 7 days.
fire("tab-detail", "click");
eq(el("section-detail").style.display, "block", "detail section shows on tab click");
eq(el("section-cases").style.display, "none", "cases section hides on tab click");
ok(el("detail-box").innerHTML.indexOf("Civil Suit 1284/2024") !== -1, "detail shows the Civil Suit");
ok(el("detail-box").innerHTML.indexOf("IN 7 DAYS") !== -1, "detail shows IN 7 DAYS");
ok(el("detail-box").innerHTML.indexOf("24 Nov 2026") !== -1, "detail names 24 Nov 2026");
ok(el("detail-box").innerHTML.indexOf("Respondent sought adjournment") !== -1, "detail names the last hearing");
ok(el("detail-box").innerHTML.indexOf("سادہ اردو میں کیا ہوا؟") !== -1, "detail has the plain-Urdu heading");
el("case-select").value = "criminal-78-2025";
fire("case-select", "change");
ok(el("detail-box").innerHTML.indexOf("Criminal Case 78/2025") !== -1, "detail switches to the Criminal Case");
ok(el("detail-box").innerHTML.indexOf("IN 2 DAYS") !== -1, "criminal detail shows IN 2 DAYS");
el("case-select").value = "civil-1284-2024";
fire("case-select", "change");

// 6. Lawyers tab: 6 lawyers, Fatima first by fee; filters work.
fire("tab-lawyers", "click");
eq(el("section-lawyers").style.display, "block", "lawyers section shows on tab click");
eq(el("lawyer-list").children.length, 6, "lawyer list renders 6 lawyers");
ok(el("lawyer-list").children[0].innerHTML.indexOf("Fatima Zahra") !== -1, "first lawyer by fee is Fatima Zahra");
ok(el("lawyer-list").children[0].innerHTML.indexOf("Rs 6,000") !== -1, "Fatima Zahra charges Rs 6,000 a hearing");
ok(el("lawyer-list").children[0].innerHTML.indexOf("VERIFIED") !== -1, "lawyers carry the VERIFIED badge");
ok(el("lawyer-list").children[5].innerHTML.indexOf("Usman Tariq") !== -1, "last lawyer by fee is Usman Tariq");
ok(el("lawyer-list").children[5].innerHTML.indexOf("Rs 15,000") !== -1, "Usman Tariq charges Rs 15,000 a hearing");
ok(el("lawyer-summary").textContent.indexOf("6 of 6 verified lawyers") !== -1, "summary counts 6 of 6 lawyers");
el("lawyer-city-filter").value = "Lahore";
fire("lawyer-city-filter", "change");
eq(el("lawyer-list").children.length, 2, "Lahore filter keeps 2 lawyers");
el("lawyer-city-filter").value = "all";
el("lawyer-type-filter").value = "criminal";
fire("lawyer-type-filter", "change");
eq(el("lawyer-list").children.length, 1, "criminal filter keeps 1 lawyer");
ok(el("lawyer-list").children[0].innerHTML.indexOf("Sana Malik") !== -1, "criminal filter shows Sana Malik");
el("lawyer-type-filter").value = "all";
el("lawyer-search").value = "ayesha";
fire("lawyer-search", "input");
eq(el("lawyer-list").children.length, 1, "searching ayesha keeps 1 lawyer");
el("lawyer-search").value = "";
fire("lawyer-search", "input");
eq(el("lawyer-list").children.length, 6, "clearing the search restores 6 lawyers");

// 7. Ledger tab: Rs 87,500 spent vs Rs 75,000 estimate, Rs 10,000 flagged.
fire("tab-ledger", "click");
eq(el("section-ledger").style.display, "block", "ledger section shows on tab click");
ok(el("ledger-total-box").innerHTML.indexOf("Rs 87,500") !== -1, "ledger total is Rs 87,500");
ok(el("ledger-total-box").innerHTML.indexOf("Rs 75,000") !== -1, "ledger estimate is Rs 75,000");
ok(el("ledger-total-box").innerHTML.indexOf("Rs 12,500") !== -1, "ledger is Rs 12,500 over");
ok(el("ledger-total-box").innerHTML.indexOf("Rs 9,722") !== -1, "ledger averages Rs 9,722 a hearing");
eq(el("ledger-list").children.length, 5, "ledger list renders 5 items");
ok(el("ledger-list").children[0].innerHTML.indexOf("Rs 72,000") !== -1, "lawyer fees are Rs 72,000");
ok(el("ledger-list").children[0].innerHTML.indexOf("AD-2026-1041") !== -1, "lawyer fees carry receipt AD-2026-1041");
ok(el("ledger-list").children[1].innerHTML.indexOf("Rs 500") !== -1, "official court fee is Rs 500");
ok(el("ledger-list").children[4].innerHTML.indexOf("Rs 10,000") !== -1, "misc facilitation is Rs 10,000");
ok(el("ledger-list").children[4].innerHTML.indexOf("NO RECEIPT") !== -1, "misc facilitation is flagged NO RECEIPT");

// 8. Spotter tab: 4 questions, perfect score after correct answers.
fire("tab-spotter", "click");
eq(el("section-spotter").style.display, "block", "spotter section shows on tab click");
eq(el("spotter-quiz").children.length, 4, "spotter quiz renders 4 questions");
fire("spotter-btn", "click");
ok(el("spotter-result").innerHTML.indexOf("0 OF 4 CORRECT") !== -1, "no answers score 0 of 4");
var qs = el("spotter-quiz").children;
for (var i = 0; i < 3; i++) {
  fireEl(qs[i].children[1], "click"); // "Red flag" for the 3 real flags
}
fireEl(qs[3].children[2], "click"); // "Safe" for the written-agreement habit
fire("spotter-btn", "click");
ok(el("spotter-result").innerHTML.indexOf("4 OF 4 CORRECT") !== -1, "correct answers score 4 of 4");
ok(el("spotter-result").innerHTML.indexOf("Rs 500") !== -1, "spotter result explains the Rs 500 official fee");

// 9. Reset restores the canonical defaults.
fire("reset-demo", "click");
eq(el("section-cases").style.display, "block", "reset returns to the cases tab");
eq(el("case-list").children.length, 4, "reset restores 4 cases");
ok(el("case-list").children[0].innerHTML.indexOf("Criminal Case 78/2025") !== -1, "reset restores Criminal first");
ok(el("saved-list").innerHTML.indexOf("No cases saved yet") !== -1, "reset clears the saved list");
ok(el("spotter-result").innerHTML === "", "reset clears the spotter result");
eq(el("alerts-list").children.length, 4, "reset restores 4 alerts");
ok(el("alerts-list").children[0].children[0].checked, "reset restores alerts ON");

console.log("\n" + n + " DOM assertions passed.");
