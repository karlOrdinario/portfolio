// ═══════════════════════════════════════════════════════════════
// KO. portfolio v3 — theme, navigation, live simulation & easter eggs
// ═══════════════════════════════════════════════════════════════

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── FOOTER YEAR ────────────────────────────────────────────────
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ─── TIME-OF-DAY GREETING (subtle) ──────────────────────────────
(function greeting() {
    const h = new Date().getHours();
    const el = document.getElementById('heroGreeting');
    const base = el.textContent;
    const day = h < 5 ? 'Burning the midnight oil? Same.' :
                h < 12 ? 'Good morning.' :
                h < 18 ? 'Good afternoon.' : 'Good evening.';
    el.textContent = `${day} ${base}`;
})();

// ─── THEME ──────────────────────────────────────────────────────
// Default: light from 06:00 to 18:00 by the visitor's clock, dark otherwise.
// A manual choice wins for the rest of the visit.
const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themeByClock = () => { const h = new Date().getHours(); return (h >= 6 && h < 18) ? 'light' : 'dark'; };
const currentTheme = () => root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
let themeChosenByVisitor = false;
try { themeChosenByVisitor = ['light', 'dark'].includes(sessionStorage.getItem('ko-theme')); } catch (e) {}

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0F1113' : '#F5F3EC');
}
applyTheme(currentTheme());

// Animated switch: the new theme opens as a circle from the toggle, like a sunrise or sunset.
function switchTheme(next) {
    if (next === currentTheme()) return;
    themeToggle.classList.add('is-turning');
    setTimeout(() => themeToggle.classList.remove('is-turning'), 700);

    if (prefersReducedMotion) { applyTheme(next); return; }
    if (!document.startViewTransition) {
        root.classList.add('theme-fade');
        applyTheme(next);
        setTimeout(() => root.classList.remove('theme-fade'), 500);
        return;
    }
    const r = themeToggle.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready.then(() => {
        root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
    }).catch(() => {});
}

themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeChosenByVisitor = true;
    try { sessionStorage.setItem('ko-theme', next); } catch (e) { /* private mode: the choice just won't persist */ }
    switchTheme(next);
});

// If the page stays open across sunrise or sunset, follow the clock (unless the visitor chose).
setInterval(() => { if (!themeChosenByVisitor && !document.hidden) switchTheme(themeByClock()); }, 60000);

// ─── BACKDROP · TERRAIN CONTOURS ────────────────────────────────
// Drawn once per width. Rings are coloured by height: green at the foot,
// through teal, to blue at the summit — the same sweep as the accent gradient.
(function contours() {
    const svg = document.getElementById('contours');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    let drawnWidth = 0;

    function draw() {
        const W = window.innerWidth, H = window.innerHeight;
        if (Math.abs(W - drawnWidth) < 40) return;   // ignore mobile address-bar resizes
        drawnWidth = W;
        let seed = 11;
        const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        const unit = Math.max(22, Math.min(W, H) / 26);
        const hills = [[W * 0.86, H * 0.14, 15], [W * 0.10, H * 0.88, 13], [W * 0.52, H * 1.10, 9]];
        const lerp = (a, b, t) => Math.round(a + (b - a) * t);
        let out = '';
        hills.forEach(([cx, cy, rings]) => {
            const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
            for (let k = 1; k <= rings; k++) {
                const r = k * unit;
                let d = '';
                for (let a = 0; a <= 360; a += 5) {
                    const t = a * Math.PI / 180;
                    const rr = r * (1 + 0.16 * Math.sin(3 * t + ph[0]) + 0.10 * Math.sin(5 * t + ph[1] + k * 0.25) + 0.06 * Math.sin(2 * t + ph[2]));
                    d += (a ? 'L' : 'M') + (cx + rr * Math.cos(t)).toFixed(1) + ' ' + (cy + rr * Math.sin(t) * 0.82).toFixed(1);
                }
                const u = 1 - k / rings;   // 0 at the foot, 1 at the summit
                const c = u < 0.5
                    ? [lerp(4, 14, u * 2), lerp(120, 116, u * 2), lerp(87, 144, u * 2)]
                    : [lerp(14, 29, (u - 0.5) * 2), lerp(116, 78, (u - 0.5) * 2), lerp(144, 216, (u - 0.5) * 2)];
                const major = k % 4 === 0;
                out += `<path d="${d}Z" fill="none" stroke="rgb(${c})" stroke-width="${major ? 1.4 : 0.9}" stroke-opacity="${major ? 0.36 : 0.2}"/>`;
            }
        });
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.innerHTML = out;
    }
    draw();
    window.addEventListener('resize', draw);
})();

