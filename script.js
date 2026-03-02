/* ============================================================================
  CSCI 4410 Interactive Study Guide — script.js
  ----------------------------------------------------------------------------
  🎯 What this file does:
  - Stores your study content (simple topics) as data objects
  - Renders topic cards + sidebar navigation
  - Adds: search, flashcards, quizzes, interactive demos
  - Tracks progress + streaks + weak topics using localStorage
  - Supports dark mode + export/import progress as JSON

  💡 Why this exists:
  HTML alone is static. This file makes your study guide *reactive*:
  you click, answer, flip, track, and learn.

  ✅ Expected HTML element IDs (recommended):
  - #sidebarNav, #searchInput, #topicContainer
  - #progressPct, #streakCount, #weakList
  - #darkModeToggle
  - #flashcardsBtn, #quizBtn, #studyBtn (optional)
  - Flashcards UI: #flashcardArea, #fcFront, #fcBack, #fcFlip, #fcKnow, #fcAgain, #fcCount
  - Quiz UI: #quizArea, #quizTitle, #quizQuestion, #quizAnswers, #quizFeedback, #quizNext, #quizScore
  - Export/Import: #exportBtn, #importInput (file input)
  - Demos:
    HTTP demo: #httpDemo, #httpUrl, #httpMethod, #httpSend, #httpLog
    HTML demo: #htmlDemo, #htmlInput, #htmlRenderMode, #htmlPreview, #htmlExplain
    CSS box demo: #boxDemo, #boxPreview, #marginSlider, #paddingSlider, #borderSlider, #boxReadout
    DOM demo: #domDemo, #domTarget, #domBtnText, #domBtnColor, #domBtnMany

  If your index.html uses different IDs, either rename IDs or update selectors below.
============================================================================ */


/* =========================
   Phase 0 — Tiny utilities
   ========================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function pick(...selectors) {
  for (const selector of selectors) {
    const el = $(selector);
    if (el) return el;
  }
  return null;
}

function safeText(str) {
  // WHY: We often insert user-provided or data-driven text into the DOM.
  // Using textContent prevents HTML injection.
  return String(str ?? "");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function todayLocalISO() {
  // WHY: streak tracking needs “today” in a stable format.
  // ISO date without time avoids timezone surprises.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetweenISO(aISO, bISO) {
  // WHY: streak logic depends on day differences.
  // Convert to midnight timestamps to avoid time-of-day issues.
  const a = new Date(`${aISO}T00:00:00`);
  const b = new Date(`${bISO}T00:00:00`);
  const ms = b - a;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}


/* ==============================
   Phase 1 — Data (simple topics)
   ==============================

  💡 WHY we store as data objects:
  - You can edit content without touching logic.
  - The site can generate cards, flashcards, and quizzes from the same source.
*/

