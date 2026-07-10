// ═══════════════════════════════════════════════════════════════
// KO. portfolio v2 — animation engines & easter eggs
// ═══════════════════════════════════════════════════════════════

const isFinePointer = window.matchMedia('(pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── PRELOADER ──────────────────────────────────────────────────
(function preloader() {
    const pre = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    const pct = document.getElementById('preloaderPct');
    let progress = 0;

    const tick = setInterval(() => {
        progress += Math.random() * 18 + 6;
        if (progress >= 100) {
            progress = 100;
            clearInterval(tick);
            setTimeout(() => {
                pre.classList.add('done');
                document.body.classList.add('loaded');
                setTimeout(() => pre.remove(), 800);
            }, 350);
        }
        fill.style.width = progress + '%';
        pct.textContent = Math.floor(progress);
    }, 110);
})();

// ─── FOOTER YEAR ────────────────────────────────────────────────
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ─── TIME-OF-DAY GREETING (subtle) ──────────────────────────────
(function greeting() {
    const h = new Date().getHours();
    const el = document.getElementById('heroGreeting');
    const base = 'Nestlé PH Intern thru Aug 2026 · DLSU CS · Manila';
    const day = h < 5 ? 'Burning the midnight oil? Same.' :
                h < 12 ? 'Good morning' :
                h < 18 ? 'Good afternoon' : 'Good evening';
    el.textContent = `${day} — ${base}`;
})();

// ─── SCROLL PROGRESS BAR ────────────────────────────────────────
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / Math.max(1, max)) * 100 + '%';
}, { passive: true });

// ─── NAV SHRINK ON SCROLL ───────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── CUSTOM CURSOR ──────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

if (isFinePointer) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function animRing() {
        rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a, button, .skill-tag, .wwm-card, .project-card, input').forEach(el => {
        el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); ring.classList.add('hovering'); });
        el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); ring.classList.remove('hovering'); });
    });
}

// ─── SECTION TITLE CHAR SPLIT ───────────────────────────────────
document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.style.transitionDelay = (i * 40) + 'ms';
        span.textContent = ch === ' ' ? ' ' : ch;
        span.setAttribute('aria-hidden', 'true');
        el.appendChild(span);
    });
});

// ─── SCROLL REVEAL ──────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), 70 * (i % 4));
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal, .section-header').forEach(el => revealObserver.observe(el));

// ─── NAV ACTIVE STATE ───────────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
        }
    });
}, { threshold: 0.35 });
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ─── SCRAMBLE TEXT (rotating roles) ─────────────────────────────
(function roleRotator() {
    const el = document.getElementById('roleScramble');
    const roles = ['Data Analyst', 'Software Engineer', 'ML Practitioner', 'Insights Storyteller', 'Full-Stack Builder', 'Problem Solver'];
    const chars = '!<>-_\\/[]{}—=+*^?#____';
    let idx = 0;

    function scrambleTo(newText) {
        const oldText = el.textContent;
        const length = Math.max(oldText.length, newText.length);
        let frame = 0;
        const queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 24);
            const end = start + Math.floor(Math.random() * 24);
            queue.push({ from, to, start, end, char: '' });
        }
        function update() {
            let output = '';
            let complete = 0;
            for (const q of queue) {
                if (frame >= q.end) { complete++; output += q.to; }
                else if (frame >= q.start) {
                    if (!q.char || Math.random() < 0.28) q.char = chars[Math.floor(Math.random() * chars.length)];
                    output += `<span style="opacity:0.5">${q.char}</span>`;
                } else output += q.from;
            }
            el.innerHTML = output;
            if (complete !== queue.length) { frame++; requestAnimationFrame(update); }
        }
        update();
    }

    if (prefersReducedMotion) return;
    setInterval(() => {
        idx = (idx + 1) % roles.length;
        scrambleTo(roles[idx]);
    }, 3400);
})();

// ─── ANIMATED COUNTERS ──────────────────────────────────────────
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterObserver.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ─── 3D TILT + SPOTLIGHT ON PROJECT CARDS ───────────────────────
if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.transform = `rotateY(${(px - 0.5) * 7}deg) rotateX(${(0.5 - py) * 7}deg) translateZ(0)`;
            card.style.setProperty('--mx', px * 100 + '%');
            card.style.setProperty('--my', py * 100 + '%');
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

// ─── MAGNETIC ELEMENTS ──────────────────────────────────────────
if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.28}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}

