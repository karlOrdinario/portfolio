// ─── FOOTER YEAR ───────────────────────────────────────────────
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ─── CUSTOM CURSOR (desktop only) ──────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function animRing() {
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a, button, .project-card, .skill-tag, .wwm-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '16px'; cursor.style.height = '16px';
            ring.style.width = '50px'; ring.style.height = '50px'; ring.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '10px'; cursor.style.height = '10px';
            ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '0.5';
        });
    });
}

// ─── SCROLL REVEAL ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), 80 * i);
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── NAV ACTIVE STATE ──────────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.style.color = link.getAttribute('href') === '#' + entry.target.id
                    ? 'var(--accent-gold)' : '';
            });
        }
    });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ─── MOBILE HAMBURGER MENU ─────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileMenuClose');

function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
}
hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});
mobileClose.addEventListener('click', closeMobileMenu);

let touchStartY = 0;
mobileMenu.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; });
mobileMenu.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - touchStartY > 60) closeMobileMenu();
});

// ─── TECH BOT EYE TRACKING ─────────────────────────────────────
const botPupils = document.querySelectorAll('.visor-pupil');
if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', e => {
        botPupils.forEach(pupil => {
            const eye = pupil.parentElement;
            const rect = eye.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
            const dist = Math.min(2.5, Math.hypot(e.clientX - cx, e.clientY - cy) / 10);
            pupil.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
        });
    });
}

// ─── TERMINAL ──────────────────────────────────────────────────
const terminal = document.getElementById('terminal');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const termBody = document.getElementById('term-body');
const botContainer = document.querySelector('.tech-bot-container');

function toggleTerminal() {
    terminal.classList.toggle('terminal-hidden');
    if (!terminal.classList.contains('terminal-hidden')) {
        botContainer.style.opacity = '0';
        botContainer.style.pointerEvents = 'none';
        setTimeout(() => termInput.focus(), 100);
    } else {
        botContainer.style.opacity = '1';
        botContainer.style.pointerEvents = 'auto';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === '`') { e.preventDefault(); toggleTerminal(); }
    if (e.key === 'Escape' && !terminal.classList.contains('terminal-hidden')) toggleTerminal();
});

termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const val = this.value.trim().toLowerCase();
        if (val) processCommand(val);
        this.value = '';
    }
});

function processCommand(cmd) {
    const line = document.createElement('div');
    line.innerHTML = `<span class="prompt">ko@portfolio:~$</span> <span style="color:var(--white)">${cmd}</span>`;
    termOutput.appendChild(line);

    const response = document.createElement('div');
    response.style.marginBottom = '12px';
    response.style.color = 'var(--muted)';

    const commands = {
        'help': `Available commands:<br>&nbsp;· <span style="color:var(--white)">about</span> &nbsp;&nbsp;&nbsp;— who I am<br>&nbsp;· <span style="color:var(--white)">stack</span> &nbsp;&nbsp;&nbsp;— tech stack<br>&nbsp;· <span style="color:var(--white)">projects</span> &nbsp;— my work<br>&nbsp;· <span style="color:var(--white)">contact</span> &nbsp;&nbsp;— reach me<br>&nbsp;· <span style="color:var(--white)">github</span> &nbsp;&nbsp;&nbsp;— open GitHub<br>&nbsp;· <span style="color:var(--white)">clear</span> &nbsp;&nbsp;&nbsp;— clear terminal<br>&nbsp;· <span style="color:var(--white)">exit</span> &nbsp;&nbsp;&nbsp;&nbsp;— close terminal`,
        'about': `Karl Andrei Ordinario. 4th year CS @ DLSU Manila.<br>Full-stack dev · Data engineer · ML practitioner.<br>Graduating October 2026. Open to internships now.`,
        'stack': `Languages: Python · Java · C · JavaScript · SQL · Go<br>Web: React · Express · Next.js · HTML/CSS<br>Backend: Spring Boot · Supabase · MongoDB · MySQL<br>ML: scikit-learn · Pandas · NumPy · Matplotlib<br>Tools: Git · AWS · Vercel · Figma`,
        'projects': `10 projects built. Highlights:<br>&nbsp;· Steam Analytics Dashboard (SQL, Supabase, OLAP)<br>&nbsp;· Smart Inventory System (Spring Boot, ACID, FEFO)<br>&nbsp;· Income Classification ML (KNN, 84% accuracy)<br>&nbsp;· The Watchmen Discord Bot (Python, automation)<br>&nbsp;· Legal Contract Chatbot (Python, Qdrant, LLMs — in dev)<br><span style="color:var(--accent-blue)">Scroll up to see all 10 ↑</span>`,
        'contact': `Email: <a href="mailto:karlandreiordinario@gmail.com" style="color:var(--accent-green)">karlandreiordinario@gmail.com</a><br>LinkedIn: <a href="https://linkedin.com/in/karlordinario" target="_blank" style="color:var(--accent-blue)">linkedin.com/in/karlordinario</a><br>GitHub: <a href="https://github.com/karlOrdinario" target="_blank" style="color:var(--accent-blue)">github.com/karlOrdinario</a>`,
        'sudo': `Nice try. This incident will be reported.`,
        'ls': `about/&nbsp;&nbsp; skills/&nbsp;&nbsp; projects/&nbsp;&nbsp; experience/&nbsp;&nbsp; contact/`,
        'whoami': `karl — software engineer, data nerd, org leader.`,
        'date': new Date().toDateString(),
        'pwd': `/home/karl/portfolio`,
        'hi': `Hello! Type <span style="color:var(--white)">'help'</span> to get started.`,
        'hello': `Hey! Type <span style="color:var(--white)">'help'</span> to get started.`,
    };

    if (cmd === 'clear') { termOutput.innerHTML = ''; return; }
    else if (cmd === 'exit') { toggleTerminal(); return; }
    else if (cmd === 'github') {
        window.open('https://github.com/karlOrdinario', '_blank');
        response.innerHTML = `Opening GitHub... <span style="color:var(--accent-green)">✓</span>`;
    } else if (commands[cmd] !== undefined) {
        response.innerHTML = commands[cmd];
    } else {
        response.innerHTML = `<span style="color:#ff6b6b">Command not found:</span> ${cmd}. Type <span style="color:var(--white)">'help'</span> for options.`;
    }

    termOutput.appendChild(response);
    termBody.scrollTop = termBody.scrollHeight;
}

// ─── MAGNETIC BUTTONS (desktop only) ───────────────────────────
if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-resume, .wwm-cta').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            btn.style.transform = `translate(${(e.clientX - rect.left - rect.width/2)*0.3}px, ${(e.clientY - rect.top - rect.height/2)*0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}