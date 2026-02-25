// custom cursor logic
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;

if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', e => {
        mx=e.clientX; my=e.clientY;
        cursor.style.left=mx+'px'; cursor.style.top=my+'px';
    });
    (function animRing(){
        rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
        ring.style.left=rx+'px'; ring.style.top=ry+'px';
        requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a,button,.project-card,.skill-tag,.wwm-card').forEach(el=>{
        el.addEventListener('mouseenter',()=>{ cursor.style.width='16px';cursor.style.height='16px';ring.style.width='50px';ring.style.height='50px';ring.style.opacity='1'; });
        el.addEventListener('mouseleave',()=>{ cursor.style.width='10px';cursor.style.height='10px';ring.style.width='36px';ring.style.height='36px';ring.style.opacity='0.5'; });
    });
}

// scroll reveal observer
const observer = new IntersectionObserver(entries=>{
    entries.forEach((entry,i)=>{ if(entry.isIntersecting) setTimeout(()=>entry.target.classList.add('visible'),80*i); });
},{ threshold:0.1, rootMargin:'0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// navigation active state observer
const sections=document.querySelectorAll('section[id]');
const navLinks=document.querySelectorAll('.nav-links a');
new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting) navLinks.forEach(link=>{
            link.style.color=link.getAttribute('href')==='#'+entry.target.id?'var(--accent-gold)':'';
        });
    });
},{threshold:0.4}).observe && sections.forEach(s=>new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) navLinks.forEach(link=>{ link.style.color=link.getAttribute('href')==='#'+entry.target.id?'var(--accent-gold)':''; }); });
},{threshold:0.4}).observe(s));


// tech bot eye tracking logic
const botPupils = document.querySelectorAll('.visor-pupil');
const botContainer = document.querySelector('.tech-bot-container');

if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        botPupils.forEach(pupil => {
            const eye = pupil.parentElement;
            const rect = eye.getBoundingClientRect();

            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
            const distToMouse = Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY);

            const maxDistance = 2.5;
            const distance = Math.min(maxDistance, distToMouse / 10);

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    });
}

// terminal toggle and command processor
const terminal = document.getElementById('terminal');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const termBody = document.getElementById('term-body');

function toggleTerminal() {
    terminal.classList.toggle('terminal-hidden');

    if(!terminal.classList.contains('terminal-hidden')) {
        botContainer.style.opacity = '0';
        botContainer.style.pointerEvents = 'none';
        setTimeout(() => termInput.focus(), 100);
    } else {
        botContainer.style.opacity = '1';
        botContainer.style.pointerEvents = 'auto';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === '`') {
        e.preventDefault();
        toggleTerminal();
    }
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

    switch(cmd) {
        case 'help':
            response.innerHTML = 'Available commands:<br> - <span style="color:var(--white)">about</span>: Who am I?<br> - <span style="color:var(--white)">stack</span>: Tech stack overview<br> - <span style="color:var(--white)">clear</span>: Clear terminal<br> - <span style="color:var(--white)">exit</span>: Close terminal';
            break;
        case 'about':
            response.innerHTML = 'Karl Andrei Ordinario. 4th Year CS Student @ DLSU. Building full-stack systems and data pipelines.';
            break;
        case 'stack':
            response.innerHTML = 'Python, Java, C, GoLang, SQL, React, Spring Boot, Supabase.';
            break;
        case 'clear':
            termOutput.innerHTML = '';
            return;
        case 'exit':
            toggleTerminal();
            return;
        case 'sudo':
            response.innerHTML = 'Nice try. This incident will be reported.';
            break;
        default:
            response.innerHTML = `Command not found: ${cmd}. Type 'help' for options.`;
    }

    termOutput.appendChild(response);
    termBody.scrollTop = termBody.scrollHeight;
}

// magnetic button interaction
if (window.matchMedia("(pointer: fine)").matches) {
    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-resume, .wwm-cta');

    magneticButtons.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}