// ─── MOBILE MENU ────────────────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileMenuClose');

function openMobileMenu()  { mobileMenu.classList.add('open'); hamburger.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMobileMenu() { mobileMenu.classList.remove('open'); hamburger.classList.remove('open'); document.body.style.overflow = ''; }

hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu());
mobileClose.addEventListener('click', closeMobileMenu);

let touchStartY = 0;
mobileMenu.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
mobileMenu.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - touchStartY > 60) closeMobileMenu(); }, { passive: true });

// ─── PROJECT CAROUSEL DOTS (mobile) ─────────────────────────────
function initCarousel() {
    const grid = document.querySelector('.projects-grid');
    const hint = document.getElementById('carouselHint');
    if (!grid || !hint) return;
    const cards = grid.querySelectorAll('.project-card');
    if (!cards.length) return;

    hint.innerHTML = '';
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' }));
        hint.appendChild(dot);
    });
    const dots = hint.querySelectorAll('.carousel-dot');
    grid.addEventListener('scroll', () => {
        const activeIndex = Math.round(grid.scrollLeft / (cards[0].offsetWidth + 12));
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    }, { passive: true });
}
if (window.matchMedia('(max-width: 768px)').matches) initCarousel();
window.addEventListener('resize', () => {
    if (window.matchMedia('(max-width: 768px)').matches) initCarousel();
    else document.getElementById('carouselHint').innerHTML = '';
});

// ─── TOAST ──────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, ms = 3200) {
    const t = document.getElementById('toast');
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

// ─── CONFETTI / FALLING TREATS ──────────────────────────────────
function rainEmoji(emojis, count = 34) {
    const layer = document.getElementById('confettiLayer');
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'falling';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.fontSize = (16 + Math.random() * 26) + 'px';
        el.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
        el.style.animationDuration = (2.4 + Math.random() * 2.6) + 's';
        el.style.animationDelay = (Math.random() * 1.4) + 's';
        layer.appendChild(el);
        setTimeout(() => el.remove(), 7000);
    }
}
function confettiBurst(count = 80) {
    const layer = document.getElementById('confettiLayer');
    const colors = ['#FF5C28', '#FFC978', '#3ECF8E', '#F4F1EA', '#D31145'];
    for (let i = 0; i < count; i++) {
        const bit = document.createElement('div');
        bit.className = 'confetti-bit';
        bit.style.left = Math.random() * 100 + 'vw';
        bit.style.background = colors[Math.floor(Math.random() * colors.length)];
        bit.style.setProperty('--spin', (Math.random() * 1080 - 540) + 'deg');
        bit.style.animationDuration = (2 + Math.random() * 2.5) + 's';
        bit.style.animationDelay = (Math.random() * 0.8) + 's';
        layer.appendChild(bit);
        setTimeout(() => bit.remove(), 6000);
    }
}

// ─── EASTER EGG 1 · NESTLÉ BREAK MODE ───────────────────────────
// Trigger: type "nestle" anywhere · terminal command · footer ☕
let nestleBuffer = '';
let breakModeActive = false;

function startBreakMode() {
    if (breakModeActive) return;
    breakModeActive = true;
    document.body.classList.add('nestle-mode');
    document.getElementById('breakMode').classList.add('active');
    rainEmoji(['🍫', '☕', '🥛', '🍪', '🧋'], 44);
    console.log('%cHave a break. 🍫', 'font-size:20px; color:#D31145; font-weight:bold;');
}
function endBreakMode() {
    breakModeActive = false;
    document.getElementById('breakMode').classList.remove('active');
    setTimeout(() => document.body.classList.remove('nestle-mode'), 400);
    showToast('Break\'s over — back to the data mines ⛏️');
}

document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    nestleBuffer = (nestleBuffer + e.key.toLowerCase()).slice(-6);
    if (nestleBuffer === 'nestle') startBreakMode();
});

// ─── EASTER EGG 2 · KONAMI ARCADE MODE ──────────────────────────
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiPos = 0;
document.addEventListener('keydown', e => {
    konamiPos = (e.key === konami[konamiPos]) ? konamiPos + 1 : (e.key === konami[0] ? 1 : 0);
    if (konamiPos === konami.length) {
        konamiPos = 0;
        const on = document.body.classList.toggle('arcade-mode');
        showToast(on ? '🕹️ ARCADE MODE — 30 lives granted. Terminal Alien Shooter vibes.' : 'Arcade mode off. Insert coin to continue.');
        if (on) confettiBurst(60);
    }
});