const STUDY_DATA = {
  chapters: [
    {
      id: "ch1",
      title: "Chapter 1 — Internet Basics",
      topics: [
        {
          id: "tcpip",
          term: "TCP/IP",
          definition: "A set of networking rules that lets computers send data across networks.",
          why: "Without shared rules, computers would “speak different languages” and fail to communicate.",
          analogy: "Think of it like postal rules: address format + delivery steps so mail arrives.",
          example: "HTTP uses TCP/IP under the hood to move requests and responses.",
          mistake: {
            wrong: "“TCP/IP is the same thing as the Internet.”",
            right: "TCP/IP is the *rulebook* the Internet uses to move data."
          },
          selfCheck: {
            q: "Why do we need TCP/IP?",
            a: "So devices follow the same rules for sending/receiving data reliably."
          },
          flashcardFront: "TCP/IP — what is it?",
          flashcardBack: "Networking rulebook that lets computers exchange data reliably."
        },
        {
          id: "ipv4v6",
          term: "IPv4 vs IPv6",
          definition: "Two versions of Internet addressing. IPv6 exists mainly because IPv4 addresses ran out.",
          why: "The Internet grew faster than the available IPv4 address space.",
          analogy: "Like expanding from 7-digit phone numbers to longer numbers so everyone can get one.",
          example: "IPv4 example: 192.168.1.10 | IPv6 example: 2001:db8::1",
          mistake: {
            wrong: "“IPv6 is just faster.”",
            right: "IPv6 mainly solves address shortage and improves some networking features."
          },
          selfCheck: {
            q: "Why was IPv6 created?",
            a: "Because IPv4 didn’t have enough addresses for the growth of devices."
          },
          flashcardFront: "IPv6 — why does it exist?",
          flashcardBack: "Because IPv4 ran out of addresses; IPv6 provides a huge address space."
        },
        {
          id: "www",
          term: "World Wide Web (WWW)",
          definition: "A system of web pages and resources accessed through browsers using URLs.",
          why: "It makes information easy to access via links and addresses.",
          analogy: "Think of it like a giant library with an index (URLs) and cross-references (links).",
          example: "A website is a collection of pages you can reach by URL in a browser.",
          mistake: {
            wrong: "“The Web and the Internet are the same.”",
            right: "The Internet is the network; the Web is a service running on it."
          },
          selfCheck: {
            q: "Internet vs Web?",
            a: "Internet = network; Web = pages/resources accessed via HTTP/URLs."
          },
          flashcardFront: "WWW — what is it?",
          flashcardBack: "A system of pages/resources accessed via browsers using URLs."
        },
        {
          id: "http",
          term: "HTTP",
          definition: "A protocol browsers use to request and receive web pages from servers.",
          why: "It standardizes how clients ask for pages and how servers respond.",
          analogy: "Like ordering food: request (order) → response (food + receipt).",
          example: "Browser sends an HTTP request; server returns an HTTP response with HTML/CSS/JS.",
          mistake: {
            wrong: "“HTTP is a programming language.”",
            right: "HTTP is a communication protocol (a set of rules)."
          },
          selfCheck: {
            q: "What does HTTP do?",
            a: "It defines how requests/responses move between browser and server."
          },
          flashcardFront: "HTTP — what does it do?",
          flashcardBack: "Rules for requests/responses between browser (client) and server."
        }
      ],
      quiz: [
        {
          id: "ch1q1",
          type: "mcq",
          question: "Which is the best description of HTTP?",
          choices: [
            "A language for styling websites",
            "A protocol for requesting and receiving web resources",
            "A type of IP address",
            "A database system"
          ],
          answerIndex: 1,
          explanation: "HTTP is the rule system for how browsers and servers exchange requests and responses."
        },
        {
          id: "ch1q2",
          type: "tf",
          question: "True/False: The Internet and the World Wide Web are the same thing.",
          answerBool: false,
          explanation: "The Internet is the network; the Web is a service that runs on it."
        }
      ]
    },

    {
      id: "ch2",
      title: "Chapter 2 — HTML Basics",
      topics: [
        {
          id: "html",
          term: "HTML",
          definition: "A markup language that defines the structure of a web page.",
          why: "Browsers need a consistent structure to display content like headings, paragraphs, and images.",
          analogy: "Think of it like the frame of a house: it defines rooms and layout.",
          example: "<h1>Hello</h1><p>This is a paragraph.</p>",
          mistake: {
            wrong: "“HTML controls colors and layout.”",
            right: "HTML is structure. CSS handles appearance."
          },
          selfCheck: { q: "HTML is mainly for…?", a: "Structure and content." },
          flashcardFront: "HTML — what is it?",
          flashcardBack: "Markup language that defines structure/content of a webpage."
        },
        {
          id: "tags",
          term: "Tags / Elements / Attributes",
          definition: "Tags create elements; attributes add details (like href for links).",
          why: "We need a way to describe *what something is* and add details about it.",
          analogy: "Like a form: field name (tag) + filled value/details (attributes).",
          example: '<a href="https://example.com">Link</a>',
          mistake: {
            wrong: "Forgetting quotes in attributes",
            right: 'Use: href="..." (quotes are a safe default).'
          },
          selfCheck: { q: "What does href do?", a: "It tells the link where to go." },
          flashcardFront: "Attribute — example?",
          flashcardBack: 'href="..." is an attribute on <a>.'
        }
      ],
      quiz: [
        {
          id: "ch2q1",
          type: "mcq",
          question: "What is HTML mainly responsible for?",
          choices: ["Structure/content", "Database storage", "Network routing", "CPU scheduling"],
          answerIndex: 0,
          explanation: "HTML defines the structure and content of the page; CSS handles style."
        }
      ]
    },

    {
      id: "ch3",
      title: "Chapter 3 — CSS Basics",
      topics: [
        {
          id: "css",
          term: "CSS",
          definition: "A language for styling HTML (colors, spacing, layout).",
          why: "Separates appearance from structure, making websites easier to maintain.",
          analogy: "HTML is the skeleton; CSS is the outfit.",
          example: "p { font-size: 16px; }",
          mistake: {
            wrong: "Trying to style with HTML attributes everywhere",
            right: "Prefer CSS rules so you can change many elements at once."
          },
          selfCheck: { q: "Why use CSS instead of inline styles everywhere?", a: "Consistency + easier updates." },
          flashcardFront: "CSS — why do we use it?",
          flashcardBack: "To style HTML consistently and keep design separate from structure."
        },
        {
          id: "boxmodel",
          term: "Box Model",
          definition: "Every element is a box: content + padding + border + margin.",
          why: "Layout becomes predictable when everything is treated as boxes.",
          analogy: "A framed picture: photo (content), mat (padding), frame (border), space on wall (margin).",
          example: "div { padding: 10px; border: 2px solid; margin: 12px; }",
          mistake: {
            wrong: "Confusing margin vs padding",
            right: "Padding = inside space; margin = outside space."
          },
          selfCheck: { q: "Margin vs padding?", a: "Padding is inside the border; margin is outside." },
          flashcardFront: "Box model parts?",
          flashcardBack: "Content, padding, border, margin."
        }
      ],
      quiz: [
        {
          id: "ch3q1",
          type: "tf",
          question: "True/False: Padding is outside the border.",
          answerBool: false,
          explanation: "Padding is inside the border; margin is outside."
        }
      ]
    },

    {
      id: "ch4",
      title: "Chapter 4 — JavaScript Basics",
      topics: [
        {
          id: "js",
          term: "JavaScript",
          definition: "A programming language used to make web pages interactive.",
          why: "Without JS, most pages would be static documents.",
          analogy: "HTML is the script, CSS is costume, JS is the actor moving things around.",
          example: "document.getElementById('x').textContent = 'Hi';",
          mistake: {
            wrong: "Using JS before the DOM exists",
            right: "Run JS after the page loads (or place script at end of body)."
          },
          selfCheck: { q: "What does JS add to a page?", a: "Interactivity and logic." },
          flashcardFront: "JavaScript — purpose?",
          flashcardBack: "Adds interactivity and behavior to web pages."
        },
        {
          id: "dom",
          term: "DOM",
          definition: "The browser’s object model of the HTML page that JS can manipulate.",
          why: "JS needs a structured way to find and change page elements.",
          analogy: "Like a family tree for your HTML, where JS can find any “node.”",
          example: "document.querySelector('.card')",
          mistake: {
            wrong: "Querying the wrong selector",
            right: "Use # for id, . for class, tag name for elements."
          },
          selfCheck: { q: "What does querySelector return?", a: "The first matching element." },
          flashcardFront: "querySelector does what?",
          flashcardBack: "Returns the first element matching a CSS selector."
        }
      ],
      quiz: [
        {
          id: "ch4q1",
          type: "mcq",
          question: "What does document.getElementById('myId') return?",
          choices: ["A list of all elements", "The first element with that id", "A CSS file", "A server response"],
          answerIndex: 1,
          explanation: "getElementById returns the element whose id matches the string."
        }
      ]
    }
  ]
};


