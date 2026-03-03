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
      learningObjectives: [
        "Understand the layers and structure of the Internet",
        "Learn how data travels between computers using TCP/IP",
        "Master IP addressing and DNS",
        "Understand HTTP requests and responses",
        "Learn about internet infrastructure and security concepts"
      ],
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
          choices: ["A language for styling websites","A protocol for requesting and receiving web resources","A type of IP address","A database system"],
          answerIndex: 1,
          explanation: "HTTP is the rule system for how browsers and servers exchange requests and responses."
        },
        {
          id: "ch1q2",
          type: "tf",
          question: "True/False: The Internet and the World Wide Web are the same thing.",
          answerBool: false,
          explanation: "The Internet is the network; the Web is a service that runs on it."
        },
        {
          id: "ch1q3",
          type: "mcq",
          question: "What does TCP/IP stand for?",
          choices: ["Transmission Control Protocol / Internet Protocol","Testing Control Procedure / Information Platform","Transfer Code Package / Internal Network","Technical Communication Protocol / Internet Package"],
          answerIndex: 0,
          explanation: "TCP/IP is the suite of protocols that form the foundation of the modern Internet."
        },
        {
          id: "ch1q4",
          type: "tf",
          question: "True/False: IPv6 addresses are shorter than IPv4 addresses.",
          answerBool: false,
          explanation: "IPv6 addresses are actually longer (128 bits) than IPv4 addresses (32 bits)."
        },
        {
          id: "ch1q5",
          type: "mcq",
          question: "How many unique addresses does IPv4 support?",
          choices: ["About 4.3 billion","About 340 undecillion","About 65,000","Unlimited"],
          answerIndex: 0,
          explanation: "IPv4 has 2^32 possible addresses, roughly 4.3 billion. IPv6 has 2^128 addresses."
        },
        {
          id: "ch1q6",
          type: "tf",
          question: "True/False: HTTPS is the same as HTTP with an 'S' for secure.",
          answerBool: true,
          explanation: "HTTPS stands for HTTP Secure and uses SSL/TLS encryption for secure communication."
        },
        {
          id: "ch1q7",
          type: "mcq",
          question: "What does DNS do?",
          choices: ["Encrypts web traffic","Translates domain names to IP addresses","Stores website content","Controls browser cache"],
          answerIndex: 1,
          explanation: "DNS (Domain Name System) resolves human-readable domain names into IP addresses."
        },
        {
          id: "ch1q8",
          type: "tf",
          question: "True/False: A URL and a domain name are the same thing.",
          answerBool: false,
          explanation: "A domain name (example.com) is part of a URL. A URL includes protocol, domain, path, etc. (https://example.com/path)."
        },
        {
          id: "ch1q9",
          type: "mcq",
          question: "In a client-server model, what is the client?",
          choices: ["The company that owns the website","The computer requesting resources (like a browser)","The hardware that stores data","The software that handles payments"],
          answerIndex: 1,
          explanation: "The client is the user's device (browser, app, etc.) that requests data from the server."
        },
        {
          id: "ch1q10",
          type: "mcq",
          question: "What is the primary purpose of packet switching in networks?",
          choices: ["Make data travel faster","Break data into chunks that can take different routes","Encrypt all traffic","Reduce file sizes"],
          answerIndex: 1,
          explanation: "Packet switching breaks data into smaller chunks that can travel independently, improving efficiency and reliability."
        },
        {
          id: "ch1q11",
          type: "tf",
          question: "True/False: Ports are physical connectors on a computer.",
          answerBool: false,
          explanation: "In networking, ports are virtual (not physical)—numbered endpoints for network communication (e.g., port 80 for HTTP)."
        },
        {
          id: "ch1q12",
          type: "mcq",
          question: "What port does HTTP typically use?",
          choices: ["22","80","443","8080"],
          answerIndex: 1,
          explanation: "HTTP uses port 80 by default. HTTPS uses port 443. SSH uses port 22."
        },
        {
          id: "ch1q13",
          type: "fib",
          question: "A _____ translates a domain name like 'google.com' into an IP address.",
          answerText: "DNS server",
          explanation: "DNS servers (Domain Name System) resolve domain names to their corresponding IP addresses."
        },
        {
          id: "ch1q14",
          type: "mcq",
          question: "Which of the following best describes bandwidth?",
          choices: ["The speed of light on the internet","The maximum amount of data that can travel through a connection per second","The distance between client and server","The size of data packets"],
          answerIndex: 1,
          explanation: "Bandwidth is the capacity of a connection—measured in bits per second (Mbps, Gbps, etc.)."
        },
        {
          id: "ch1q15",
          type: "tf",
          question: "True/False: Latency and bandwidth are the same thing.",
          answerBool: false,
          explanation: "Latency is delay (how long data takes); bandwidth is capacity (how much data per second)."
        },
        {
          id: "ch1q16",
          type: "mcq",
          question: "What does 'stateless' mean in the context of HTTP?",
          choices: ["HTTP never works","Each request stands alone; the server doesn't remember previous requests","HTTP only works in certain countries","Servers can't handle multiple connections"],
          answerIndex: 1,
          explanation: "HTTP is stateless—the server doesn't inherently remember previous requests. Cookies/sessions are used to maintain state."
        },
        {
          id: "ch1q17",
          type: "fib",
          question: "The 4-layer model of the internet includes Application, Transport, Internet, and the _____ layer.",
          answerText: "Link",
          explanation: "The TCP/IP model has 4 layers: Application, Transport, Internet, and Link (physical)."
        },
        {
          id: "ch1q18",
          type: "tf",
          question: "True/False: The World Wide Web was invented after the Internet.",
          answerBool: true,
          explanation: "The Internet dates to the 1960s-1980s; the Web (HTTP/HTML) was invented by Tim Berners-Lee in 1989."
        },
        {
          id: "ch1q19",
          type: "mcq",
          question: "What is the main disadvantage of IPv4?",
          choices: ["It's slower than IPv6","It doesn't support encryption","It has a limited address space","It doesn't work with HTTP"],
          answerIndex: 2,
          explanation: "IPv4's main limitation is its 32-bit address space, resulting in approximately 4.3 billion addresses—now exhausted."
        },
        {
          id: "ch1q20",
          type: "tf",
          question: "True/False: Routers are only needed in large networks.",
          answerBool: false,
          explanation: "Routers are fundamental to any network—they direct data packets between networks and are found in home networks too."
        },
        {
          id: "ch1q21",
          type: "mcq",
          question: "What does 'ping' do in networking?",
          choices: ["Sends data to a server","Tests connectivity by sending a request and measuring response time","Encrypts data","Increases bandwidth"],
          answerIndex: 1,
          explanation: "Ping sends a small packet to a host and measures the round-trip time, testing if the host is reachable."
        },
        {
          id: "ch1q22",
          type: "fib",
          question: "A _____ is a unique identifier for a device on a network.",
          answerText: "IP address",
          explanation: "An IP address uniquely identifies a device on a network (e.g., 192.168.1.1 for IPv4)."
        },
        {
          id: "ch1q23",
          type: "tf",
          question: "True/False: HTTP/3 is the latest version of HTTP still used in 2024.",
          answerBool: true,
          explanation: "HTTP/2 (2015) and HTTP/3 (2022) are modern versions offering improvements over HTTP/1.1."
        },
        {
          id: "ch1q24",
          type: "mcq",
          question: "What protocol is used to load websites securely?",
          choices: ["SMTP","FTP","HTTPS","SSH"],
          answerIndex: 2,
          explanation: "HTTPS (HTTP Secure) is the protocol designed for securely loading websites with encryption."
        },
        {
          id: "ch1q25",
          type: "fib",
          question: "The _____ model divides networking into the Application, Transport, Internet, and Link layers.",
          answerText: "TCP/IP",
          explanation: "The TCP/IP model is the foundational framework of modern internet architecture."
        }
      ]
    },

    {
      id: "ch2",
      title: "Chapter 2 — HTML Basics",
      learningObjectives: [
        "Understand HTML structure and semantics",
        "Learn the purpose of common HTML elements",
        "Master forms and accessibility features",
        "Understand HTML5 features and best practices",
        "Learn how to write clean, meaningful markup"
      ],
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
          choices: ["Structure/content","Database storage","Network routing","CPU scheduling"],
          answerIndex: 0,
          explanation: "HTML defines the structure and content of the page; CSS handles style."
        },
        {
          id: "ch2q2",
          type: "tf",
          question: "True/False: HTML elements without closing tags are called void elements.",
          answerBool: true,
          explanation: "Void elements (like <img>, <br>, <input>) don't have closing tags and are self-contained."
        },
        {
          id: "ch2q3",
          type: "mcq",
          question: "Which tag is used to define the main heading of a page?",
          choices: ["<h2>","<h1>","<header>","<title>"],
          answerIndex: 1,
          explanation: "<h1> represents the highest-level heading and should typically be used once per page for the main heading."
        },
        {
          id: "ch2q4",
          type: "mcq",
          question: "What does the HTML <meta> tag in the <head> do?",
          choices: ["Displays metadata on the page","Provides metadata about the HTML document (character set, viewport, etc.)","Creates a metadata link","Stores metadata in the database"],
          answerIndex: 1,
          explanation: "<meta> tags provide information about the document to browsers and search engines but don't display content."
        },
        {
          id: "ch2q5",
          type: "tf",
          question: "True/False: The <title> tag appears as the page heading.",
          answerBool: false,
          explanation: "The <title> tag appears in the browser tab and search results, not as a visible page heading."
        },
        {
          id: "ch2q6",
          type: "mcq",
          question: "Which attribute is required for the <img> tag?",
          choices: ["alt","src","style","class"],
          answerIndex: 1,
          explanation: "The src attribute is required to specify the image file path. The alt attribute is also important for accessibility."
        },
        {
          id: "ch2q7",
          type: "fib",
          question: "A _____ is text that describes an image if it fails to load or for accessibility purposes.",
          answerText: "alt attribute",
          explanation: "The alt attribute provides alternative text for images, crucial for screen readers and SEO."
        },
        {
          id: "ch2q8",
          type: "mcq",
          question: "Which tag creates a line break in HTML?",
          choices: ["<break>","<lb>","<br>","<newline>"],
          answerIndex: 2,
          explanation: "The <br> tag creates a single line break. It's a void element and doesn't need a closing tag."
        },
        {
          id: "ch2q9",
          type: "tf",
          question: "True/False: <strong> and <b> tags do exactly the same thing.",
          answerBool: false,
          explanation: "<strong> is semantic and indicates importance; <b> is presentational. <strong> is preferred for meaning."
        },
        {
          id: "ch2q10",
          type: "mcq",
          question: "What does the <form> tag do?",
          choices: ["Creates a formatted table","Defines a section containing user input elements","Formats text","Creates a horizontal line"],
          answerIndex: 1,
          explanation: "<form> containers hold input fields and buttons, grouping user input for submission."
        },
        {
          id: "ch2q11",
          type: "mcq",
          question: "Which input type is used for passwords?",
          choices: ["<input type='text'>","<input type='password'>","<input type='secret'>","<input type='encrypted'>"],
          answerIndex: 1,
          explanation: "<input type='password'> masks user input with dots or asterisks for security."
        },
        {
          id: "ch2q12",
          type: "tf",
          question: "True/False: HTML5 is the current standard version of HTML.",
          answerBool: true,
          explanation: "HTML5 (released 2014) is the current living standard maintained by WHATWG."
        },
        {
          id: "ch2q13",
          type: "mcq",
          question: "What is semantic HTML?",
          choices: ["HTML that looks good","HTML using tags that describe meaning (like <header>, <nav>, <article>)","HTML for search engines only","HTML without CSS"],
          answerIndex: 1,
          explanation: "Semantic HTML uses tags like <header>, <article>, <section> to convey meaning to browsers and assistive technologies."
        },
        {
          id: "ch2q14",
          type: "fib",
          question: "The _____ element defines navigation links.",
          answerText: "nav",
          explanation: "<nav> is a semantic HTML5 element for grouping navigation links."
        },
        {
          id: "ch2q15",
          type: "mcq",
          question: "What tag is used to create an unordered list?",
          choices: ["<ol>","<ul>","<list>","<dl>"],
          answerIndex: 1,
          explanation: "<ul> creates an unordered (bulleted) list. <ol> creates an ordered (numbered) list."
        },
        {
          id: "ch2q16",
          type: "tf",
          question: "True/False: The <div> tag is a semantic HTML element.",
          answerBool: false,
          explanation: "<div> is non-semantic; it's a generic container. Semantic alternatives include <section>, <article>, <aside>, etc."
        },
        {
          id: "ch2q17",
          type: "mcq",
          question: "Which tag creates a table in HTML?",
          choices: ["<grid>","<table>","<array>","<matrix>"],
          answerIndex: 1,
          explanation: "<table> creates tables; <tr> defines rows, <td> defines cells."
        },
        {
          id: "ch2q18",
          type: "fib",
          question: "The _____ attribute specifies where a link goes.",
          answerText: "href",
          explanation: "The href (hypertext reference) attribute on <a> tags specifies the link destination."
        },
        {
          id: "ch2q19",
          type: "tf",
          question: "True/False: You can nest HTML lists inside other lists.",
          answerBool: true,
          explanation: "Nested lists are common and create hierarchical structures."
        },
        {
          id: "ch2q20",
          type: "mcq",
          question: "What does the <label> tag do in forms?",
          choices: ["Creates bold text","Associates text with form input for better accessibility and larger click areas","Creates a section label","Labels form styling"],
          answerIndex: 1,
          explanation: "<label> improves form usability by associating text with inputs and expanding clickable areas."
        },
        {
          id: "ch2q21",
          type: "mcq",
          question: "Which element represents the footer of a page?",
          choices: ["<bottom>","<footer>","<end>","<foot>"],
          answerIndex: 1,
          explanation: "<footer> is a semantic HTML5 element for page footers containing copyright, links, etc."
        },
        {
          id: "ch2q22",
          type: "tf",
          question: "True/False: Empty HTML attributes can be used in HTML5 (e.g., <input required> instead of <input required='required'>).",
          answerBool: true,
          explanation: "HTML5 allows empty boolean attributes without values (e.g., disabled, checked, required)."
        },
        {
          id: "ch2q23",
          type: "fib",
          question: "The _____ element defines an independent, self-contained piece of content.",
          answerText: "article",
          explanation: "<article> is a semantic element for content like blog posts, news articles, etc."
        },
        {
          id: "ch2q24",
          type: "mcq",
          question: "What is the purpose of the HTML <!DOCTYPE> declaration?",
          choices: ["Defines variables","Tells the browser which version of HTML is used","Creates a comment","Links to stylesheets"],
          answerIndex: 1,
          explanation: "<!DOCTYPE html> declares the document as HTML5 and ensures proper rendering."
        },
        {
          id: "ch2q25",
          type: "tf",
          question: "True/False: HTML attributes are case-sensitive.",
          answerBool: false,
          explanation: "HTML attributes are case-insensitive. onclick, ONCLICK, and OnClick are equivalent."
        }
      ]
    },

    {
      id: "ch3",
      title: "Chapter 3 — CSS Basics",
      learningObjectives: [
        "Master selectors, specificity, and the cascade",
        "Understand the box model deeply",
        "Learn Flexbox and Grid for modern layouts",
        "Master responsive design with media queries",
        "Understand positioning, transforms, and animations"
      ],
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
        },
        {
          id: "ch3q2",
          type: "mcq",
          question: "Which CSS selector targets elements with a specific class?",
          choices: [".className","#className","className",":className"],
          answerIndex: 0,
          explanation: "A dot (.) prefix targets class selectors. Hash (#) is for IDs."
        },
        {
          id: "ch3q3",
          type: "fib",
          question: "The _____ selector targets elements with a specific ID.",
          answerText: "#",
          explanation: "The hash symbol (#) is used to select elements by their id attribute."
        },
        {
          id: "ch3q4",
          type: "mcq",
          question: "What does 'specificity' mean in CSS?",
          choices: ["How clear your code is","The rule determining which style is applied when multiple rules target the same element","The speed of CSS processing","Browser compatibility"],
          answerIndex: 1,
          explanation: "Specificity is the CSS algorithm that determines which rule 'wins' when conflicts occur (IDs > classes > elements)."
        },
        {
          id: "ch3q5",
          type: "tf",
          question: "True/False: !important always overrides other CSS rules.",
          answerBool: true,
          explanation: "!important has the highest specificity but should be used sparingly."
        },
        {
          id: "ch3q6",
          type: "mcq",
          question: "What does the 'display' property control in CSS?",
          choices: ["The monitor settings","How an element is rendered on the page","The text color","Image resolution"],
          answerIndex: 1,
          explanation: "The display property (block, inline, flex, grid, etc.) controls layout behavior."
        },
        {
          id: "ch3q7",
          type: "mcq",
          question: "What is the default display value for <div> elements?",
          choices: ["inline","block","flex","grid"],
          answerIndex: 1,
          explanation: "<div> elements are block-level by default, taking full width and creating line breaks."
        },
        {
          id: "ch3q8",
          type: "tf",
          question: "True/False: A margin of auto on left and right can center a block element.",
          answerBool: true,
          explanation: "margin: 0 auto; centers block elements horizontally."
        },
        {
          id: "ch3q9",
          type: "mcq",
          question: "What property is used to add space inside an element?",
          choices: ["margin","padding","border","spacing"],
          answerIndex: 1,
          explanation: "padding creates space inside an element; margin creates space outside."
        },
        {
          id: "ch3q10",
          type: "fib",
          question: "The _____ property controls the transparency of an element.",
          answerText: "opacity",
          explanation: "opacity ranges from 0 (transparent) to 1 (opaque)."
        },
        {
          id: "ch3q11",
          type: "mcq",
          question: "What does Flexbox provide?",
          choices: ["3D animations","A flexible box layout model for arranging items","Grid-based layouts only","Browser compatibility checking"],
          answerIndex: 1,
          explanation: "Flexbox (display: flex) is a layout model for flexible 1D layouts of items."
        },
        {
          id: "ch3q12",
          type: "tf",
          question: "True/False: Grid is better than Flexbox for all layouts.",
          answerBool: false,
          explanation: "Flexbox is for 1D layouts; Grid is for 2D layouts. Choose based on your needs."
        },
        {
          id: "ch3q13",
          type: "mcq",
          question: "What does a media query do in CSS?",
          choices: ["Queries a database","Applies styles based on device characteristics (screen size, orientation, etc.)","Loads external CSS files","Creates animations"],
          answerIndex: 1,
          explanation: "Media queries allow responsive design by applying different styles based on viewport size and device features."
        },
        {
          id: "ch3q14",
          type: "fib",
          question: "The _____ unit in CSS is relative to the parent element's font size.",
          answerText: "em",
          explanation: "em units scale relative to the parent element's font-size."
        },
        {
          id: "ch3q15",
          type: "mcq",
          question: "What does 'rem' stand for in CSS?",
          choices: ["Relative element measurement","Root element measurement","Relative emotion measurement","Responsive element markup"],
          answerIndex: 1,
          explanation: "rem (root em) is relative to the root <html> font-size, not the parent."
        },
        {
          id: "ch3q16",
          type: "tf",
          question: "True/False: A CSS class can be applied to multiple elements.",
          answerBool: true,
          explanation: "Classes are reusable; a single class can style many elements."
        },
        {
          id: "ch3q17",
          type: "mcq",
          question: "What is the 'box-sizing' property used for?",
          choices: ["Setting box dimensions","Defining whether padding/border are included in width/height calculations","Creating outline borders","Aligning boxes"],
          answerIndex: 1,
          explanation: "box-sizing: border-box makes width/height include padding and border."
        },
        {
          id: "ch3q18",
          type: "mcq",
          question: "What is the 'position' property used for in CSS?",
          choices: ["Defines the number position","Controls how an element is positioned (static, relative, absolute, fixed)","Creates position markers","Aligns text position"],
          answerIndex: 1,
          explanation: "position controls positioning method: static (default), relative, absolute, fixed, sticky."
        },
        {
          id: "ch3q19",
          type: "tf",
          question: "True/False: A position: absolute element is positioned relative to its nearest positioned ancestor.",
          answerBool: true,
          explanation: "Absolute positioning is relative to the nearest non-static positioned parent."
        },
        {
          id: "ch3q20",
          type: "mcq",
          question: "What property controls text alignment in CSS?",
          choices: ["text-position","text-align","align-text","text-placement"],
          answerIndex: 1,
          explanation: "text-align controls horizontal alignment (left, center, right, justify)."
        },
        {
          id: "ch3q21",
          type: "fib",
          question: "The _____ property in CSS creates a shadow effect behind elements.",
          answerText: "box-shadow",
          explanation: "box-shadow creates shadow effects; text-shadow creates shadows on text."
        },
        {
          id: "ch3q22",
          type: "tf",
          question: "True/False: CSS Grid is only for creating table-like structures.",
          answerBool: false,
          explanation: "CSS Grid is flexible and can create complex 2D layouts beyond traditional tables."
        },
        {
          id: "ch3q23",
          type: "mcq",
          question: "What does 'justify-content' do in Flexbox?",
          choices: ["Aligns items vertically","Aligns items horizontally along the main axis","Justifies text","Creates content borders"],
          answerIndex: 1,
          explanation: "justify-content aligns flex items along the main axis."
        },
        {
          id: "ch3q24",
          type: "fib",
          question: "The _____ property in CSS controls the stacking order of overlapping elements.",
          answerText: "z-index",
          explanation: "z-index determines which element appears on top when elements overlap."
        },
        {
          id: "ch3q25",
          type: "tf",
          question: "True/False: CSS transitions create smoother animations than direct style changes.",
          answerBool: true,
          explanation: "Transitions smoothly animate changes between CSS property values over time."
        }
      ]
    },

    {
      id: "ch4",
      title: "Chapter 4 — JavaScript Basics",
      learningObjectives: [
        "Master variables, data types, and operators",
        "Understand functions, scope, and closures",
        "Learn DOM manipulation and events",
        "Master asynchronous programming (promises, async/await)",
        "Understand modern ES6+ features and best practices"
      ],
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
          choices: ["A list of all elements","The first element with that id","A CSS file","A server response"],
          answerIndex: 1,
          explanation: "getElementById returns the element whose id matches the string."
        },
        {
          id: "ch4q2",
          type: "mcq",
          question: "What is the difference between 'let' and 'var' in JavaScript?",
          choices: ["No difference","'let' has block scope; 'var' has function scope","'var' is newer","'let' is outdated"],
          answerIndex: 1,
          explanation: "'let' (ES6) has block scope; 'var' (older) has function scope. 'let' is preferred."
        },
        {
          id: "ch4q3",
          type: "tf",
          question: "True/False: JavaScript is a compiled language.",
          answerBool: false,
          explanation: "JavaScript is interpreted (and JIT compiled), not compiled like C or Java."
        },
        {
          id: "ch4q4",
          type: "mcq",
          question: "What is the DOM?",
          choices: ["A database system","A browser's representation of the HTML document as objects","A CSS framework","A JavaScript library"],
          answerIndex: 1,
          explanation: "The DOM (Document Object Model) represents the page as a tree of objects JavaScript can manipulate."
        },
        {
          id: "ch4q5",
          type: "fib",
          question: "The _____ method on an element adds an event listener.",
          answerText: "addEventListener",
          explanation: "addEventListener allows you to attach event handlers to elements."
        },
        {
          id: "ch4q6",
          type: "tf",
          question: "True/False: All JavaScript data types are objects.",
          answerBool: false,
          explanation: "JavaScript has primitives (string, number, boolean, null, undefined, symbol, bigint) and objects."
        },
        {
          id: "ch4q7",
          type: "mcq",
          question: "What does the 'typeof' operator do?",
          choices: ["Types text","Returns the data type of a value","Creates a new type","Converts types"],
          answerIndex: 1,
          explanation: "typeof returns a string indicating the data type of a value."
        },
        {
          id: "ch4q8",
          type: "mcq",
          question: "What is a function in JavaScript?",
          choices: ["A type of variable","A reusable block of code that performs a task","A CSS property","An HTML tag"],
          answerIndex: 1,
          explanation: "Functions are reusable blocks of code defined with function, arrow (=>) syntax, or function declarations."
        },
        {
          id: "ch4q9",
          type: "tf",
          question: "True/False: Arrow functions have their own 'this' binding.",
          answerBool: false,
          explanation: "Arrow functions inherit 'this' from enclosing scope, unlike regular functions."
        },
        {
          id: "ch4q10",
          type: "mcq",
          question: "What does querySelector return?",
          choices: ["All matching elements","The first element matching a CSS selector","A random element","An array of elements"],
          answerIndex: 1,
          explanation: "querySelector returns the first matching element; querySelectorAll returns all matches."
        },
        {
          id: "ch4q11",
          type: "fib",
          question: "The _____ property gets or sets the text content of an element.",
          answerText: "textContent",
          explanation: "textContent safely sets text without HTML interpretation."
        },
        {
          id: "ch4q12",
          type: "tf",
          question: "True/False: Using innerHTML can be unsafe if content comes from users.",
          answerBool: true,
          explanation: "innerHTML can allow XSS attacks if user content isn't sanitized."
        },
        {
          id: "ch4q13",
          type: "mcq",
          question: "What is an array in JavaScript?",
          choices: ["A single value","A specific type of CSS style","An ordered collection of values","A function parameter"],
          answerIndex: 2,
          explanation: "Arrays are ordered collections accessed by index (0, 1, 2, etc.)."
        },
        {
          id: "ch4q14",
          type: "tf",
          question: "True/False: Objects in JavaScript are just key-value pairs.",
          answerBool: true,
          explanation: "Objects store data as properties (key-value pairs) and methods."
        },
        {
          id: "ch4q15",
          type: "mcq",
          question: "What does JSON.stringify do?",
          choices: ["Parses JSON","Converts a JavaScript object to a JSON string","Validates JSON","Creates an object"],
          answerIndex: 1,
          explanation: "JSON.stringify converts objects to JSON strings; JSON.parse does the opposite."
        },
        {
          id: "ch4q16",
          type: "fib",
          question: "The _____ method removes the last element from an array.",
          answerText: "pop",
          explanation: "pop() removes and returns the last array element."
        },
        {
          id: "ch4q17",
          type: "mcq",
          question: "What does the 'map' method do on arrays?",
          choices: ["Finds one element","Creates a new array by transforming each element","Removes elements","Sorts elements"],
          answerIndex: 1,
          explanation: "map() creates a new array by applying a function to each element."
        },
        {
          id: "ch4q18",
          type: "tf",
          question: "True/False: Promises in JavaScript are for handling asynchronous operations.",
          answerBool: true,
          explanation: "Promises handle async operations with .then() and .catch() for success/failure."
        },
        {
          id: "ch4q19",
          type: "mcq",
          question: "What does 'async/await' do in JavaScript?",
          choices: ["Creates synchronous code","Provides cleaner syntax for handling promises","Delays execution","Prevents errors"],
          answerIndex: 1,
          explanation: "async/await simplifies promise handling with synchronous-looking code."
        },
        {
          id: "ch4q20",
          type: "fib",
          question: "The _____ method adds one or more elements to the end of an array.",
          answerText: "push",
          explanation: "push() adds elements to the end and returns the new length."
        },
        {
          id: "ch4q21",
          type: "tf",
          question: "True/False: JavaScript 'this' always refers to the object.",
          answerBool: false,
          explanation: "'this' depends on context: method, arrow function, regular function, or global scope."
        },
        {
          id: "ch4q22",
          type: "mcq",
          question: "What is closure in JavaScript?",
          choices: ["The end of a loop","A function with access to variables from its outer/parent scope","Closing a file","A CSS property"],
          answerIndex: 1,
          explanation: "Closures are functions that retain access to their parent scope's variables."
        },
        {
          id: "ch4q23",
          type: "mcq",
          question: "What does the 'filter' method do?",
          choices: ["Transforms elements","Creates a new array with elements that pass a test","Removes duplicates","Sorts elements"],
          answerIndex: 1,
          explanation: "filter() creates a new array containing only elements that pass the provided test."
        },
        {
          id: "ch4q24",
          type: "fib",
          question: "The _____ keyword is used to create a new instance of a class.",
          answerText: "new",
          explanation: "The 'new' keyword creates a new instance and calls the constructor."
        },
        {
          id: "ch4q25",
          type: "tf",
          question: "True/False: Event delegation means attaching listeners to multiple elements individually.",
          answerBool: false,
          explanation: "Event delegation attaches one listener to a parent to handle events from multiple children efficiently."
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