// ─── NAV ACTIVE STATE ───────────────────────────────────────────
const navLinks = document.querySelectorAll('.nav a');
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
            const on = link.getAttribute('href') === '#' + entry.target.id;
            link.classList.toggle('active', on);
            if (on) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-35% 0px -60% 0px' });
document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));

// ─── MOBILE MENU ────────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const pageRegions = [document.getElementById('main'), document.querySelector('.site-footer'), document.getElementById('terminalFab')];

function openMobileMenu() {
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    pageRegions.forEach(el => el.setAttribute('inert', ''));
}
function closeMobileMenu(returnFocus) {
    if (mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    pageRegions.forEach(el => el.removeAttribute('inert'));
    if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => mobileMenu.hidden ? openMobileMenu() : closeMobileMenu(true));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMobileMenu(false)));
window.matchMedia('(min-width: 860px)').addEventListener('change', e => { if (e.matches) closeMobileMenu(false); });

// ─── SCROLL PROGRESS ────────────────────────────────────────────
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

// ─── PROJECT CAROUSELS ──────────────────────────────────────────
// On wide screens the track is a plain grid and none of this is visible.
// On phones it becomes a swipeable, scroll-snapping row with buttons.
const carousels = [...document.querySelectorAll('[data-carousel]')].map(el => {
    const track = el.querySelector('.carousel-track');
    const prev = el.querySelector('[data-prev]'), next = el.querySelector('[data-next]');
    const dots = el.querySelector('[data-dots]'), count = el.querySelector('[data-count]');
    let index = 0, ticking = false;

    const slides = () => [...track.querySelectorAll('[data-slide]')].filter(c => !c.hidden);
    const scrollable = () => track.scrollWidth > track.clientWidth + 4;
    const offsetOf = slide => slide.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0);

    function render() {
        const list = slides();
        index = Math.min(index, Math.max(0, list.length - 1));
        dots.innerHTML = list.map((_, i) => `<i${i === index ? ' class="is-on"' : ''}></i>`).join('');
        count.textContent = list.length ? `${index + 1} of ${list.length}` : '';
        prev.disabled = index === 0;
        next.disabled = index >= list.length - 1;
        // only a scrolling track needs to be a keyboard stop
        if (scrollable()) track.setAttribute('tabindex', '0'); else track.removeAttribute('tabindex');
    }
    function sync() {
        ticking = false;
        const list = slides();
        if (!list.length) return;
        let best = 0, bestDist = Infinity;
        list.forEach((slide, i) => {
            const d = Math.abs(offsetOf(slide) - track.scrollLeft);
            if (d < bestDist) { bestDist = d; best = i; }
        });
        // the last card can never reach the left edge, so treat the scroll end as "last"
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = list.length - 1;
        if (best !== index) { index = best; render(); }
    }
    function go(step) {
        const list = slides();
        const target = list[Math.max(0, Math.min(list.length - 1, index + step))];
        if (target) track.scrollTo({ left: offsetOf(target), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    track.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    window.addEventListener('resize', render);
    render();
    return { el, track, reset() { index = 0; track.scrollLeft = 0; render(); } };
});

// Evidence panels: always open on wide screens, tucked behind a tap on phones
// so each carousel card stays about one screen tall.
(function evidencePanels() {
    const panels = document.querySelectorAll('.evidence-wrap');
    const phone = window.matchMedia('(max-width: 759px)');
    const apply = () => panels.forEach(d => { d.open = !phone.matches; });
    phone.addEventListener('change', apply);
    apply();
})();

// ─── PROJECT FILTERS ────────────────────────────────────────────
(function projectFilters() {
    const buttons = document.querySelectorAll('.chip-btn[data-filter]');
    const cards = document.querySelectorAll('.pcard[data-cat]');
    const status = document.getElementById('filterStatus');
    const moreCarousel = carousels.find(c => c.el.classList.contains('carousel-more'));

    buttons.forEach(btn => btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        let shown = 0;
        cards.forEach(card => {
            const match = filter === 'all' || card.dataset.cat === filter;
            card.hidden = !match;
            if (match) shown++;
        });
        status.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}: ${btn.textContent.trim()}.`;
        if (moreCarousel) moreCarousel.reset();
    }));
})();

// ─── HERO · LIVE MONTE CARLO ────────────────────────────────────
// Simulates geometric Brownian motion paths, prices a European call from
// them, and checks the answer against the Black–Scholes closed form.
const sim = (function heroSim() {
    const canvas = document.getElementById('simCanvas');
    const ctx = canvas.getContext('2d');
    const outMc = document.getElementById('simMc');
    const outBs = document.getElementById('simBs');
    const outVerdict = document.getElementById('simVerdict');
    const rerun = document.getElementById('simRerun');

    const N = 2000, STEPS = 120, DRAWN = 30;
    const S0 = 100, K = 100, R = 0.05, SIGMA = 0.2, T = 1;
    let state = null, raf = 0, progress = 1;

    function randn() {
        let u = 0;
        while (u === 0) u = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
    }
    function normCdf(x) {
        // Abramowitz & Stegun 7.1.26
        const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
        const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
        return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
    }
    function blackScholesCall() {
        const d1 = (Math.log(S0 / K) + (R + SIGMA * SIGMA / 2) * T) / (SIGMA * Math.sqrt(T));
        const d2 = d1 - SIGMA * Math.sqrt(T);
        return S0 * normCdf(d1) - K * Math.exp(-R * T) * normCdf(d2);
    }

    function simulate() {
        const cols = STEPS + 1;
        const paths = new Float32Array(N * cols);
        const dt = T / STEPS;
        const drift = (R - SIGMA * SIGMA / 2) * dt;
        const vol = SIGMA * Math.sqrt(dt);
        const disc = Math.exp(-R * T);
        let sum = 0, sumSq = 0;

        for (let i = 0; i < N; i++) {
            let s = S0;
            paths[i * cols] = s;
            for (let j = 1; j < cols; j++) {
                s *= Math.exp(drift + vol * randn());
                paths[i * cols + j] = s;
            }
            const payoff = disc * Math.max(s - K, 0);
            sum += payoff; sumSq += payoff * payoff;
        }
        const mean = sum / N;
        const se = Math.sqrt((sumSq - N * mean * mean) / (N - 1) / N);

        const p5 = new Float32Array(cols), p50 = new Float32Array(cols), p95 = new Float32Array(cols);
        const col = new Float32Array(N);
        const at = q => col[Math.floor(q * (N - 1))];
        let lo = S0, hi = S0;
        for (let j = 0; j < cols; j++) {
            for (let i = 0; i < N; i++) col[i] = paths[i * cols + j];
            col.sort();
            p5[j] = at(0.05); p50[j] = at(0.5); p95[j] = at(0.95);
            if (j === cols - 1) { lo = at(0.01); hi = at(0.99); }
        }
        return { paths, cols, p5, p50, p95, lo, hi, mean, se };
    }

    function draw() {
        if (!state) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = rect.width, h = rect.height;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const css = getComputedStyle(root);
        const color = name => css.getPropertyValue(name).trim();
        const accent = color('--accent'), faint = color('--text-3'), mid = color('--text-2'), soft = color('--accent-soft');

        const padX = 10, padTop = 26, padBottom = 12;
        const { paths, cols, p5, p50, p95, lo, hi } = state;
        const x = j => padX + (j / STEPS) * (w - 2 * padX);
        const y = v => h - padBottom - ((v - lo) / (hi - lo)) * (h - padTop - padBottom);
        const last = Math.max(1, Math.round(progress * STEPS));

        // strike
        ctx.save();
        ctx.setLineDash([4, 4]); ctx.strokeStyle = mid; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padX, y(K)); ctx.lineTo(w - padX, y(K)); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, x(last) + 1, h); ctx.clip();

        // band holding 90% of paths
        ctx.fillStyle = soft;
        ctx.beginPath();
        ctx.moveTo(x(0), y(p95[0]));
        for (let j = 1; j <= last; j++) ctx.lineTo(x(j), y(p95[j]));
        for (let j = last; j >= 0; j--) ctx.lineTo(x(j), y(p5[j]));
        ctx.closePath(); ctx.fill();

        // a sample of individual paths
        ctx.strokeStyle = faint; ctx.lineWidth = 1; ctx.globalAlpha = 0.26;
        for (let i = 0; i < DRAWN; i++) {
            ctx.beginPath();
            ctx.moveTo(x(0), y(paths[i * cols]));
            for (let j = 1; j <= last; j++) ctx.lineTo(x(j), y(paths[i * cols + j]));
            ctx.stroke();
        }

        // median
        ctx.globalAlpha = 1; ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x(0), y(p50[0]));
        for (let j = 1; j <= last; j++) ctx.lineTo(x(j), y(p50[j]));
        ctx.stroke();
        ctx.restore();

        // legend
        ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
        ctx.textBaseline = 'middle';
        let lx = padX;
        ctx.strokeStyle = accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, 13); ctx.lineTo(lx + 14, 13); ctx.stroke();
        ctx.fillStyle = mid; ctx.fillText('median', lx + 20, 13);
        lx += 20 + ctx.measureText('median').width + 14;
        ctx.fillStyle = soft; ctx.fillRect(lx, 8, 14, 10);
        ctx.fillStyle = mid; ctx.fillText('90% of paths', lx + 20, 13);
        lx += 20 + ctx.measureText('90% of paths').width + 14;
        if (lx + 90 < w) {
            ctx.save();
            ctx.setLineDash([3, 3]); ctx.strokeStyle = mid; ctx.globalAlpha = 0.7; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(lx, 13); ctx.lineTo(lx + 14, 13); ctx.stroke();
            ctx.restore();
            ctx.fillStyle = mid; ctx.fillText('strike', lx + 20, 13);
        }
    }

    function report() {
        const bs = blackScholesCall();
        const half = 1.96 * state.se;
        outMc.innerHTML = `${state.mean.toFixed(2)} <small>± ${half.toFixed(2)}</small>`;
        outBs.textContent = bs.toFixed(2);
        const inside = Math.abs(state.mean - bs) <= half;
        outVerdict.classList.toggle('is-in', inside);
        outVerdict.textContent = inside
            ? 'The exact price falls inside the simulation\'s 95% interval.'
            : 'Outside the 95% interval this time. That should happen about 1 run in 20.';
    }

    function run() {
        cancelAnimationFrame(raf);
        state = simulate();
        if (prefersReducedMotion) { progress = 1; draw(); report(); return; }

        outVerdict.classList.remove('is-in');
        outVerdict.textContent = 'Simulating…';
        outMc.textContent = '…';
        const start = performance.now(), duration = 1500;
        (function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            progress = 1 - Math.pow(1 - t, 3);
            draw();
            if (t < 1) raf = requestAnimationFrame(frame);
            else report();
        })(start);
    }

    rerun.addEventListener('click', run);
    if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(canvas);
    // repaint when the theme or an easter-egg palette changes
    new MutationObserver(() => requestAnimationFrame(draw)).observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

    run();
    return { blackScholesCall, randn, S0, K, R, SIGMA, T };
})();

// ─── TOAST ──────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, ms = 3200) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

// ─── CONFETTI / FALLING TREATS ──────────────────────────────────
function rainEmoji(emojis, count = 34) {
    if (prefersReducedMotion) return;
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
    if (prefersReducedMotion) return;
    const layer = document.getElementById('confettiLayer');
    const colors = ['#34D399', '#FFFFFF', '#60A5FA', '#0E7490', '#D31145'];
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
const breakMode = document.getElementById('breakMode');
const breakClose = document.getElementById('breakClose');
let nestleBuffer = '';
let breakModeActive = false;
let breakReturnFocus = null;

function startBreakMode() {
    if (breakModeActive) return;
    breakModeActive = true;
    breakReturnFocus = document.activeElement;
    root.classList.add('nestle-mode');
    breakMode.hidden = false;
    requestAnimationFrame(() => breakMode.classList.add('active'));
    breakClose.focus();
    rainEmoji(['🍫', '☕', '🥛', '🍪', '🧋'], 44);
    console.log('%cHave a break. 🍫', 'font-size:20px; color:#D31145; font-weight:bold;');
}
function endBreakMode() {
    if (!breakModeActive) return;
    breakModeActive = false;
    breakMode.classList.remove('active');
    setTimeout(() => {
        breakMode.hidden = true;
        root.classList.remove('nestle-mode');
    }, 400);
    if (breakReturnFocus && breakReturnFocus.focus && !breakReturnFocus.closest('[inert]')) breakReturnFocus.focus();
    showToast('Break\'s over. Back to the data mines ⛏️');
}
breakClose.addEventListener('click', endBreakMode);
document.getElementById('footerEgg').addEventListener('click', startBreakMode);
breakMode.addEventListener('keydown', e => { if (e.key === 'Tab') e.preventDefault(); }); // one control: keep focus on it

document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length !== 1) return;
    nestleBuffer = (nestleBuffer + e.key.toLowerCase()).slice(-6);
    if (nestleBuffer === 'nestle') startBreakMode();
});

// ─── EASTER EGG 2 · KONAMI ARCADE MODE ──────────────────────────
// Keyboard: ↑↑↓↓←→←→BA · Touch: swipe ↑↑↓↓←→←→ then tap twice · Terminal: arcade
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiPos = 0;

function toggleArcadeMode() {
    const on = root.classList.toggle('arcade-mode');
    showToast(on ? '🕹️ ARCADE MODE: 30 lives granted. Terminal Alien Shooter vibes.' : 'Arcade mode off. Insert coin to continue.');
    if (on) confettiBurst(60);
    return on;
}
function konamiInput(key) {
    konamiPos = (key === konami[konamiPos]) ? konamiPos + 1 : (key === konami[0] ? 1 : 0);
    if (konamiPos === konami.length) { konamiPos = 0; toggleArcadeMode(); }
}
document.addEventListener('keydown', e => konamiInput(e.key.length === 1 ? e.key.toLowerCase() : e.key));

let touchStart = null;
document.addEventListener('touchstart', e => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });
document.addEventListener('touchend', e => {
    if (!touchStart || e.target.closest('#terminal')) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    touchStart = null;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < 12 && ay < 12) {
        // a tap stands in for B, then A
        if (konamiPos >= 8) konamiInput(konami[konamiPos]); else konamiPos = 0;
    } else if (Math.max(ax, ay) > 36) {
        konamiInput(ax > ay ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
    }
}, { passive: true });

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
    '  · press `  → terminal (or tap >_ on a phone)\n' +
    '  · type "nestle"  → have a break\n' +
    '  · ↑↑↓↓←→←→BA  → arcade mode (on a phone: swipe it, then tap twice)\n' +
    '  · triple-click the logo  → party\n\n' +
    'Let\'s talk: karlandreiordinario@gmail.com',
    'font-family:monospace; font-size:28px; font-weight:bold; color:#34D399;',
    'font-family:monospace; font-size:12px; color:#9C9A94;'
);

// ─── TERMINAL ───────────────────────────────────────────────────
const terminal = document.getElementById('terminal');
const terminalFab = document.getElementById('terminalFab');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const termBody = document.getElementById('term-body');
const RESUME_URL = 'https://drive.google.com/file/d/1dZ0CmoyXoGHk6X1qpaLQZpOAXuYhPi4H/view?usp=drive_link';

function terminalIsOpen() { return !terminal.classList.contains('terminal-hidden'); }
function toggleTerminal() {
    const open = terminal.classList.toggle('terminal-hidden') === false;
    terminalFab.setAttribute('aria-expanded', String(open));
    if (open) {
        terminal.removeAttribute('inert');
        setTimeout(() => termInput.focus(), 120);
    } else {
        terminal.setAttribute('inert', '');
        if (!terminalFab.closest('[inert]') && !terminalFab.hasAttribute('inert')) terminalFab.focus();
    }
}
terminalFab.addEventListener('click', toggleTerminal);
document.getElementById('terminalClose').addEventListener('click', toggleTerminal);
termBody.addEventListener('click', e => { if (!e.target.closest('a') && !window.getSelection().toString()) termInput.focus(); });

document.addEventListener('keydown', e => {
    if (e.key === '`' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); toggleTerminal(); return; }
    if (e.key !== 'Escape') return;
    if (breakModeActive) endBreakMode();
    else if (terminalIsOpen()) toggleTerminal();
    else closeMobileMenu(true);
});

termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { const v = this.value.trim().toLowerCase(); if (v) processCommand(v); this.value = ''; }
});