/* ==========================================
   Phase 2 — Persistent state (localStorage)
   ==========================================

  📚 localStorage = browser storage that persists across refresh.
  WHY: Study tools are useless if they “forget” your progress.
*/

const STORAGE_KEY = "csci4410_study_state_v1";

function defaultState() {
  return {
    theme: "dark", // "dark" or "light"
    lastStudyDate: null, // ISO date string
    streak: 0,

    // Topic completion: { [topicId]: true }
    completedTopics: {},

    // Weakness signals (higher = weaker)
    weakScore: {},

    // Flashcard scheduling: { [topicId]: { dueISO, intervalDays } }
    flashSchedule: {},

    // Quiz history: { [chapterId]: { bestScore, attempts, lastScore } }
    quizStats: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // WHY: Merge ensures new fields exist after updates.
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}

let STATE = loadState();


/* ==================================
   Phase 3 — Core study computations
   ================================== */

function allTopicsFlat() {
  const out = [];
  for (const ch of STUDY_DATA.chapters) {
    for (const t of ch.topics) {
      out.push({ ...t, chapterId: ch.id, chapterTitle: ch.title });
    }
  }
  return out;
}

function markStudiedToday() {
  // WHY: Streak is motivational + helps you be consistent.
  const today = todayLocalISO();
  const last = STATE.lastStudyDate;

  if (!last) {
    STATE.streak = 1;
  } else {
    const diff = daysBetweenISO(last, today);
    if (diff === 0) {
      // already counted today
    } else if (diff === 1) {
      STATE.streak += 1;
    } else {
      STATE.streak = 1;
    }
  }

  STATE.lastStudyDate = today;
  saveState();
}

function setTopicCompleted(topicId, completed = true) {
  STATE.completedTopics[topicId] = completed;
  markStudiedToday();
  saveState();
  updateDashboard();
}

function bumpWeak(topicId, amount = 1) {
  // WHY: Weak topics should resurface more often.
  STATE.weakScore[topicId] = (STATE.weakScore[topicId] ?? 0) + amount;
  saveState();
  updateDashboard();
}

function reduceWeak(topicId, amount = 1) {
  STATE.weakScore[topicId] = Math.max(0, (STATE.weakScore[topicId] ?? 0) - amount);
  saveState();
  updateDashboard();
}


/* ============================================
   Phase 4 — Rendering: sidebar + topic cards
   ============================================ */

function renderSidebar() {
  const nav = pick("#sidebarNav", "#chapterNav");
  if (!nav) return;

  nav.innerHTML = "";

  for (const ch of STUDY_DATA.chapters) {
    const chBlock = document.createElement("div");
    chBlock.className = "nav-chapter";

    const chTitle = document.createElement("div");
    chTitle.className = "nav-chapter-title";
    chTitle.textContent = ch.title;
    chBlock.appendChild(chTitle);

    for (const t of ch.topics) {
      const a = document.createElement("a");
      a.href = `#topic-${t.id}`;
      a.className = "nav-topic";
      a.textContent = t.term;
      chBlock.appendChild(a);
    }

    nav.appendChild(chBlock);
  }
}

function topicCardHTML(topic) {
  const done = !!STATE.completedTopics[topic.id];
  const weak = STATE.weakScore[topic.id] ?? 0;

  // WHY: <details> gives accessible collapse/expand for free.
  return `
    <article class="topic-card" id="topic-${topic.id}" data-topic-id="${topic.id}" data-term="${safeText(topic.term).toLowerCase()}">
      <header class="topic-header">
        <div class="topic-title">
          <h3>${safeText(topic.term)}</h3>
          <div class="topic-meta">
            <span class="chip">${safeText(topic.chapterTitle)}</span>
            <span class="chip ${done ? "chip-done" : ""}">${done ? "Completed" : "Not completed"}</span>
            <span class="chip ${weak > 0 ? "chip-weak" : ""}">Weak: ${weak}</span>
          </div>
        </div>

        <div class="topic-actions">
          <button class="btn small" data-action="toggleComplete">
            ${done ? "Mark Uncomplete" : "Mark Complete"}
          </button>
          <button class="btn small" data-action="reviewAgain">Review Again</button>
        </div>
      </header>

      <details class="topic-details">
        <summary>Open explanation</summary>

        <section class="topic-section">
          <h4>📚 Definition</h4>
          <p>${safeText(topic.definition)}</p>
        </section>

        <section class="topic-section">
          <h4>💡 Why it exists</h4>
          <p>${safeText(topic.why)}</p>
        </section>

        <section class="topic-section">
          <h4>Think of it like…</h4>
          <p>${safeText(topic.analogy)}</p>
        </section>

        <section class="topic-section">
          <h4>Example</h4>
          <pre><code>${escapeHTML(topic.example)}</code></pre>
        </section>

        <section class="topic-section">
          <h4>⚠️ Common mistake</h4>
          <p><strong>Incorrect:</strong> ${safeText(topic.mistake.wrong)}</p>
          <p><strong>Correct:</strong> ${safeText(topic.mistake.right)}</p>
        </section>

        <section class="topic-section">
          <h4>Self-check</h4>
          <p>${safeText(topic.selfCheck.q)}</p>
          <button class="btn small" data-action="revealAnswer">Reveal Answer</button>
          <p class="selfcheck-answer hidden">${safeText(topic.selfCheck.a)}</p>
        </section>
      </details>
    </article>
  `;
}

function renderTopics() {
  const container = pick("#topicContainer", "#chaptersContainer");
  if (!container) return;

  const flat = allTopicsFlat();
  container.innerHTML = flat.map(topicCardHTML).join("");

  // Attach one event listener (event delegation)
  // WHY: We avoid adding 100 tiny listeners; faster and cleaner.
  container.addEventListener("click", onTopicContainerClick);
}

function onTopicContainerClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const card = e.target.closest(".topic-card");
  if (!card) return;

  const topicId = card.getAttribute("data-topic-id");
  const action = btn.getAttribute("data-action");

  if (action === "toggleComplete") {
    const done = !!STATE.completedTopics[topicId];
    setTopicCompleted(topicId, !done);
    // re-render just this card label/buttons by re-rendering all (simple + safe)
    renderTopics();
    applySearchFilter($("#searchInput")?.value ?? "");
    return;
  }

  if (action === "reviewAgain") {
    bumpWeak(topicId, 2);
    scheduleFlashcardSoon(topicId);
    renderTopics();
    applySearchFilter($("#searchInput")?.value ?? "");
    return;
  }

  if (action === "revealAnswer") {
    const ans = card.querySelector(".selfcheck-answer");
    if (ans) ans.classList.toggle("hidden");
    return;
  }
}