// ─── EASTER EGG 3 · LOGO TRIPLE-CLICK PARTY ─────────────────────
let logoClicks = 0, logoClickTimer;
document.getElementById('navLogo').addEventListener('click', e => {
    logoClicks++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClicks = 0; }, 600);
    if (logoClicks >= 3) {
        e.preventDefault();
        logoClicks = 0;
        confettiBurst(110);
        showToast('🎉 You found the party. Hire this man.');
    }
});

// ─── EASTER EGG 4 · CONSOLE MESSAGE (for devs & recruiters) ─────
console.log(
    '%cKO.%c\n\nHi, curious one. 👋\n' +
    'You just earned +10 recruiter points for checking the console.\n\n' +
    'Try these on the page:\n' +
    '  · press `  → terminal\n' +
    '  · type "nestle"  → have a break\n' +
    '  · ↑↑↓↓←→←→BA  → arcade mode\n' +
    '  · triple-click the logo  → party\n\n' +
    'Let\'s talk: karlandreiordinario@gmail.com',
    'font-family:monospace; font-size:28px; font-weight:bold; color:#FF5C28;',
    'font-family:monospace; font-size:12px; color:#9C9A94;'
);

// ─── TERMINAL ───────────────────────────────────────────────────
const terminal = document.getElementById('terminal');
const terminalFab = document.getElementById('terminalFab');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const termBody = document.getElementById('term-body');

function toggleTerminal() {
    terminal.classList.toggle('terminal-hidden');
    const open = !terminal.classList.contains('terminal-hidden');
    terminalFab.style.opacity = open ? '0' : '1';
    terminalFab.style.pointerEvents = open ? 'none' : 'auto';
    if (open) setTimeout(() => termInput.focus(), 120);
}

document.addEventListener('keydown', e => {
    if (e.key === '`' && e.target.tagName !== 'INPUT') { e.preventDefault(); toggleTerminal(); }
    if (e.key === 'Escape' && !terminal.classList.contains('terminal-hidden')) toggleTerminal();
});

termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { const v = this.value.trim().toLowerCase(); if (v) processCommand(v); this.value = ''; }
});

