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

  document.getElementById("reset").addEventListener("click", function () {
    if (!window.confirm("Clear all ticked steps?")) return;
    boxes.forEach(function (b) { b.checked = false; save("tick:" + b.dataset.id, "0"); });
    refresh();
  });
})();