function escapeHTML(str) {
  // WHY: code snippets should display as text, not run as HTML.
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ===========================
   Phase 5 — Search filtering
   =========================== */

function applySearchFilter(query) {
  const q = String(query ?? "").trim().toLowerCase();
  const cards = $$(".topic-card");
  for (const card of cards) {
    const term = card.getAttribute("data-term") || "";
    const show = !q || term.includes(q);
    card.style.display = show ? "" : "none";
  }
}


/* =====================================
   Phase 6 — Progress dashboard + streak
   ===================================== */

function updateDashboard() {
  const flat = allTopicsFlat();
  const completedCount = flat.filter(t => STATE.completedTopics[t.id]).length;
  const pct = flat.length ? Math.round((completedCount / flat.length) * 100) : 0;

  const pctEl = pick("#progressPct", "#progressPercent");
  if (pctEl) pctEl.textContent = `${pct}%`;

  const streakEl = $("#streakCount");
  if (streakEl) streakEl.textContent = String(STATE.streak ?? 0);

  // Weak list: top 5 by weakScore
  const weakPairs = flat
    .map(t => ({ id: t.id, term: t.term, score: STATE.weakScore[t.id] ?? 0 }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const weakList = pick("#weakList", "#weakTopicsList");
  if (weakList) {
    weakList.innerHTML = weakPairs.length
      ? weakPairs.map(w => `<li>${escapeHTML(w.term)} <span class="muted">(score ${w.score})</span></li>`).join("")
      : `<li class="muted">No weak topics yet — keep going.</li>`;
  }
}


/* =========================================
   Phase 7 — Dark mode (persisted preference)
   ========================================= */

function applyTheme() {
  // WHY: Theme should persist so the UI feels “yours.”
  document.documentElement.dataset.theme = STATE.theme;
  document.body.classList.toggle("dark-mode", STATE.theme === "dark");
}

function setupDarkMode() {
  const toggle = $("#darkModeToggle");
  if (!toggle) return;

  const syncToggleUI = () => {
    const isDark = STATE.theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    if (toggle.tagName === "BUTTON") {
      toggle.textContent = isDark ? "☀️" : "🌙";
    } else {
      toggle.checked = isDark;
    }
  };

  syncToggleUI();

  const onToggle = () => {
    const isDarkNow = STATE.theme === "dark";
    STATE.theme = isDarkNow ? "light" : "dark";
    saveState();
    applyTheme();
    syncToggleUI();
  };

  toggle.addEventListener("click", onToggle);
  if (toggle.tagName !== "BUTTON") {
    toggle.addEventListener("change", onToggle);
  }
}


/* ==========================================
   Phase 8 — Flashcards (simple spaced review)
   ==========================================

  💡 Why spaced review?
  If you know a card, you should see it less often.
  If you miss it, it should come back sooner.

  We'll implement a tiny version:
  - "Know It": interval grows: 1 → 2 → 4 → 7 days
  - "Review Again": interval resets to 1 day (or due now)
*/

let FLASH = {
  deck: [],      // array of topic objects
  current: null, // current topic
  showingBack: false
};

function scheduleFlashcardSoon(topicId) {
  // due today (so it shows up quickly)
  const today = todayLocalISO();
  STATE.flashSchedule[topicId] = { dueISO: today, intervalDays: 1 };
  saveState();
}

function nextDueFlashcard() {
  const today = todayLocalISO();
  const deck = allTopicsFlat().filter(t => t.flashcardFront && t.flashcardBack);

  // Ensure every card has a schedule
  for (const t of deck) {
    if (!STATE.flashSchedule[t.id]) {
      STATE.flashSchedule[t.id] = { dueISO: today, intervalDays: 1 };
    }
  }
  saveState();

  // Pick due ones first; if none due, pick the soonest due
  const due = deck
    .map(t => ({ topic: t, sched: STATE.flashSchedule[t.id] }))
    .sort((a, b) => a.sched.dueISO.localeCompare(b.sched.dueISO));

  const dueNow = due.filter(x => x.sched.dueISO <= today);
  return (dueNow[0] ?? due[0] ?? null);
}

function renderFlashcard() {
  const area = pick("#flashcardArea", "#flashcardsMode");
  if (!area) return;

  const frontEl = pick("#fcFront", "#flashcardFront");
  const backEl = pick("#fcBack", "#flashcardBack");
  const countEl = pick("#fcCount", "#flashcardCount");
  const flashcardEl = pick("#flashcard");

  const pick = nextDueFlashcard();
  if (!pick) {
    if (frontEl) frontEl.textContent = "No flashcards available.";
    if (backEl) backEl.textContent = "";
    return;
  }

  FLASH.current = pick.topic;
  FLASH.showingBack = false;

  if (frontEl) frontEl.textContent = safeText(FLASH.current.flashcardFront);
  if (backEl) backEl.textContent = safeText(FLASH.current.flashcardBack);
  if (backEl) backEl.classList.add("hidden");
  if (flashcardEl) flashcardEl.classList.remove("flipped");
  if (countEl) {
    const total = allTopicsFlat().filter(t => t.flashcardFront).length;
    countEl.textContent = `Card ready • ${total} total`;
  }

  markStudiedToday();
  updateDashboard();
}

function setupFlashcards() {
  const flip = pick("#fcFlip", "#flipBtn", "#flashcard");
  const know = pick("#fcKnow", "#knowItBtn");
  const again = pick("#fcAgain", "#reviewAgainBtn");

  if (flip) {
    flip.addEventListener("click", () => {
      const backEl = pick("#fcBack", "#flashcardBack");
      const flashcardEl = pick("#flashcard");
      if (!backEl) return;
      FLASH.showingBack = !FLASH.showingBack;
      backEl.classList.toggle("hidden", !FLASH.showingBack);
      if (flashcardEl) flashcardEl.classList.toggle("flipped", FLASH.showingBack);
    });
  }

  if (know) {
    know.addEventListener("click", () => {
      if (!FLASH.current) return;
      const id = FLASH.current.id;
      // If they know it, reduce weakness and push it out.
      reduceWeak(id, 1);

      const sched = STATE.flashSchedule[id] ?? { dueISO: todayLocalISO(), intervalDays: 1 };
      const nextInterval = nextIntervalDays(sched.intervalDays);
      const nextDue = addDaysISO(todayLocalISO(), nextInterval);

      STATE.flashSchedule[id] = { dueISO: nextDue, intervalDays: nextInterval };
      saveState();

      setTopicCompleted(id, true);
      renderFlashcard();
    });
  }

  if (again) {
    again.addEventListener("click", () => {
      if (!FLASH.current) return;
      const id = FLASH.current.id;

      bumpWeak(id, 1);

      // Due today so it resurfaces quickly
      STATE.flashSchedule[id] = { dueISO: todayLocalISO(), intervalDays: 1 };
      saveState();

      renderFlashcard();
    });
  }
}

function nextIntervalDays(current) {
  // A simple growth curve.
  if (current <= 1) return 2;
  if (current === 2) return 4;
  if (current === 4) return 7;
  return Math.min(14, current + 3);
}

function addDaysISO(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}


/* ==========================
   Phase 9 — Quiz engine
   ========================== */

let QUIZ = {
  chapterId: null,
  questions: [],
  index: 0,
  score: 0
};

function startQuiz(chapterId) {
  const ch = STUDY_DATA.chapters.find(c => c.id === chapterId);
  if (!ch) return;

  QUIZ.chapterId = chapterId;
  QUIZ.questions = shuffle([...ch.quiz]);
  QUIZ.index = 0;
  QUIZ.score = 0;

  renderQuiz();
}

function renderQuiz() {
  const area = pick("#quizArea", "#activeQuiz");
  if (!area) return;

  const title = pick("#quizTitle");
  const qEl = pick("#quizQuestion", "#questionText");
  const ansWrap = pick("#quizAnswers", "#mcOptions");
  const fb = $("#quizFeedback");
  const nextBtn = pick("#quizNext", "#nextQuestionBtn");
  const questionType = pick("#questionType");
  const feedbackText = pick("#feedbackText");
  const feedbackExplanation = pick("#feedbackExplanation");
  const feedbackIcon = pick("#feedbackIcon");
  const scoreEl = $("#quizScore");
  const quizSelection = pick("#quizSelection");

  if (quizSelection) quizSelection.classList.add("hidden");
  area.classList.remove("hidden");

  const ch = STUDY_DATA.chapters.find(c => c.id === QUIZ.chapterId);
  if (title && ch) title.textContent = `${ch.title} — Quiz`;

  const q = QUIZ.questions[QUIZ.index];
  if (!q) {
    // quiz finished
    if (qEl) qEl.textContent = "Quiz complete!";
    if (ansWrap) ansWrap.innerHTML = "";
    if (feedbackText) feedbackText.textContent = `Final score: ${QUIZ.score}/${QUIZ.questions.length}`;
    if (feedbackExplanation) feedbackExplanation.textContent = "";
    if (feedbackIcon) feedbackIcon.textContent = "✅";
    if (fb) fb.classList.remove("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");

    const finalScore = pick("#finalScore");
    const quizSummary = pick("#quizSummary");
    const quizResults = pick("#quizResults");
    if (finalScore) {
      const pct = QUIZ.questions.length ? Math.round((QUIZ.score / QUIZ.questions.length) * 100) : 0;
      finalScore.textContent = `${pct}%`;
    }
    if (quizSummary) quizSummary.textContent = `You scored ${QUIZ.score} out of ${QUIZ.questions.length}.`;
    if (quizResults) quizResults.classList.remove("hidden");
    area.classList.add("hidden");

    persistQuizStats(QUIZ.chapterId, QUIZ.score, QUIZ.questions.length);
    markStudiedToday();
    updateDashboard();
    return;
  }

  if (scoreEl) scoreEl.textContent = `Score: ${QUIZ.score}`;
  if (fb) fb.classList.add("hidden");
  if (feedbackText) feedbackText.textContent = "";
  if (feedbackExplanation) feedbackExplanation.textContent = "";
  if (feedbackIcon) feedbackIcon.textContent = "";
  if (nextBtn) nextBtn.classList.add("hidden");

  if (qEl) qEl.textContent = q.question;
  if (questionType) {
    if (q.type === "mcq") questionType.textContent = "Multiple Choice";
    if (q.type === "tf") questionType.textContent = "True / False";
    if (q.type === "fib") questionType.textContent = "Fill in the Blank";
  }

  // Build answers UI depending on question type
  if (ansWrap) {
    ansWrap.innerHTML = "";

    if (q.type === "mcq") {
      q.choices.forEach((choice, idx) => {
        const b = document.createElement("button");
        b.className = "btn answer";
        b.textContent = choice;
        b.addEventListener("click", () => gradeAnswer({ type: "mcq", pickedIndex: idx }));
        ansWrap.appendChild(b);
      });
    } else if (q.type === "tf") {
      ["True", "False"].forEach((label) => {
        const b = document.createElement("button");
        b.className = "btn answer";
        b.textContent = label;
        const picked = (label === "True");
        b.addEventListener("click", () => gradeAnswer({ type: "tf", pickedBool: picked }));
        ansWrap.appendChild(b);
      });
    } else if (q.type === "fib") {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "input";
      input.placeholder = "Type your answer…";
      input.setAttribute("aria-label", "Fill in the blank answer");

      const submit = document.createElement("button");
      submit.className = "btn";
      submit.textContent = "Submit";
      submit.addEventListener("click", () => gradeAnswer({ type: "fib", pickedText: input.value }));

      ansWrap.appendChild(input);
      ansWrap.appendChild(submit);
    }
  }
}

function gradeAnswer(payload) {
  const q = QUIZ.questions[QUIZ.index];
  if (!q) return;

  const fb = $("#quizFeedback");
  const nextBtn = pick("#quizNext", "#nextQuestionBtn");
  const feedbackText = pick("#feedbackText");
  const feedbackExplanation = pick("#feedbackExplanation");
  const feedbackIcon = pick("#feedbackIcon");
  const scoreEl = $("#quizScore");

  let correct = false;

  if (q.type === "mcq") {
    correct = payload.pickedIndex === q.answerIndex;
  } else if (q.type === "tf") {
    correct = payload.pickedBool === q.answerBool;
  } else if (q.type === "fib") {
    // Keep it simple: case-insensitive exact match
    const picked = String(payload.pickedText ?? "").trim().toLowerCase();
    const ans = String(q.answerText ?? "").trim().toLowerCase();
    correct = picked === ans;
  }

  if (correct) {
    QUIZ.score += 1;
    if (feedbackIcon) feedbackIcon.textContent = "✅";
    if (feedbackText) feedbackText.textContent = "Correct!";
    if (feedbackExplanation) feedbackExplanation.textContent = q.explanation;
    if (fb && !feedbackText) fb.textContent = `✅ Correct. ${q.explanation}`;
    // If correct, lower weakness signal for any linked topic (optional)
  } else {
    if (feedbackIcon) feedbackIcon.textContent = "❌";
    if (feedbackText) feedbackText.textContent = "Not quite.";
    if (feedbackExplanation) feedbackExplanation.textContent = q.explanation;
    if (fb && !feedbackText) fb.textContent = `❌ Not quite. ${q.explanation}`;
    // If missed, bump weakness on a related topic if provided
    if (q.topicId) bumpWeak(q.topicId, 2);
  }

  if (fb) fb.classList.remove("hidden");
  if (scoreEl) scoreEl.textContent = `Score: ${QUIZ.score}`;
  if (nextBtn) {
    nextBtn.classList.remove("hidden");
    nextBtn.onclick = () => {
      QUIZ.index += 1;
      renderQuiz();
    };
  }

  markStudiedToday();
  updateDashboard();
}

function persistQuizStats(chapterId, score, total) {
  const prev = STATE.quizStats[chapterId] ?? { bestScore: 0, attempts: 0, lastScore: 0 };
  prev.attempts += 1;
  prev.lastScore = score;
  prev.bestScore = Math.max(prev.bestScore, score);
  STATE.quizStats[chapterId] = prev;
  saveState();
}

function shuffle(arr) {
  // Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/* ====================================
   Phase 10 — Interactive demos (safe)
   ==================================== */

/* ---------- Demo A: HTTP (fake request/response) ---------- */
function setupHttpDemo() {
  const send = $("#httpSend");
  const log = $("#httpLog");
  const url = $("#httpUrl");
  const method = $("#httpMethod");
  if (!send || !log || !url || !method) return;

  send.addEventListener("click", () => {
    const m = method.value || "GET";
    const u = url.value || "https://example.com/page";

    // WHY: This is NOT a real network call (no CORS, no fetch).
    // It’s a visual model of request/response.
    const lines = [
      `> Request`,
      `${m} ${u} HTTP/1.1`,
      `Host: ${new URL(u, "https://example.com").host}`,
      ``,
      `< Response`,
      `HTTP/1.1 200 OK`,
      `Content-Type: text/html`,
      ``,
      `<html>...page content...</html>`
    ];

    log.textContent = lines.join("\n");
    markStudiedToday();
    updateDashboard();
  });
}

/* ---------- Demo B: HTML preview (sanitized) ---------- */
function setupHtmlDemo() {
  const input = $("#htmlInput");
  const preview = $("#htmlPreview");
  const mode = $("#htmlRenderMode"); // "safeText" or "whitelist"
  const explain = $("#htmlExplain");
  if (!input || !preview || !mode) return;

  const allowedTags = new Set(["B", "I", "EM", "STRONG", "P", "H1", "H2", "H3", "UL", "OL", "LI", "A", "BR"]);
  const allowedAttrs = {
    "A": new Set(["href", "target", "rel"])
  };

  function sanitizeToWhitelist(html) {
    // WHY: If we render raw user HTML, they could inject scripts.
    // So we parse and rebuild only allowed tags/attrs.
    const doc = new DOMParser().parseFromString(html, "text/html");
    const frag = document.createDocumentFragment();

    function walk(node, parentFrag) {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          parentFrag.appendChild(document.createTextNode(child.textContent));
          continue;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) continue;

        const tag = child.tagName.toUpperCase();
        if (!allowedTags.has(tag)) {
          // Skip tag but keep its text content (teaching moment: some tags are blocked)
          parentFrag.appendChild(document.createTextNode(child.textContent));
          continue;
        }

        const el = document.createElement(tag.toLowerCase());

        // Copy only safe attributes
        const allowed = allowedAttrs[tag];
        if (allowed) {
          for (const attr of Array.from(child.attributes)) {
            const name = attr.name.toLowerCase();
            if (allowed.has(name)) el.setAttribute(name, attr.value);
          }
          // enforce safe link behavior
          if (tag === "A") {
            el.setAttribute("rel", "noopener noreferrer");
            if (!el.getAttribute("target")) el.setAttribute("target", "_blank");
          }
        }

        walk(child, el);
        parentFrag.appendChild(el);
      }
    }

    walk(doc.body, frag);
    return frag;
  }

  function render() {
    const value = input.value ?? "";
    const m = mode.value ?? "safeText";

    if (m === "safeText") {
      preview.textContent = value; // safe, shows code as text
      if (explain) explain.textContent = "Safe Text mode shows HTML as code (no rendering).";
    } else {
      preview.innerHTML = "";
      preview.appendChild(sanitizeToWhitelist(value));
      if (explain) explain.textContent = "Whitelist mode renders only safe tags (scripts removed).";
    }

    markStudiedToday();
    updateDashboard();
  }

  input.addEventListener("input", render);
  mode.addEventListener("change", render);
  render();
}

/* ---------- Demo C: CSS box model playground ---------- */
function setupBoxDemo() {
  const preview = $("#boxPreview");
  const m = $("#marginSlider");
  const p = $("#paddingSlider");
  const b = $("#borderSlider");
  const readout = $("#boxReadout");
  if (!preview || !m || !p || !b) return;

  function update() {
    const margin = clamp(Number(m.value), 0, 60);
    const padding = clamp(Number(p.value), 0, 60);
    const border = clamp(Number(b.value), 0, 20);

    preview.style.margin = `${margin}px`;
    preview.style.padding = `${padding}px`;
    preview.style.borderWidth = `${border}px`;
    preview.style.borderStyle = border > 0 ? "solid" : "none";

    if (readout) {
      readout.textContent = `margin: ${margin}px | padding: ${padding}px | border: ${border}px`;
    }

    markStudiedToday();
    updateDashboard();
  }

  m.addEventListener("input", update);
  p.addEventListener("input", update);
  b.addEventListener("input", update);
  update();
}

/* ---------- Demo D: DOM demo (selectors + events) ---------- */
function setupDomDemo() {
  const target = $("#domTarget");
  const btnText = $("#domBtnText");
  const btnColor = $("#domBtnColor");
  const btnMany = $("#domBtnMany");
  if (!target || !btnText || !btnColor || !btnMany) return;

  btnText.addEventListener("click", () => {
    // WHY: demonstrate getElementById
    const el = document.getElementById("domTarget");
    if (el) el.textContent = "Text changed via getElementById() ✅";
    markStudiedToday();
    updateDashboard();
  });

  btnColor.addEventListener("click", () => {
    // WHY: demonstrate querySelector
    const el = document.querySelector("#domTarget");
    if (el) el.classList.toggle("highlight");
    markStudiedToday();
    updateDashboard();
  });

  btnMany.addEventListener("click", () => {
    // WHY: demonstrate querySelectorAll
    const items = document.querySelectorAll(".dom-item");
    items.forEach((node, i) => {
      node.textContent = `Item ${i + 1} updated`;
    });
    markStudiedToday();
    updateDashboard();
  });
}


/* ==================================
   Phase 11 — Export / Import progress
   ================================== */

function setupExportImport() {
  const exportBtn = $("#exportBtn");
  const importInput = pick("#importInput", "#importFile");
  const importBtn = pick("#importBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = {
        exportedAt: new Date().toISOString(),
        storageKey: STORAGE_KEY,
        state: STATE
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "csci4410-study-progress.json";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener("click", () => importInput.click());
  }

  if (importInput) {
    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        if (!parsed?.state) throw new Error("Missing state in file.");

        // WHY: Merge with defaults to stay compatible with future versions.
        STATE = { ...defaultState(), ...parsed.state };
        saveState();

        applyTheme();
        renderSidebar();
        renderTopics();
        updateDashboard();
        renderFlashcard();

      } catch (err) {
        alert("Import failed: " + (err?.message ?? "Unknown error"));
      } finally {
        importInput.value = "";
      }
    });
  }
}


