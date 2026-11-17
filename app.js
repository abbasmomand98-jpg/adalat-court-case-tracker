// Adalat — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-17 so the sample figures (Criminal Case
// 78/2025 in 2 days, 19 Nov 2026; Family Suit 342/2025 in 3 days,
// 20 Nov 2026; Civil Suit 1284/2024 in 7 days, 24 Nov 2026; Rent Case
// 56/2026 in 9 days, 26 Nov 2026; ledger Rs 87,500 spent vs Rs 75,000
// estimate, Rs 12,500 over, Rs 10,000 "misc facilitation" with no
// receipt) stay stable no matter when you open it.
(function () {
  var L = window.AdalatLogic;
  var TODAY = "2026-11-17";
  var TODAY_LABEL = "17 Nov 2026";
  var STORE_SAVED = "adalat-saved";
  var STORE_ALERTS = "adalat-alerts";
  var STORE_SPOTTER = "adalat-spotter-answers";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  var savedIds = loadJSON(STORE_SAVED, []);
  var alertsOn = loadJSON(STORE_ALERTS, {});
  var spotterAnswers = loadJSON(STORE_SPOTTER, {});
  // Alerts default to ON for every case until the user switches one off.
  CASES.forEach(function (c) {
    if (alertsOn[c.id] === undefined) alertsOn[c.id] = true;
  });

  // ---- Tabs ----
  var TABS = ["cases", "detail", "lawyers", "ledger", "spotter"];
  function showTab(name) {
    TABS.forEach(function (t) {
      el("section-" + t).style.display = (t === name) ? "block" : "none";
      el("tab-" + t).className = "tab-btn" + (t === name ? " active" : "");
    });
  }
  TABS.forEach(function (t) {
    el("tab-" + t).addEventListener("click", function () { showTab(t); });
  });
  showTab("cases");

  // ---- Case board (search by case number + city filter) ----
  function findCase(id) {
    for (var i = 0; i < CASES.length; i++) {
      if (CASES[i].id === id) return CASES[i];
    }
    return null;
  }
  function renderSaved() {
    var box = el("saved-list");
    box.innerHTML = "";
    if (savedIds.length === 0) {
      box.innerHTML = '<p class="hint">No cases saved yet — tap "Save" on any case to keep it here for the court date.</p>';
      return;
    }
    savedIds.forEach(function (id) {
      var c = findCase(id);
      if (!c) return;
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + c.title + "</h3>" +
        "<p>" + c.type + " \u00b7 " + c.court + "</p></div>" +
        '<div class="recv">' + c.nextLabel +
        "<span>next hearing \u00b7 " + L.daysToHearing(c, TODAY) + " days left</span></div>";
      box.appendChild(div);
    });
  }
  function renderAlerts() {
    var box = el("alerts-list");
    box.innerHTML = "";
    L.sortCasesByNext(CASES).forEach(function (c) {
      var div = document.createElement("div");
      div.className = "checklist-item";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!alertsOn[c.id];
      cb.addEventListener("change", function () {
        alertsOn[c.id] = cb.checked;
        saveJSON(STORE_ALERTS, alertsOn);
        renderAlerts();
      });
      var lab = document.createElement("label");
      lab.textContent = c.title + " — " + c.nextLabel + " (" +
        L.daysToHearing(c, TODAY) + " days) \u00b7 " + c.stage;
      div.appendChild(cb);
      div.appendChild(lab);
      box.appendChild(div);
    });
  }
  function renderBoard() {
    var q = el("search-input").value || "";
    var city = el("city-filter").value || "all";
    var list = L.sortCasesByNext(L.filterCases(CASES, q, city));
    var box = el("case-list");
    box.innerHTML = "";
    if (list.length === 0) {
      box.innerHTML = '<div class="alert notfound"><strong>No cases match</strong>' +
        "<p>Try a different case number or city — the sample board has Civil Suit 1284/2024 (Lahore), Family Suit 342/2025 (Peshawar), Criminal Case 78/2025 (Karachi) and Rent Case 56/2026 (Islamabad).</p></div>";
      el("case-summary").textContent = "";
      return;
    }
    list.forEach(function (c) {
      var days = L.daysToHearing(c, TODAY);
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + c.title + "</h3>" +
        "<p>" + c.type + " \u00b7 " + c.court + "</p>" +
        "<p>Stage: " + c.stage + " \u00b7 Next hearing: " + c.nextLabel + "</p></div>" +
        '<div class="recv">IN ' + days + " DAYS" +
        "<span>next hearing</span>" +
        '<span class="badge-best">' + c.nextLabel + "</span></div>";
      var saveBtn = document.createElement("button");
      var isSaved = savedIds.indexOf(c.id) !== -1;
      saveBtn.textContent = isSaved ? "Saved \u2713" : "Save";
      saveBtn.className = "save-btn" + (isSaved ? "" : " secondary");
      saveBtn.addEventListener("click", function () {
        var i = savedIds.indexOf(c.id);
        if (i === -1) { savedIds.push(c.id); } else { savedIds.splice(i, 1); }
        saveJSON(STORE_SAVED, savedIds);
        renderBoard();
        renderSaved();
      });
      div.appendChild(saveBtn);
      var detailBtn = document.createElement("button");
      detailBtn.textContent = "View detail";
      detailBtn.className = "save-btn secondary";
      detailBtn.addEventListener("click", function () {
        el("case-select").value = c.id;
        renderDetail();
        showTab("detail");
      });
      div.appendChild(detailBtn);
      box.appendChild(div);
    });
    el("case-summary").textContent = list.length + " of " + CASES.length +
      " cases \u00b7 sorted by next hearing \u00b7 sample data, checked " + TODAY_LABEL + ".";
    renderSaved();
    renderAlerts();
  }
  function renderSearch() {
    var raw = el("search-input").value || "";
    var box = el("search-result");
    if (!raw.trim()) { box.innerHTML = ""; return; }
    var found = L.findCaseByNumber(CASES, raw);
    if (!found) {
      box.innerHTML = '<div class="alert notfound"><strong>NO CASE WITH THAT NUMBER</strong>' +
        "<p>" + raw + " is not one of the four sample cases. Check the number on your court papers — it looks like 1284/2024.</p></div>";
      return;
    }
    var days = L.daysToHearing(found, TODAY);
    box.innerHTML = '<div class="alert ok"><strong>\u2713 FOUND \u2014 ' + found.title + "</strong>" +
      "<p>" + found.type + " \u00b7 " + found.court + ". Stage: " + found.stage +
      ". Next hearing " + found.nextLabel + " \u2014 in " + days + " days.</p></div>";
  }
  el("search-input").addEventListener("input", function () { renderBoard(); renderSearch(); });
  el("city-filter").addEventListener("change", renderBoard);
  el("search-btn").addEventListener("click", renderSearch);
  renderBoard();

  // ---- Case detail (timeline + plain-Urdu summary + countdown) ----
  function renderDetail() {
    var c = findCase(el("case-select").value) || CASES[2];
    var days = L.daysToHearing(c, TODAY);
    var html = '<div class="total"><strong>' + c.title + " \u2014 " + c.nextLabel +
      " \u00b7 IN " + days + " DAYS</strong>" +
      "<p>" + c.type + " \u00b7 " + c.court + ". Stage: " + c.stage +
      ". Filed " + c.filed + ". Last hearing " + c.lastLabel + ": " + c.lastNote + "</p></div>";
    html += "<h3>Hearing timeline</h3>";
    html += '<div class="bundle"><div><h3>' + c.filed + " — Case filed</h3>" +
      "<p>" + c.type + " filed in " + c.court + ".</p></div></div>";
    html += '<div class="bundle"><div><h3>' + c.lastLabel + " — Last hearing</h3>" +
      "<p>" + c.lastNote + "</p></div></div>";
    html += '<div class="bundle best"><div><h3>' + c.nextLabel + " — Next hearing</h3>" +
      "<p>" + c.stage + " \u00b7 in " + days + " days. Alerts are " +
      (alertsOn[c.id] ? "ON" : "OFF") + " for this case.</p></div>" +
      '<div class="recv">IN ' + days + " DAYS" + "<span>next hearing</span></div></div>";
    html += "<h3>Plain Urdu — what happened</h3>";
    html += '<div class="alert warn"><strong>\u0633\u0627\u062f\u06c1 \u0627\u0631\u062f\u0648 \u0645\u06cc\u06ba \u06a9\u06cc\u0627 \u06c1\u0648\u0627\u061f</strong>';
    c.urdu.forEach(function (line) { html += "<p>" + line + "</p>"; });
    html += "</div>";
    el("detail-box").innerHTML = html;
  }
  el("case-select").addEventListener("change", renderDetail);
  renderDetail();

  // ---- Lawyer finder (search + city/type filter + sort by fee) ----
  function renderLawyers() {
    var q = el("lawyer-search").value || "";
    var city = el("lawyer-city-filter").value || "all";
    var type = el("lawyer-type-filter").value || "all";
    var sort = el("lawyer-sort").value || "fee";
    var list = L.sortLawyers(L.filterLawyers(LAWYERS, q, city, type), sort);
    var box = el("lawyer-list");
    box.innerHTML = "";
    if (list.length === 0) {
      box.innerHTML = '<div class="alert notfound"><strong>No lawyers match</strong>' +
        "<p>Try a different search, city or case type — the sample finder has 6 verified lawyers across Lahore, Rawalpindi, Karachi, Islamabad and Peshawar.</p></div>";
      el("lawyer-summary").textContent = "";
      return;
    }
    list.forEach(function (l) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + l.name + ' <span class="badge-ok">\u2713 VERIFIED</span></h3>' +
        "<p>" + l.specialty + " \u00b7 " + l.city + " \u00b7 " + l.years + " years \u00b7 " +
        l.rating + "\u2605</p></div>" +
        '<div class="recv">' + rs(l.fee) + "<span>per hearing</span></div>";
      box.appendChild(div);
    });
    el("lawyer-summary").textContent = list.length + " of " + LAWYERS.length +
      " verified lawyers \u00b7 sorted by " +
      (sort === "fee" ? "fee, cheapest first" : sort === "rating" ? "rating, highest first" : "experience, most first") +
      " \u00b7 sample data, checked " + TODAY_LABEL + ".";
  }
  el("lawyer-search").addEventListener("input", renderLawyers);
  el("lawyer-city-filter").addEventListener("change", renderLawyers);
  el("lawyer-type-filter").addEventListener("change", renderLawyers);
  el("lawyer-sort").addEventListener("change", renderLawyers);
  renderLawyers();

  // ---- Cost ledger (receipt list + total vs estimate) ----
  function renderLedger() {
    var total = L.ledgerTotal(LEDGER_ITEMS);
    var over = L.ledgerOver(LEDGER_ITEMS, LEDGER_CASE.estimate);
    var flagged = L.ledgerFlagged(LEDGER_ITEMS);
    el("ledger-total-box").innerHTML =
      '<div class="total"><strong>SPENT ' + rs(total) + " OF " + rs(LEDGER_CASE.estimate) +
      " ESTIMATE \u2014 " + rs(over) + " OVER</strong>" +
      "<p>" + LEDGER_CASE.caseTitle + " \u00b7 " + LEDGER_CASE.hearings + " hearings \u00b7 " +
      rs(L.costPerHearing(LEDGER_ITEMS, LEDGER_CASE.hearings)) + " a hearing on average. " +
      flagged.length + " item flagged: " + flagged[0].label + " " + rs(flagged[0].amount) +
      " with no receipt.</p></div>";
    var box = el("ledger-list");
    box.innerHTML = "";
    LEDGER_ITEMS.forEach(function (it) {
      var div = document.createElement("div");
      div.className = "bundle" + (it.flagged ? " best" : "");
      div.innerHTML = "<div><h3>" + it.label + "</h3>" +
        "<p>" + (it.receipt ? "Receipt " + it.receipt : "\u26a0 No receipt — flagged") + "</p></div>" +
        '<div class="recv">' + rs(it.amount) +
        (it.flagged ? '<span class="badge-risk">NO RECEIPT</span>' : "<span>receipted</span>") + "</div>";
      box.appendChild(div);
    });
  }
  renderLedger();

  // ---- Fee-spotter quiz ----
  function renderSpotter() {
    var box = el("spotter-quiz");
    box.innerHTML = "";
    SPOTTER_FLAGS.forEach(function (flag, i) {
      var div = document.createElement("div");
      div.className = "spotter-q";
      var chosen = spotterAnswers[flag.id];
      var btnFlag = document.createElement("button");
      btnFlag.textContent = "Red flag";
      btnFlag.className = chosen === true ? "flag-btn chosen" : "flag-btn";
      btnFlag.addEventListener("click", function () {
        spotterAnswers[flag.id] = true;
        saveJSON(STORE_SPOTTER, spotterAnswers);
        renderSpotter();
      });
      var btnSafe = document.createElement("button");
      btnSafe.textContent = "Safe";
      btnSafe.className = "secondary" + (chosen === false ? " chosen" : "");
      btnSafe.addEventListener("click", function () {
        spotterAnswers[flag.id] = false;
        saveJSON(STORE_SPOTTER, spotterAnswers);
        renderSpotter();
      });
      var p = document.createElement("p");
      p.innerHTML = "<strong>" + (i + 1) + ". </strong>" + flag.scenario;
      div.appendChild(p);
      div.appendChild(btnFlag);
      div.appendChild(btnSafe);
      box.appendChild(div);
    });
  }
  renderSpotter();

  el("spotter-btn").addEventListener("click", function () {
    var score = L.scoreQuiz(SPOTTER_FLAGS, spotterAnswers);
    var html = '<div class="alert ' + (score.perfect ? "ok" : "warn") + '"><strong>' +
      score.correct + " OF " + score.total + " CORRECT" + "</strong><p>" +
      (score.perfect ? "Perfect — you spot all three fee traps and the safe habit."
                     : "Check the ones you missed below — the spotter catches them before the money moves.") +
      "</p></div>";
    SPOTTER_FLAGS.forEach(function (flag) {
      var right = L.spotterAnswer(flag, spotterAnswers[flag.id]);
      var answered = spotterAnswers.hasOwnProperty(flag.id);
      html += '<div class="alert ' + (!answered ? "notfound" : (right ? "ok" : "risk")) + '"><strong>' +
        (answered ? (right ? "✓ CORRECT — " : "✗ MISSED — ") : "NOT ANSWERED — ") +
        (flag.isFlag ? "RED FLAG" : "SAFE") + "</strong><p>" + flag.why + "</p></div>";
    });
    el("spotter-result").innerHTML = html;
  });

  el("reset-demo").addEventListener("click", function () {
    savedIds = [];
    spotterAnswers = {};
    alertsOn = {};
    CASES.forEach(function (c) { alertsOn[c.id] = true; });
    saveJSON(STORE_SAVED, savedIds);
    saveJSON(STORE_ALERTS, alertsOn);
    saveJSON(STORE_SPOTTER, spotterAnswers);
    el("search-input").value = "";
    el("city-filter").value = "all";
    el("search-result").innerHTML = "";
    el("case-select").value = "civil-1284-2024";
    el("lawyer-search").value = "";
    el("lawyer-city-filter").value = "all";
    el("lawyer-type-filter").value = "all";
    el("lawyer-sort").value = "fee";
    el("spotter-result").innerHTML = "";
    showTab("cases");
    renderBoard();
    renderDetail();
    renderLawyers();
    renderLedger();
    renderSpotter();
  });
})();