// Prices the same call as the hero chart, with more paths, straight in the terminal.
function terminalSimulation() {
    const n = 50000;
    const disc = Math.exp(-sim.R * sim.T);
    const drift = (sim.R - sim.SIGMA * sim.SIGMA / 2) * sim.T, vol = sim.SIGMA * Math.sqrt(sim.T);
    let sum = 0, sumSq = 0;
    for (let i = 0; i < n; i++) {
        const payoff = disc * Math.max(sim.S0 * Math.exp(drift + vol * sim.randn()) - sim.K, 0);
        sum += payoff; sumSq += payoff * payoff;
    }
    const mean = sum / n, half = 1.96 * Math.sqrt((sumSq - n * mean * mean) / (n - 1) / n);
    const bs = sim.blackScholesCall();
    const inside = Math.abs(mean - bs) <= half;
    return `Simulating 50,000 paths... done.<br>Monte Carlo: <span class="term-white">${mean.toFixed(4)} ± ${half.toFixed(4)}</span><br>Black–Scholes: <span class="term-white">${bs.toFixed(4)}</span><br>` +
        (inside ? `<span class="term-ok">✓ inside the 95% interval.</span> mcquant does this for 13 benchmarks.` : `Outside the 95% interval. That's the 1-in-20. Run it again.`);
}