function processCommand(cmd) {
    const line = document.createElement('div');
    line.innerHTML = `<span class="prompt">ko@portfolio:~$</span> <span class="term-white">${cmd.replace(/</g, '&lt;')}</span>`;
    termOutput.appendChild(line);

    const response = document.createElement('div');
    response.style.marginBottom = '12px';
    response.style.color = 'var(--muted)';

    const commands = {
        'help': `Available commands:<br>&nbsp;· <span class="term-white">about</span> &nbsp;&nbsp;&nbsp;— who I am<br>&nbsp;· <span class="term-white">stack</span> &nbsp;&nbsp;&nbsp;— tech stack<br>&nbsp;· <span class="term-white">projects</span> — my work<br>&nbsp;· <span class="term-white">internship</span> — current role<br>&nbsp;· <span class="term-white">contact</span> &nbsp;&nbsp;— reach me<br>&nbsp;· <span class="term-white">github</span> &nbsp;&nbsp;&nbsp;— open GitHub<br>&nbsp;· <span class="term-white">hire</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— why me<br>&nbsp;· <span class="term-white">clear</span> &nbsp;&nbsp;&nbsp;— clear terminal<br>&nbsp;· <span class="term-white">exit</span> &nbsp;&nbsp;&nbsp;&nbsp;— close terminal<br><span style="color:var(--faint)">...and a few undocumented ones. Explore.</span>`,
        'about': `Karl Andrei Ordinario. 4th year CS @ DLSU Manila.<br>Data analyst · Software engineer · ML practitioner.<br>Shopper Insights Analytics Intern @ Nestlé PH (thru Aug '26).<br>Graduating February 2027. Open to what's next.`,
        'stack': `Languages: Python · Java · C · JavaScript · SQL · Go<br>Data: Power BI · Advanced Excel · Pandas · NumPy · scikit-learn<br>Web: React · Express · Next.js · HTML/CSS<br>Backend: Spring Boot · Supabase · MongoDB · MySQL`,
        'projects': `10 projects built. Highlights:<br>&nbsp;· Steam Analytics Dashboard (SQL, Supabase, OLAP)<br>&nbsp;· Smart Inventory System (Spring Boot, ACID, FEFO)<br>&nbsp;· Income Classification ML (KNN, 84% accuracy)<br>&nbsp;· The Watchmen Discord Bot (Python, automation)<br>&nbsp;· Legal Contract Chatbot (Python, Qdrant, LLMs — in dev)<br><span class="term-hl">Scroll up to see all 10 ↑</span>`,
        'internship': `Nestlé Philippines — Shopper Insights Analytics Intern<br>Apr 2026 – Aug 2026<br>Synthesizing Kantar/Nielsen/PSA data into commercial<br>insights for one of the world's largest FMCG companies.<br>Leading the team's migration from Excel to Power BI.<br>Open to what's next starting September 2026.`,
        'contact': `Email: <a href="mailto:karlandreiordinario@gmail.com" style="color:var(--mint)">karlandreiordinario@gmail.com</a><br>LinkedIn: <a href="https://linkedin.com/in/karlordinario" target="_blank" style="color:var(--honey)">linkedin.com/in/karlordinario</a><br>GitHub: <a href="https://github.com/karlOrdinario" target="_blank" style="color:var(--honey)">github.com/karlOrdinario</a>`,
        'hire': `Reasons to hire Karl:<br>&nbsp;1. Turns messy multi-source data into decisions (proven at Nestlé)<br>&nbsp;2. Ships full-stack — Spring Boot to React to SQL<br>&nbsp;3. Led 6 org roles: partnerships, ₱300K+ sponsorships, teams<br>&nbsp;4. Learns fast, owns outcomes, shows up<br><span class="term-hl">→ karlandreiordinario@gmail.com</span>`,
        'sudo': `Nice try. This incident will be reported. 📋`,
        'sudo hire karl': `Permission granted. ✅ Drafting offer letter...`,
        'ls': `about/&nbsp;&nbsp; skills/&nbsp;&nbsp; projects/&nbsp;&nbsp; experience/&nbsp;&nbsp; contact/&nbsp;&nbsp; <span style="color:var(--faint)">.secrets/</span>`,
        'ls .secrets': `nestle.egg&nbsp;&nbsp; konami.egg&nbsp;&nbsp; party.egg&nbsp;&nbsp; <span style="color:var(--faint)">try harder ;)</span>`,
        'whoami': `karl — data analyst, software engineer, org leader.`,
        'pwd': `/home/karl/portfolio`,
        'date': new Date().toDateString(),
        'hi': `Hello! Type <span class="term-white">'help'</span> to get started.`,
        'hello': `Hey! Type <span class="term-white">'help'</span> to get started.`,
        'coffee': `☕ Brewing... [████████████] 100%<br>Fun fact: I ran on Nescafé for an entire internship.`,
        'milo': `🥛 MILO® energy detected. Champion mode enabled.`,
        'kitkat': `Have a break... you know the rest. Try typing <span class="term-white">nestle</span> outside the terminal.`,
        'vim': `You're now stuck in vim. Just kidding — but imagine.`,
        'rm -rf /': `Wow. On my own portfolio? Rude. ❌ Permission denied.`,
        '42': `The answer to life, the universe, and everything. Correct.`,
    };

    if (cmd === 'clear') { termOutput.innerHTML = ''; return; }
    else if (cmd === 'exit') { toggleTerminal(); return; }
    else if (cmd === 'github') { window.open('https://github.com/karlOrdinario', '_blank'); response.innerHTML = `Opening GitHub... <span style="color:var(--mint)">✓</span>`; }
    else if (cmd === 'nestle' || cmd === 'nestlé') { response.innerHTML = `🍫 Unwrapping...`; setTimeout(startBreakMode, 500); }
    else if (cmd === 'party') { confettiBurst(110); response.innerHTML = `🎉 Party protocol initiated.`; }
    else if (cmd === 'matrix') { response.innerHTML = `Wake up, recruiter... follow the white rabbit. 🐇`; document.body.classList.add('arcade-mode'); setTimeout(() => document.body.classList.remove('arcade-mode'), 5000); }
    else if (commands[cmd]) { response.innerHTML = commands[cmd]; }
    else { response.innerHTML = `<span style="color:#ff6b6b">Command not found:</span> ${cmd.replace(/</g, '&lt;')}. Type <span class="term-white">'help'</span> for options.`; }

    termOutput.appendChild(response);
    termBody.scrollTop = termBody.scrollHeight;
}
