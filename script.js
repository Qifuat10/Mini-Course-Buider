(function () {
  var root = document.documentElement;

  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  // Theme toggle (light is the default)
  var themeBtn = document.getElementById("theme-toggle");
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeBtn.textContent = theme === "dark" ? "Light" : "Dark";
    themeBtn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    save("theme", next);
  });

  // Lessons: one section is shown at a time, switched with JavaScript
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section.part"));
  var bar = document.getElementById("progress");
  var toc = document.getElementById("toc");
  var tocToggle = document.getElementById("toc-toggle");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var position = document.getElementById("position");
  var list = document.createElement("ul");
  var links = {};
  var index = 0;

  sections.forEach(function (sec) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "#" + sec.id;
    a.textContent = sec.querySelector("h2").textContent;
    li.appendChild(a);
    list.appendChild(li);
    links[sec.id] = a;
  });
  toc.appendChild(list);

  function setOpen(open) {
    toc.classList.toggle("open", open);
    tocToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  tocToggle.addEventListener("click", function () { setOpen(!toc.classList.contains("open")); });

  function show(i, scroll) {
    index = Math.max(0, Math.min(sections.length - 1, i));
    sections.forEach(function (sec, n) {
      sec.hidden = n !== index;
      links[sec.id].classList.toggle("active", n === index);
    });
    var pct = ((index + 1) / sections.length) * 100;
    bar.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", Math.round(pct));
    position.textContent = "Lesson " + (index + 1) + " of " + sections.length;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === sections.length - 1;
    setOpen(false);
    if (scroll) window.scrollTo(0, 0);
  }

  function goTo(i) {
    i = Math.max(0, Math.min(sections.length - 1, i));
    show(i, true);
    if (location.hash !== "#" + sections[i].id) location.hash = sections[i].id;
  }

  function fromHash() {
    var id = location.hash.slice(1);
    var i = sections.findIndex(function (sec) { return sec.id === id; });
    show(i < 0 ? 0 : i, true);
  }
  window.addEventListener("hashchange", fromHash);
  prevBtn.addEventListener("click", function () { goTo(index - 1); });
  nextBtn.addEventListener("click", function () { goTo(index + 1); });
  fromHash();

  // Checkable steps, remembered in the browser
  var boxes = Array.prototype.slice.call(document.querySelectorAll('input[type="checkbox"][data-id]'));
  var stepBoxes = boxes.filter(function (b) { return b.closest(".step"); });
  var counter = document.getElementById("done-count");
  function refresh() {
    var done = stepBoxes.filter(function (b) { return b.checked; }).length;
    counter.textContent = stepBoxes.length ? done + " / " + stepBoxes.length + " steps" : "";
    boxes.forEach(function (b) {
      var step = b.closest(".step");
      if (step) step.classList.toggle("done", b.checked);
    });
  }
  boxes.forEach(function (b) {
    b.checked = load("tick:" + b.dataset.id) === "1";
    b.addEventListener("change", function () {
      save("tick:" + b.dataset.id, b.checked ? "1" : "0");
      refresh();
    });
  });
  refresh();

  // Check-in questions: answer shown inline, students can always continue
  Array.prototype.slice.call(document.querySelectorAll(".checkin")).forEach(function (box) {
    var type = box.dataset.type;
    var answers = box.dataset.answer.split("|");
    var feedback = box.querySelector(".feedback");
    var key = "checkin:" + box.id;
    var inputs = Array.prototype.slice.call(box.querySelectorAll("input"));
    var button = box.querySelector(".check-btn");

    function respond(value, store) {
      var right = type === "mc"
        ? value === answers[0]
        : answers.indexOf(value.trim().toLowerCase()) !== -1;
      if (store) save(key, value);
      inputs.forEach(function (i) { i.disabled = true; });
      if (button) button.disabled = true;
      box.classList.add("answered", right ? "right" : "wrong");
      var correct = type === "mc"
        ? box.querySelectorAll(".opt span")[Number(answers[0])].textContent
        : answers[0].toUpperCase();
      feedback.textContent = (right ? "Correct. " : "Not quite. The answer is “" + correct + "”. ") + box.dataset.why;
    }

    if (type === "mc") {
      inputs.forEach(function (i) {
        i.addEventListener("change", function () { respond(i.value, true); });
      });
    } else {
      var field = inputs[0];
      function submit() { if (field.value.trim()) respond(field.value, true); }
      button.addEventListener("click", submit);
      field.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });
    }

    var saved = load(key);
    if (saved !== null) {
      if (type === "mc") {
        var pick = inputs.filter(function (i) { return i.value === saved; })[0];
        if (pick) pick.checked = true;
      } else {
        inputs[0].value = saved;
      }
      respond(saved, false);
    }
  });

  // Simulator: a simplified model of the Arduino + Blynk setup
  (function () {
    var el = function (id) { return document.getElementById(id); };
    if (!el("sim-usb")) return;
    var usb = el("sim-usb"), wifi = el("sim-wifi"), temp = el("sim-temp"), hum = el("sim-hum");
    var motion = el("sim-motion"), buzzer = el("sim-buzzer");
    var goalKey = "sim:goals";
    var done = {};
    try { done = JSON.parse(load(goalKey) || "{}"); } catch (e) { done = {}; }

    function render() {
      var on = usb.checked;
      var online = on && wifi.checked;
      if (!online) buzzer.checked = false;
      buzzer.disabled = !online;

      el("sim-temp-out").textContent = temp.value;
      el("sim-hum-out").textContent = hum.value;

      var lines = ["", "", "", ""];
      if (on && !online) lines = ["System ON", "Waiting...", "", ""];
      if (online) lines = ["Temp *C:", Number(temp.value).toFixed(2), "Hum. %:", Number(hum.value).toFixed(2)];
      lines.forEach(function (t, i) { el("sim-oled-" + (i + 1)).textContent = t; });
      el("sim-oled").classList.toggle("lit", on);

      var buzzing = online && buzzer.checked;
      el("sim-buzzer-state").textContent = "Buzzer: " + (buzzing ? "ON (beeping)" : "off");
      el("sim-buzzer-label").textContent = buzzer.checked ? "On" : "Off";

      el("sim-status").textContent = online ? "● Online" : "○ Offline" + (on ? " (waiting for Wi-Fi)" : " (board has no power)");
      el("sim-status").classList.toggle("is-online", online);
      el("sim-w-temp").textContent = online ? temp.value + " °C" : "—";
      el("sim-w-hum").textContent = online ? hum.value + " %" : "—";
      el("sim-w-str").textContent = online ? (motion.checked ? "Motion" : "No Motion") : "—";

      var hot = online && Number(temp.value) >= 40;
      el("sim-alert").textContent = hot ? "Overheat alert: temperature is 40 °C or more. A technician would be notified." : "";
      el("sim-alert").classList.toggle("on", hot);

      var now = {
        usb: on,
        online: online,
        heat: online && Number(temp.value) >= 35,
        motion: online && motion.checked,
        buzzer: buzzing
      };
      var changed = false;
      Object.keys(now).forEach(function (k) {
        if (now[k] && !done[k]) { done[k] = true; changed = true; }
      });
      if (changed) save(goalKey, JSON.stringify(done));
      var count = 0;
      Array.prototype.forEach.call(document.querySelectorAll("#sim-goals li"), function (li) {
        var ok = !!done[li.dataset.goal];
        if (ok) count++;
        li.classList.toggle("done", ok);
        li.querySelector(".mark").textContent = ok ? "✓" : "";
      });
      el("sim-count").textContent = count + " of 5 goals done" + (count === 5 ? ". Well done!" : "");
    }

    [usb, wifi, temp, hum, motion, buzzer].forEach(function (c) {
      c.addEventListener("input", render);
      c.addEventListener("change", render);
    });
    render();
  })();

  document.getElementById("reset").addEventListener("click", function () {
    if (!window.confirm("Clear all ticked steps?")) return;
    boxes.forEach(function (b) { b.checked = false; save("tick:" + b.dataset.id, "0"); });
    refresh();
  });
})();
