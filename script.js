// ── Hamburger ──
const hamburger = document.getElementById('hamburger');

// Support both nav IDs used across your pages
const nav = document.getElementById('main-nav') || document.getElementById('headerNav');

if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when any nav link is clicked
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
            nav.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
        }
    });
}

// ── Back to top ──
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('visible', window.scrollY > 400);
    });
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Contact form submit feedback ──
const contactBtn = document.querySelector('.contact-form button');
if (contactBtn) {
    contactBtn.addEventListener('click', function () {
        this.textContent = '✓ Message Sent!';
        this.style.background = '#256025';
        setTimeout(() => {
            this.textContent = 'Send Message';
            this.style.background = '';
        }, 3000);
    });
}

// ── Newsletter submit feedback ──
const newsletterBtn = document.querySelector('.newsletter-form button');
if (newsletterBtn) {
    newsletterBtn.addEventListener('click', function () {
        const input = this.previousElementSibling;
        if (input.value) {
            this.textContent = '✓ Subscribed!';
            input.value = '';
            setTimeout(() => { this.textContent = 'Subscribe'; }, 3000);
        }
    });
}

// ── Blog: Tab Switching ──
function switchTab(section, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + section).classList.add('active');
    document.querySelector('.tabs-wrap').scrollIntoView({ behavior: 'smooth' });
}

// ── Apply buttons ──
document.querySelectorAll('.btn-apply').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Application form coming soon! Please send your CV to careers@bbqflame.com');
    });
});

// ── Ember particles ──
const emb = document.getElementById('embers');
if (emb) {
    for (let i = 0; i < 20; i++) {
        const e = document.createElement('div');
        e.className = 'ember';
        e.style.cssText = `
            left:${Math.random() * 100}%;
            width:${2 + Math.random() * 3}px;
            height:${2 + Math.random() * 3}px;
            background:${Math.random() > .5 ? '#7ed957' : '#e74c3c'};
            --dur:${4 + Math.random() * 6}s;
            --delay:${Math.random() * 8}s;
            --drift:${(Math.random() - .5) * 70}px;
        `;
        emb.appendChild(e);
    }
}

// ── Set min date to today ──
const resDate = document.getElementById('resDate');
if (resDate) {
    const today = new Date().toISOString().split('T')[0];
    resDate.min = today;
}

// ── State ──
let guestCount       = 2;
let selectedTime     = '';
let selectedOccasion = 'casual';
let selectedAddons   = [];
let currentStep      = 1;

function changeGuests(d) {
    guestCount = Math.max(1, Math.min(50, guestCount + d));
    document.getElementById('guestVal').textContent = guestCount;
    updateSummary();
}

function selectChip(el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('sel-chip'));
    el.classList.add('sel-chip');
    selectedOccasion = el.dataset.val;
    updateSummary();
}

function selectTime(el) {
    if (el.classList.contains('unavailable')) return;
    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedTime = el.dataset.time;
    updateSummary();
}

function toggleAddon(card) {
    card.classList.toggle('sel-addon');
    const name  = card.dataset.name;
    const price = parseInt(card.dataset.price);
    if (card.classList.contains('sel-addon')) {
        selectedAddons.push({ name, price });
    } else {
        selectedAddons = selectedAddons.filter(a => a.name !== name);
    }
    updateSummary();
}

function updateSummary() {
    const fname      = document.getElementById('fname')?.value.trim();
    const lname      = document.getElementById('lname')?.value.trim();
    const name       = (fname || lname) ? `${fname} ${lname}`.trim() : null;
    const date       = document.getElementById('resDate')?.value;
    const seating    = document.getElementById('seating');
    const seatingText = seating?.options[seating.selectedIndex]?.text || '';

    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    set('sum-name',     name    ? `<span>${name}</span>`             : '<em class="empty">—</em>');
    set('sum-guests',   `${guestCount} guest${guestCount > 1 ? 's' : ''}`);
    set('sum-occasion', selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1));
    set('sum-date',     date    ? `<span>${formatDate(date)}</span>` : '<em class="empty">—</em>');
    set('sum-time',     selectedTime ? `<span>${formatTime(selectedTime)}</span>` : '<em class="empty">—</em>');
    set('sum-seating',  seatingText && seatingText !== 'Choose a section…'
        ? `<span>${seatingText.split('—')[0].trim()}</span>` : '<em class="empty">—</em>');
    set('sum-addons',   selectedAddons.length
        ? selectedAddons.map(a => `<div>${a.name}</div>`).join('')
        : '<em class="empty">None</em>');

    const total = selectedAddons.reduce((s, a) => s + a.price, 0);
    set('sum-total', `₦${total.toLocaleString()}`);
}

