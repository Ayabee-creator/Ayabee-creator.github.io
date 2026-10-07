// ---- Settings ----
const EMAIL = "ayabulelaayabee16@gmail.com";

// ---- Toast ----
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("show");
  void t.offsetWidth; // restart animation
  t.classList.add("show");
}

// ---- Copy email (with fallback if clipboard is blocked) ----
document.getElementById("copy").addEventListener("click", () => {
  const done = () => showToast("Email copied to clipboard");
  const fail = () => showToast("Copy failed. Email: " + EMAIL);
  if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, fail);
  else fail();
});

// ---- Theme toggle (remembers choice, falls back to system setting) ----
const root = document.documentElement;
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
root.dataset.theme = saved || "dark"; // dark is the default
document.getElementById("theme").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// ---- Project filters ----
const chips = document.querySelectorAll(".filters .chip");
chips.forEach(chip => chip.addEventListener("click", () => {
  chips.forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  const f = chip.dataset.filter;
  document.querySelectorAll(".project-card").forEach(card => {
    card.hidden = f !== "all" && !card.dataset.cat.split(" ").includes(f);
  });
}));

// ---- Galaxy star field (reacts to the mouse, pauses when tab is hidden) ----
const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let w, h, stars = [], mx = 0, my = 0, boost = 1;

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  const count = Math.min(160, Math.floor((w * h) / 9000));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    z: Math.random() * 0.8 + 0.2, // depth: smaller = farther away
    c: Math.random() > 0.8 ? "0,240,255" : Math.random() > 0.6 ? "168,85,247" : "255,255,255"
  }));
}
function draw() {
  ctx.clearRect(0, 0, w, h);
  boost = Math.max(1, boost * 0.96);
  const light = root.dataset.theme === "light";
  ctx.globalAlpha = light ? 0.35 : 0.85;
  for (const s of stars) {
    if (!reduce) { s.y += s.z * 0.15 * boost; if (s.y > h) s.y = 0; }
    const px = s.x + (mx - w / 2) * 0.02 * s.z;
    const py = s.y + (my - h / 2) * 0.02 * s.z;
    ctx.fillStyle = `rgb(${light ? "110,60,190" : s.c})`;
    ctx.beginPath();
    ctx.arc(px, py, s.z * 1.5, 0, 6.283);
    ctx.fill();
  }
  if (!document.hidden && !reduce) requestAnimationFrame(draw);
}
addEventListener("resize", () => { resize(); if (reduce) draw(); });
addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
document.addEventListener("visibilitychange", () => { if (!document.hidden) draw(); });
resize();
draw();

// ---- Console easter egg ----
console.log("%c SYSTEM ONLINE // AYABULELA MTWESI ", "background:#a855f7;color:#fff;padding:5px 10px;font-weight:bold;");
console.log("Looking under the hood? Let's connect: https://www.linkedin.com/in/ayabulela-mtwesi-3b696a230/");

// ======== PERSUASION + INTERACTION LAYER ========
const $ = id => document.getElementById(id);
const go = sel => document.querySelector(sel).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

// Familiarity: returning visitors get a warmer greeting
let visits = 0;
try { visits = +localStorage.getItem("visits") || 0; localStorage.setItem("visits", visits + 1); } catch (e) {}
if (visits > 0) $("greet").textContent = "Welcome back. Still open to graduate and internship roles";

// Progress: scroll bar + floating call-to-action once they are engaged
const bar = $("progress"), fl = $("float");
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
  const nearFooter = $("contact").getBoundingClientRect().top < innerHeight;
  fl.hidden = !(scrollY > innerHeight * 0.6 && !nearFooter);
}
addEventListener("scroll", onScroll, { passive: true });
fl.addEventListener("click", () => go("#contact"));

// Authority: numbers count up when seen
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  io.unobserve(e.target);
  const n = +e.target.dataset.count; let i = 0;
  const t = setInterval(() => { e.target.textContent = ++i; if (i >= n) clearInterval(t); }, 250);
}), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach(el => io.observe(el));

// Delight: card spotlight follows the cursor, buttons pull toward it
document.querySelectorAll(".project-card,.skill-card").forEach(c => c.addEventListener("mousemove", e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px");
  c.style.setProperty("--my", e.clientY - r.top + "px");
}));
if (!reduce) document.querySelectorAll(".btn").forEach(b => {
  b.addEventListener("mousemove", e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
  });
  b.addEventListener("mouseleave", () => b.style.transform = "");
});

// Cognitive ease: 30-second summary for busy recruiters
const qv = $("qv");
$("quick").addEventListener("click", () => qv.showModal());
$("qvcopy").addEventListener("click", () => $("copy").click());

// Command menu (Ctrl/Cmd + K)
const pal = $("palette"), pin = $("pin"), plist = $("plist");
const cmds = [
  ["Go to About", () => go("#about")],
  ["Go to Projects", () => go("#projects")],
  ["Go to Skills", () => go("#skills")],
  ["Go to Contact", () => go("#contact")],
  ["Open 30-second summary", () => qv.showModal()],
  ["Download CV", () => window.open("Mtwesi - CV(Software Dev).pdf", "_blank")],
  ["Copy email", () => $("copy").click()],
  ["Open GitHub", () => window.open("https://github.com/Ayabee-creator", "_blank")],
  ["Open LinkedIn", () => window.open("https://www.linkedin.com/in/ayabulela-mtwesi-3b696a230/", "_blank")],
  ["Toggle light/dark theme", () => $("theme").click()],
];
let shown = cmds, sel = 0;
function render() {
  const q = pin.value.toLowerCase();
  shown = cmds.filter(c => c[0].toLowerCase().includes(q));
  sel = Math.max(0, Math.min(sel, shown.length - 1));
  plist.innerHTML = shown.map((c, i) => `<li role="option" data-i="${i}" ${i === sel ? 'class="sel" aria-selected="true"' : ""}>${c[0]}</li>`).join("") || "<li>No matching command</li>";
}
function openPalette() { pin.value = ""; sel = 0; render(); pal.showModal(); pin.focus(); }
function run(i) { const c = shown[i]; if (c) { pal.close(); c[1](); } }
$("kbd").addEventListener("click", openPalette);
pin.addEventListener("input", () => { sel = 0; render(); });
pin.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { sel = Math.min(sel + 1, shown.length - 1); render(); e.preventDefault(); }
  if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
  if (e.key === "Enter") run(sel);
});
plist.addEventListener("click", e => { const li = e.target.closest("li[data-i]"); if (li) run(+li.dataset.i); });
[pal, qv].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));
addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
});