/* ==========================
   Phase 12 — Wiring it all up
   ========================== */

function setupSearch() {
  const input = $("#searchInput");
  if (!input) return;
  input.addEventListener("input", () => applySearchFilter(input.value));
}

function setupQuizStartButtons() {
  // Optional: any button with data-start-quiz="ch1" etc.
  $$("[data-start-quiz]").forEach(btn => {
    btn.addEventListener("click", () => {
      const ch = btn.getAttribute("data-start-quiz");
      startQuiz(ch);
    });
  });

  // Optional: Default start quiz if a chapter selector exists
  const defaultBtn = $("#quizBtn");
  if (defaultBtn) {
    defaultBtn.addEventListener("click", () => startQuiz("ch1"));
  }

  const startBtn = pick("#startQuizBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => startQuiz("ch1"));
  }
}

function switchMode(mode) {
  const map = {
    study: pick("#studyMode"),
    flashcards: pick("#flashcardsMode"),
    quiz: pick("#quizMode")
  };

  Object.entries(map).forEach(([key, section]) => {
    if (!section) return;
    section.classList.toggle("hidden", key !== mode);
  });

  $$(".mode-btn").forEach(btn => {
    const active = btn.getAttribute("data-mode") === mode;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  if (mode === "flashcards") renderFlashcard();
  if (mode === "quiz") {
    const quizSelection = pick("#quizSelection");
    const activeQuiz = pick("#activeQuiz");
    const quizResults = pick("#quizResults");
    if (quizSelection) quizSelection.classList.remove("hidden");
    if (activeQuiz) activeQuiz.classList.add("hidden");
    if (quizResults) quizResults.classList.add("hidden");
  }
}

function setupModeSwitcher() {
  $$(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      if (mode) switchMode(mode);
    });
  });
}

function setupSidebarMobile() {
  const sidebar = pick("#sidebar");
  const overlay = pick("#sidebarOverlay");
  const openBtn = pick("#menuToggle");
  const closeBtn = pick("#sidebarClose");

  if (!sidebar || !overlay) return;

  const close = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  };

  const open = () => {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  };

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
}

function boot() {
  window.app = {
    switchMode,
    startFlashcards: () => {
      switchMode("flashcards");
      renderFlashcard();
    },
    retakeQuiz: () => {
      switchMode("quiz");
      startQuiz("ch1");
    }
  };

  applyTheme();
  renderSidebar();
  renderTopics();
  updateDashboard();

  setupDarkMode();
  setupSearch();
  setupModeSwitcher();
  setupSidebarMobile();

  // Flashcards
  setupFlashcards();
  renderFlashcard();

  // Quiz buttons
  setupQuizStartButtons();

  // Demos
  setupHttpDemo();
  setupHtmlDemo();
  setupBoxDemo();
  setupDomDemo();

  // Export / Import
  setupExportImport();

  switchMode("study");

  // Smooth scrolling when clicking sidebar links (nice UX)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#topic-"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("DOMContentLoaded", boot);