function processCommand(cmd) {
    const line = document.createElement('div');
    const prompt = document.createElement('span');
    prompt.className = 'prompt'; prompt.textContent = 'ko@portfolio:~$';
    const echoed = document.createElement('span');
    echoed.className = 'term-white'; echoed.textContent = ' ' + cmd;
    line.append(prompt, echoed);
    termOutput.appendChild(line);

    const response = document.createElement('div');
    response.className = 'term-response';
    const safeCmd = cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    const commands = {
        'help': `Available commands:<br>&nbsp;· <span class="term-white">about</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;who I am<br>&nbsp;· <span class="term-white">stack</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tech stack<br>&nbsp;· <span class="term-white">projects</span> &nbsp;&nbsp;my work<br>&nbsp;· <span class="term-white">internship</span> Nestlé PH<br>&nbsp;· <span class="term-white">simulate</span> &nbsp;&nbsp;price an option, live<br>&nbsp;· <span class="term-white">contact</span> &nbsp;&nbsp;&nbsp;reach me<br>&nbsp;· <span class="term-white">resume</span> &nbsp;&nbsp;&nbsp;&nbsp;open my resume<br>&nbsp;· <span class="term-white">github</span> &nbsp;&nbsp;&nbsp;&nbsp;open GitHub<br>&nbsp;· <span class="term-white">hire</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;why me<br>&nbsp;· <span class="term-white">clear</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clear terminal<br>&nbsp;· <span class="term-white">exit</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;close terminal<br><span class="term-dim">...and a few undocumented ones. Explore.</span>`,
        'about': `Karl Andrei Ordinario. Final-year CS @ DLSU Manila.<br>Data analyst · software engineer · quant finance builder.<br>Shopper Insights Analytics Intern @ Nestlé PH (Apr–Aug 2026).<br>Graduating February 2027. Open to what's next.`,
        'stack': `Analytics: Power BI (DAX) · Power Query · Advanced Excel · SQL<br>Languages: Python · Java · JavaScript · TypeScript · Go · C<br>Quant: NumPy · SciPy · hmmlearn · PyPortfolioOpt · Streamlit<br>AI: RAG · Gemini · LangChain · Qdrant · RAGAS<br>Cloud: AWS (VPC, EC2, ALB, Auto Scaling, CloudWatch)<br>Web: React · Next.js · Express · Spring Boot · PostgreSQL`,
        'projects': `Highlights:<br>&nbsp;· mcquant: Monte Carlo pricing, risk &amp; valuation (299 tests)<br>&nbsp;· Regime-switching portfolio model (HMM, halved drawdown)<br>&nbsp;· Online Availability Checker (28s → 2.6s per listing)<br>&nbsp;· PhilLexBot: legal contract RAG chatbot (thesis)<br>&nbsp;· Neon Pulse: auto-scaling AWS architecture<br>&nbsp;· Smart Inventory System (Spring Boot, FEFO, ACID)<br><span class="term-hl">Scroll to Work for all 16 ↑</span>`,
        'internship': `Nestlé Philippines · Shopper Insights Analytics Intern<br>Apr 2026 – Aug 2026<br>Built a national pricing business case, presented to 7 sales<br>and brand teams, and prototyped a Power BI model that cut<br>30-minute filters down to seconds.<br>Also built the OLA Checker for another department, unprompted.`,
        'contact': `Email: <a href="mailto:karlandreiordinario@gmail.com">karlandreiordinario@gmail.com</a><br>LinkedIn: <a href="https://linkedin.com/in/karlordinario" target="_blank" rel="noopener">linkedin.com/in/karlordinario</a><br>GitHub: <a href="https://github.com/karlOrdinario" target="_blank" rel="noopener">github.com/karlOrdinario</a>`,
        'hire': `Reasons to hire Karl:<br>&nbsp;1. Turns messy market data into decisions (proven at Nestlé)<br>&nbsp;2. Builds tools that check their own math (see: mcquant)<br>&nbsp;3. Ships: Python, SQL, Spring Boot, AWS, Power BI<br>&nbsp;4. Pitched 50+ companies, closed ₱300K+ in sponsorships<br>&nbsp;5. Learns fast, owns outcomes, shows up<br><span class="term-hl">→ karlandreiordinario@gmail.com</span>`,
        'sudo': `Nice try. This incident will be reported. 📋`,
        'sudo hire karl': `Permission granted. ✅ Drafting offer letter...`,
        'ls': `work/&nbsp;&nbsp; experience/&nbsp;&nbsp; skills/&nbsp;&nbsp; about/&nbsp;&nbsp; contact/&nbsp;&nbsp; <span class="term-dim">.secrets/</span>`,
        'ls .secrets': `nestle.egg&nbsp;&nbsp; konami.egg&nbsp;&nbsp; arcade.egg&nbsp;&nbsp; party.egg&nbsp;&nbsp; <span class="term-dim">try harder ;)</span>`,
        'whoami': `karl: data analyst, software engineer, org leader.`,
        'pwd': `/home/karl/portfolio`,
        'date': new Date().toDateString(),
        'hi': `Hello! Type <span class="term-white">'help'</span> to get started.`,
        'hello': `Hey! Type <span class="term-white">'help'</span> to get started.`,
        'coffee': `☕ Brewing... [████████████] 100%<br>Fun fact: I ran on Nescafé for an entire internship.`,
        'milo': `🥛 MILO® energy detected. Champion mode enabled.`,
        'kitkat': `Have a break... you know the rest. Try typing <span class="term-white">nestle</span>.`,
        'vim': `You're now stuck in vim. Just kidding, but imagine.`,
        'rm -rf /': `Wow. On my own portfolio? Rude. ❌ Permission denied.`,
        '42': `The answer to life, the universe, and everything. Correct.`,
    };

    if (cmd === 'clear') { termOutput.innerHTML = ''; return; }
    else if (cmd === 'exit') { toggleTerminal(); return; }
    else if (cmd === 'github') { window.open('https://github.com/karlOrdinario', '_blank', 'noopener'); response.innerHTML = `Opening GitHub... <span class="term-ok">✓</span>`; }
    else if (cmd === 'resume' || cmd === 'cv') { window.open(RESUME_URL, '_blank', 'noopener'); response.innerHTML = `Opening resume... <span class="term-ok">✓</span>`; }
    else if (cmd === 'simulate' || cmd === 'mc' || cmd === 'mcquant') { response.innerHTML = terminalSimulation(); }
    else if (cmd === 'nestle' || cmd === 'nestlé') { response.innerHTML = `🍫 Unwrapping...`; setTimeout(() => { if (terminalIsOpen()) toggleTerminal(); startBreakMode(); }, 500); }
    else if (cmd === 'party') { confettiBurst(110); response.innerHTML = `🎉 Party protocol initiated.`; }
    else if (cmd === 'arcade' || cmd === 'konami') { response.innerHTML = toggleArcadeMode() ? `🕹️ Arcade mode on. Run it again to switch it off.` : `Arcade mode off.`; }
    else if (cmd === 'matrix') { response.innerHTML = `Wake up, recruiter... follow the white rabbit. 🐇`; root.classList.add('arcade-mode'); setTimeout(() => root.classList.remove('arcade-mode'), 5000); }
    else if (commands[cmd]) { response.innerHTML = commands[cmd]; }
    else { response.innerHTML = `<span class="term-err">Command not found:</span> ${safeCmd}. Type <span class="term-white">'help'</span> for options.`; }

    termOutput.appendChild(response);
    termBody.scrollTop = termBody.scrollHeight;
}