function formatDate(d) {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(t) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function goStep(n) {
    if (n > currentStep && !validateStep(currentStep)) return;
    currentStep = n;

    document.querySelectorAll('.form-panel').forEach((p, i) => p.classList.toggle('active', i === n - 1));

    for (let i = 1; i <= 4; i++) {
        const s  = document.getElementById('s' + i);
        const sn = document.getElementById('sn' + i);
        s.classList.remove('active', 'done');
        if (i < n)        { s.classList.add('done');   sn.textContent = '✓'; }
        else if (i === n) { s.classList.add('active'); sn.textContent = i;  }
        else               { sn.textContent = i; }
    }

    if (n === 4) buildReview();
    updateSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    let ok = true;
    const show = (id, v) => document.getElementById(id)?.classList.toggle('show', v);
    const mark = (id, v) => document.getElementById(id)?.classList.toggle('has-error', v);

    if (step === 1) {
        const fname = document.getElementById('fname')?.value.trim();
        const lname = document.getElementById('lname')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();

        const fv = !!fname; show('e-fname', !fv); mark('fname', !fv); if (!fv) ok = false;
        const lv = !!lname; show('e-lname', !lv); mark('lname', !lv); if (!lv) ok = false;
        const ev = !!email && /^[^@]+@[^@]+\.[^@]+$/.test(email);
        show('e-email', !ev); mark('email', !ev); if (!ev) ok = false;
        const pv = !!phone; show('e-phone', !pv); mark('phone', !pv); if (!pv) ok = false;
    }

    if (step === 2) {
        const date    = document.getElementById('resDate')?.value;
        const seating = document.getElementById('seating')?.value;
        if (!date)         { show('e-date',    true);  mark('resDate', true);  ok = false; }
        else               { show('e-date',    false); mark('resDate', false); }
        if (!seating)      { show('e-seating', true);  mark('seating', true);  ok = false; }
        else               { show('e-seating', false); mark('seating', false); }
        if (!selectedTime) { show('e-time', true);  ok = false; }
        else               { show('e-time', false); }
    }

    return ok;
}

function buildReview() {
    const date    = document.getElementById('resDate')?.value;
    const seating = document.getElementById('seating');
    const dur     = document.getElementById('duration');
    const dietary = document.getElementById('dietary');
    const notes   = document.getElementById('notes')?.value;
    const fname   = document.getElementById('fname')?.value.trim();
    const lname   = document.getElementById('lname')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const phone   = document.getElementById('phone')?.value.trim();

    const rows = [
        ['Guest',    `${fname} ${lname}`],
        ['Email',    email],
        ['Phone',    phone],
        ['Guests',   `${guestCount} guest${guestCount > 1 ? 's' : ''}`],
        ['Occasion', selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)],
        ['Date',     date ? formatDate(date) : '—'],
        ['Time',     selectedTime ? formatTime(selectedTime) : '—'],
        ['Duration', dur?.options[dur.selectedIndex]?.text || ''],
        ['Seating',  seating?.options[seating.selectedIndex]?.text || ''],
        ['Dietary',  dietary?.options[dietary.selectedIndex]?.text || ''],
        ['Add-ons',  selectedAddons.length ? selectedAddons.map(a => `${a.name} — ₦${a.price.toLocaleString()}`).join('<br>') : 'None'],
        ['Notes',    notes || 'None'],
        ['Total',    `₦${selectedAddons.reduce((s, a) => s + a.price, 0).toLocaleString()} (add-ons only)`],
    ];

    const table = document.getElementById('reviewTable');
    if (table) {
        table.innerHTML = rows.map(([k, v]) => `
            <div class="summary-row">
                <span class="sum-key">${k}</span>
                <span class="sum-val">${v}</span>
            </div>
        `).join('');
    }
}

function confirmReservation() {
    const btn = document.getElementById('confirmBtn');
    btn.textContent = 'Processing…';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
        const ref = 'BBQ-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        document.getElementById('refCode').textContent = ref;
        document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
        for (let i = 1; i <= 4; i++) {
            const s = document.getElementById('s' + i);
            s.classList.remove('active');
            s.classList.add('done');
            document.getElementById('sn' + i).textContent = '✓';
        }
        document.getElementById('successScreen').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
}

// ── Live summary updates ──
['fname', 'lname', 'resDate', 'seating'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input',  updateSummary);
        el.addEventListener('change', updateSummary);
    }
});

// ── Init ──
updateSummary();