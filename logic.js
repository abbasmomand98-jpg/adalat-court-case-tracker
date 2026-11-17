// Adalat — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Thousands grouping, matching the figures used in the mockups,
  // slides and copy: 87500 -> "87,500", 15000 -> "15,000".
  function formatPKR(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Days between two ISO dates. 17 Nov -> 19 Nov is 2 days; 17 Nov ->
  // 26 Nov is 9 days. 3 Nov -> 24 Nov is 21 days.
  function daysBetween(fromISO, toISO) {
    var ms = Date.parse(toISO) - Date.parse(fromISO);
    return Math.round(ms / 86400000);
  }

  // Days until a case's next hearing from "today". Criminal Case
  // 78/2025: 19 Nov minus 17 Nov = 2 days. Rent Case 56/2026:
  // 26 Nov minus 17 Nov = 9 days.
  function daysToHearing(courtCase, todayISO) {
    return daysBetween(todayISO, courtCase.nextISO);
  }

  // Sort cases by next hearing, soonest first: Criminal (19 Nov),
  // Family (20 Nov), Civil (24 Nov), Rent (26 Nov).
  function sortCasesByNext(cases) {
    var list = cases.slice();
    list.sort(function (a, b) {
      return Date.parse(a.nextISO) - Date.parse(b.nextISO);
    });
    return list;
  }

  // Normalise a case number so "1284/2024", "1284 / 2024" and
  // "Civil Suit 1284/2024" all match the same case.
  function normalizeCaseNo(raw) {
    return String(raw || "").toLowerCase().replace(/[^0-9a-z\/]/g, "");
  }

  // Find a case by its number. Returns the case or null.
  // "1284/2024" finds Civil Suit 1284/2024; "342/2025" finds the
  // Family Suit; "999/2026" finds nothing.
  function findCaseByNumber(cases, raw) {
    var q = normalizeCaseNo(raw);
    if (!q) return null;
    var found = null;
    cases.forEach(function (c) {
      var num = normalizeCaseNo(c.number);
      if (q === num || q === normalizeCaseNo(c.title)) found = c;
    });
    return found;
  }

  // Case board: search by case number, title, type or court, filter
  // by city. Search is case-insensitive and trims spaces.
  function filterCases(cases, query, city) {
    var q = String(query || "").trim().toLowerCase();
    return cases.filter(function (c) {
      var okCity = !city || city === "all" || c.city === city;
      var okQuery = !q ||
        c.title.toLowerCase().indexOf(q) !== -1 ||
        c.number.toLowerCase().indexOf(q) !== -1 ||
        c.type.toLowerCase().indexOf(q) !== -1 ||
        c.court.toLowerCase().indexOf(q) !== -1;
      return okCity && okQuery;
    });
  }

  // Lawyer finder: search by name or specialty, filter by city and
  // by case type (family, property, criminal, civil).
  function filterLawyers(lawyers, query, city, type) {
    var q = String(query || "").trim().toLowerCase();
    return lawyers.filter(function (l) {
      var okCity = !city || city === "all" || l.city === city;
      var okType = !type || type === "all" ||
        l.specialty.toLowerCase().indexOf(type.toLowerCase()) !== -1;
      var okQuery = !q ||
        l.name.toLowerCase().indexOf(q) !== -1 ||
        l.specialty.toLowerCase().indexOf(q) !== -1 ||
        l.city.toLowerCase().indexOf(q) !== -1;
      return okCity && okType && okQuery;
    });
  }

  // Sort lawyers: cheapest per-hearing fee first is the default.
  function sortLawyers(lawyers, key) {
    var list = lawyers.slice();
    if (key === "rating") {
      list.sort(function (a, b) { return b.rating - a.rating; });
    } else if (key === "years") {
      list.sort(function (a, b) { return b.years - a.years; });
    } else {
      list.sort(function (a, b) { return a.fee - b.fee; });
    }
    return list;
  }

  // Cost ledger: add the items up. 72,000 + 500 + 2,000 + 3,000 +
  // 10,000 = 87,500.
  function ledgerTotal(items) {
    var total = 0;
    items.forEach(function (it) { total += it.amount; });
    return total;
  }

  // How far the spend is over the estimate: 87,500 - 75,000 = 12,500.
  // A negative result (under estimate) is reported as 0 over.
  function ledgerOver(items, estimate) {
    return Math.max(0, ledgerTotal(items) - estimate);
  }

  // The flagged items: only "misc facilitation" (Rs 10,000) has no
  // receipt, so it is the only flagged item.
  function ledgerFlagged(items) {
    return items.filter(function (it) { return it.flagged; });
  }

  // Cost per hearing so far: Rs 87,500 across 9 hearings is
  // Rs 9,722 a hearing (rounded).
  function costPerHearing(items, hearings) {
    if (!hearings || hearings <= 0) return 0;
    return Math.round(ledgerTotal(items) / hearings);
  }

  // Fee-spotter quiz: each flag has isFlag true/false. Answering
  // "flag" for a real flag (or "safe" for the safe habit) is correct.
  function spotterAnswer(flag, saidFlag) {
    return flag.isFlag === saidFlag;
  }

  function scoreQuiz(flags, answers) {
    var correct = 0;
    flags.forEach(function (f) {
      if (answers[f.id] === f.isFlag) correct++;
    });
    return { correct: correct, total: flags.length,
             perfect: correct === flags.length };
  }

  var api = { formatPKR: formatPKR,
              daysBetween: daysBetween,
              daysToHearing: daysToHearing,
              sortCasesByNext: sortCasesByNext,
              normalizeCaseNo: normalizeCaseNo,
              findCaseByNumber: findCaseByNumber,
              filterCases: filterCases,
              filterLawyers: filterLawyers,
              sortLawyers: sortLawyers,
              ledgerTotal: ledgerTotal,
              ledgerOver: ledgerOver,
              ledgerFlagged: ledgerFlagged,
              costPerHearing: costPerHearing,
              spotterAnswer: spotterAnswer,
              scoreQuiz: scoreQuiz };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.AdalatLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