// Variable reward: a hidden surprise for people who type "hire"
let buf = "";
addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  buf = (buf + e.key.toLowerCase()).slice(-4);
  if (buf === "hire") { boost = 14; showToast("You found it. Let's talk: " + EMAIL); }
});
onScroll();

// ======== FEATURES: walkthrough, GitHub, terminal ========
cmds.splice(4, 0, ["Go to Journey", () => go("#journey")], ["Go to Terminal", () => go("#terminal")]);

// Phone walkthrough: shows itself only when at least one screenshot exists
const appSec = $("app"), screens = $("screens");
screens.querySelectorAll("img").forEach(img => {
  const ok = () => { appSec.hidden = false; };
  const bad = () => img.remove();
  if (img.complete) (img.naturalWidth ? ok() : bad());
  else { img.addEventListener("load", ok); img.addEventListener("error", bad); }
});
$("prev").addEventListener("click", () => screens.scrollBy({ left: -screens.clientWidth, behavior: reduce ? "auto" : "smooth" }));
$("next").addEventListener("click", () => screens.scrollBy({ left: screens.clientWidth, behavior: reduce ? "auto" : "smooth" }));

// Live GitHub: shows itself only if public, non-fork repos are found
fetch("https://api.github.com/users/Ayabee-creator/repos?sort=updated&per_page=10")
  .then(r => r.ok ? r.json() : [])
  .then(list => {
    const repos = list.filter(r => !r.fork).slice(0, 3);
    if (!repos.length) return;
    repos.forEach(r => {
      const card = document.createElement("div"); card.className = "skill-card repo";
      const h = document.createElement("h3"); h.textContent = r.name;
      const d = document.createElement("p"); d.textContent = r.description || "No description yet.";
      const m = document.createElement("p"); m.textContent = (r.language || "Code") + ", updated " + new Date(r.pushed_at).toLocaleDateString("en-ZA", { month: "short", year: "numeric" });
      const a = document.createElement("a"); a.href = r.html_url; a.target = "_blank"; a.rel = "noopener"; a.className = "project-link"; a.textContent = "View repo";
      card.append(h, d, m, a);
      $("repos").appendChild(card);
    });
    $("github").hidden = false;
  })
  .catch(() => {});

// Terminal
const tout = $("tout"), tin = $("tin"), hist = []; let hi = 0;
const say = (t, cls) => { const p = document.createElement("p"); p.textContent = t; if (cls) p.className = cls; tout.appendChild(p); tout.scrollTop = tout.scrollHeight; };
const T = {
  help: () => "Commands: about, skills, projects, journey, contact, github, cv, theme, clear",
  about: () => "Ayabulela Mtwesi. Final-year BCom Computer Science & Information Systems at Nelson Mandela University. I build Android apps, backends and clean interfaces.",
  skills: () => "Languages: Java, C#, Kotlin. Mobile: Android Studio. Data and web: MySQL, HTML, CSS, JavaScript, Git. Business: systems analysis, management, graphic design.",
  projects: () => "GetYourRide: student transport system (Kotlin, Spring Boot, MySQL). Freelance graphic design: visual identity and UI. Type 'github' to see the code.",
  journey: () => "Foundations, then branching out, then building for real. Now: final year and looking for a first developer role.",
  contact: () => "Email: " + EMAIL + ". LinkedIn and GitHub are in the footer.",
  hire: () => "Good call. Email me at " + EMAIL,
  github: () => { window.open("https://github.com/Ayabee-creator", "_blank"); return "Opening GitHub..."; },
  cv: () => { window.open("Mtwesi - CV(Software Dev).pdf", "_blank"); return "Opening my CV..."; },
  theme: () => { $("theme").click(); return "Theme switched."; },
};
function runCmd(raw) {
  say("> " + raw, "cmd");
  const k = raw.toLowerCase();
  if (k === "clear") { tout.textContent = ""; return; }
  say(T[k] ? T[k]() : "Command not found: " + raw + ". Type 'help'.");
}
$("tform").addEventListener("submit", e => {
  e.preventDefault();
  const raw = tin.value.trim(); tin.value = "";
  if (!raw) return;
  hist.push(raw); hi = hist.length; runCmd(raw);
});
tin.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && hist.length) { hi = Math.max(0, hi - 1); tin.value = hist[hi]; e.preventDefault(); }
  if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); tin.value = hist[hi] || ""; e.preventDefault(); }
});
["help", "about", "skills", "projects", "contact"].forEach(n => {
  const b = document.createElement("button"); b.className = "chip"; b.textContent = n;
  b.addEventListener("click", () => runCmd(n));
  $("tchips").appendChild(b);
});
say("Welcome. Type a command or tap one below. Start with 'help'.");