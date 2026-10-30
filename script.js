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

  // Reading progress bar
  var bar = document.getElementById("progress");
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    bar.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", Math.round(pct));
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // Table of contents built from each section's heading
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section.part"));
  var toc = document.getElementById("toc");
  var tocToggle = document.getElementById("toc-toggle");
  var list = document.createElement("ul");
  var links = {};
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
  toc.addEventListener("click", function (e) { if (e.target.tagName === "A") setOpen(false); });

  // Highlight the lesson currently in view
  var current = null;
  function highlight() {
    var line = window.innerHeight * 0.3;
    var active = sections[0];
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) active = sec;
    });
    if (active && active.id !== current) {
      if (current) links[current].classList.remove("active");
      links[active.id].classList.add("active");
      current = active.id;
    }
  }
  window.addEventListener("scroll", highlight, { passive: true });
  highlight();

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

  document.getElementById("reset").addEventListener("click", function () {
    if (!window.confirm("Clear all ticked steps?")) return;
    boxes.forEach(function (b) { b.checked = false; save("tick:" + b.dataset.id, "0"); });
    refresh();
  });
})();
