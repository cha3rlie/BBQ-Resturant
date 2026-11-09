// ══════════ SHARED HELPERS ══════════
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const naira = n => '₦' + Number(n).toLocaleString('en-NG');

// ══════════ PHOTOS FROM THE API (TheMealDB — free, no key) ══════════
// No <img> tags anywhere: elements with data-photo="Beef" data-idx="2" get a photo
// from that category; elements with data-src="https://…" get that exact photo.
const MEAL_API = 'https://www.themealdb.com/api/json/v1/1/';
const mealCache = {};

function getMeals(category) {
    if (!mealCache[category]) {
        mealCache[category] = fetch(MEAL_API + 'filter.php?c=' + encodeURIComponent(category))
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then(d => d.meals || [])
            .catch(() => []);
    }
    return mealCache[category];
}

function setPhoto(el, url, label) {
    const pre = new Image();                       // preloader only — not part of the page markup
    pre.onload = () => { el.style.setProperty('--photo', `url("${url}")`); el.classList.add('loaded'); };
    pre.src = url;
    el.dataset.url = url;
    if (label) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', label); el.dataset.caption = label; }
}

async function hydratePhotos(root = document) {
    const els = $$('[data-photo]:not([data-done]), [data-src]:not([data-done])', root);
    await Promise.all(els.map(async el => {
        el.dataset.done = '1';
        if (el.dataset.src) { setPhoto(el, el.dataset.src, el.dataset.label); return; }
        const meals = await getMeals(el.dataset.photo);
        if (!meals.length) return;                 // API unreachable → green gradient stays
        const m = meals[(parseInt(el.dataset.idx, 10) || 0) % meals.length];
        setPhoto(el, m.strMealThumb, m.strMeal);
    }));
}

// ══════════ SCROLL REVEAL ══════════
const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { const t = en.target; t.classList.add('in'); revealObserver.unobserve(t); setTimeout(() => { t.style.transitionDelay = ''; }, 1000); }
    }), { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
    : null;
function observeReveal(root = document) {
    $$('.reveal:not(.in)', root).forEach(el => (revealObserver ? revealObserver.observe(el) : el.classList.add('in')));
}

// ══════════ TOAST ══════════
let toastTimer;
function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('main-nav') || document.getElementById('headerNav');

if (hamburger && nav) {
    const closeMenu = () => {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
    };
    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
    });
}

// ── Back to top ──
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => backToTopBtn.classList.toggle('visible', window.scrollY > 400));
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Smooth in-page anchors ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (hash.length < 2) return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

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

// ── Blog: Tab Switching (also opens from blog.html#panel-careers / #panel-press) ──
function switchTab(section, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + section).classList.add('active');
    document.querySelector('.tabs-wrap').scrollIntoView({ behavior: 'smooth' });
}

const tabFromHash = (location.hash.match(/^#panel-(\w+)$/) || [])[1];
if (tabFromHash && document.getElementById('panel-' + tabFromHash)) {
    const idx = ['blog', 'careers', 'press'].indexOf(tabFromHash);
    const tabBtn = document.querySelectorAll('.tab')[idx];
    if (tabBtn) switchTab(tabFromHash, tabBtn);
}

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

// ══════════ RESERVATION PAGE ══════════

const resDate = document.getElementById('resDate');
if (resDate) {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    resDate.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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
    const price = parseInt(card.dataset.price, 10);
    if (card.classList.contains('sel-addon')) selectedAddons.push({ name, price });
    else selectedAddons = selectedAddons.filter(a => a.name !== name);
    updateSummary();
}

function updateSummary() {
    const fname = document.getElementById('fname')?.value.trim() || '';
    const lname = document.getElementById('lname')?.value.trim() || '';
    const name  = `${fname} ${lname}`.trim();
    const date  = document.getElementById('resDate')?.value;
    const seating = document.getElementById('seating');
    const seatingText = seating?.options[seating.selectedIndex]?.text || '';

    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    set('sum-name',     name ? `<span>${esc(name)}</span>` : '<em class="empty">—</em>');
    set('sum-guests',   `${guestCount} guest${guestCount > 1 ? 's' : ''}`);
    set('sum-occasion', selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1));
    set('sum-date',     date ? `<span>${formatDate(date)}</span>` : '<em class="empty">—</em>');
    set('sum-time',     selectedTime ? `<span>${formatTime(selectedTime)}</span>` : '<em class="empty">—</em>');
    set('sum-seating',  seatingText && seatingText !== 'Choose a section…'
        ? `<span>${esc(seatingText.split('—')[0].trim())}</span>` : '<em class="empty">—</em>');
    set('sum-addons',   selectedAddons.length ? selectedAddons.map(a => `<div>${esc(a.name)}</div>`).join('') : '<em class="empty">None</em>');
    set('sum-total',    `₦${selectedAddons.reduce((s, a) => s + a.price, 0).toLocaleString()}`);
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
        else              { sn.textContent = i; }
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
        const ev = !!email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
        show('e-email', !ev); mark('email', !ev); if (!ev) ok = false;
        const pv = !!phone; show('e-phone', !pv); mark('phone', !pv); if (!pv) ok = false;
    }

    if (step === 2) {
        const date    = document.getElementById('resDate')?.value;
        const seating = document.getElementById('seating')?.value;
        show('e-date',    !date);          mark('resDate', !date);          if (!date) ok = false;
        show('e-seating', !seating);       mark('seating', !seating);       if (!seating) ok = false;
        show('e-time',    !selectedTime);                                    if (!selectedTime) ok = false;
    }
    return ok;
}

function buildReview() {
    const date    = document.getElementById('resDate')?.value;
    const seating = document.getElementById('seating');
    const dur     = document.getElementById('duration');
    const dietary = document.getElementById('dietary');
    const notes   = document.getElementById('notes')?.value.trim();
    const fname   = document.getElementById('fname')?.value.trim();
    const lname   = document.getElementById('lname')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const phone   = document.getElementById('phone')?.value.trim();
    const total   = selectedAddons.reduce((s, a) => s + a.price, 0);

    const rows = [
        ['Guest',    esc(`${fname} ${lname}`)],
        ['Email',    esc(email)],
        ['Phone',    esc(phone)],
        ['Guests',   `${guestCount} guest${guestCount > 1 ? 's' : ''}`],
        ['Occasion', selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)],
        ['Date',     date ? formatDate(date) : '—'],
        ['Time',     selectedTime ? formatTime(selectedTime) : '—'],
        ['Duration', esc(dur?.options[dur.selectedIndex]?.text || '')],
        ['Seating',  esc(seating?.options[seating.selectedIndex]?.text || '')],
        ['Dietary',  esc(dietary?.options[dietary.selectedIndex]?.text || '')],
        ['Add-ons',  selectedAddons.length ? selectedAddons.map(a => `${esc(a.name)} — ₦${a.price.toLocaleString()}`).join('<br>') : 'None'],
        ['Notes',    esc(notes || 'None')],
        ['Total',    `₦${total.toLocaleString()} (add-ons only)`],
    ];

    const table = document.getElementById('reviewTable');
    if (table) {
        table.innerHTML = rows.map(([k, v]) => `
            <div class="summary-row">
                <span class="sum-key">${k}</span>
                <span class="sum-val">${v}</span>
            </div>`).join('');
    }
}

function confirmReservation() {
    const btn = document.getElementById('confirmBtn');
    btn.textContent = 'Processing…';
    btn.style.pointerEvents = 'none';

    // Front-end demo only: replace this timeout with a real request to your backend to receive bookings.
    setTimeout(() => {
        const ref = 'BBQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        document.getElementById('refCode').textContent = ref;
        document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
        for (let i = 1; i <= 4; i++) {
            const s = document.getElementById('s' + i);
            s.classList.remove('active');
            s.classList.add('done');
            document.getElementById('sn' + i).textContent = '✓';
        }
        document.getElementById('successScreen').classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
}

['fname', 'lname', 'resDate', 'seating'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input',  updateSummary);
        el.addEventListener('change', updateSummary);
    }
});

if (document.getElementById('panel1')) updateSummary();


// ══════════ CART (works on every page, saved in the browser) ══════════
const CART_KEY    = 'bbq_cart_v1';
const ORDER_PHONE = '2348012345678';   // WhatsApp number that receives orders (country code + number, no +)
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
const saveCart  = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} };
const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
const cartTotal = () => cart.reduce((s, i) => s + i.qty * i.price, 0);

function addToCart(item) {
    const found = cart.find(c => c.id === item.id);
    if (found) found.qty++;
    else cart.push({ id: item.id, name: item.name, price: item.price, thumb: item.thumb || '', qty: 1 });
    saveCart(); renderCart();
    const btn = $('#cartBtn');
    if (btn) { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
    toast(`Added “${item.name}” to your order`);
}

function renderCart() {
    const count = cartCount();
    const badge = $('#cartCount');
    if (badge) { badge.textContent = count; badge.hidden = count === 0; }

    const body = $('#cartBody'), foot = $('#cartFoot');
    if (!body || !foot) return;

    if (!cart.length) {
        body.innerHTML = `<div class="cart-empty"><b>🛒</b><p>Your order is empty.<br>Add something delicious from the menu.</p>
            <a class="btn-primary" href="${$('#menuGrid') ? '#menu' : 'index.html#menu'}" data-close>Browse menu</a></div>`;
        foot.hidden = true;
        return;
    }
    foot.hidden = false;
    body.innerHTML = cart.map(i => `
        <div class="cart-item" data-id="${esc(i.id)}">
            <div class="cart-thumb"><div class="photo${i.thumb ? ' loaded' : ''}" ${i.thumb ? `style="--photo:url('${esc(i.thumb)}')"` : ''}></div></div>
            <div class="cart-info">
                <strong>${esc(i.name)}</strong><span>${naira(i.price)} each</span>
                <div class="qty"><button data-act="dec" aria-label="Less">−</button><b>${i.qty}</b><button data-act="inc" aria-label="More">+</button></div>
            </div>
            <div class="cart-line">${naira(i.price * i.qty)}<button data-act="rm">Remove</button></div>
        </div>`).join('');
    $('#cartTotal').textContent = naira(cartTotal());
}

function openCart()  { $('#cartDrawer').classList.add('open'); $('#cartOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartOverlay').classList.remove('open'); document.body.style.overflow = ''; }

function placeOrder() {
    if (!cart.length) return;
    const note = ($('#cartNote')?.value || '').trim();
    const lines = cart.map(i => `${i.qty} × ${i.name} — ${naira(i.qty * i.price)}`).join('\n');
    const msg = `Hello BBQ Flame! I'd like to place an order:\n\n${lines}\n\nTotal: ${naira(cartTotal())}` + (note ? `\n\nNote: ${note}` : '');
    window.open(`https://wa.me/${ORDER_PHONE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

function buildCartUI() {
    const header = $('header');
    if (!header) return;

    const btn = document.createElement('button');
    btn.className = 'cart-btn'; btn.id = 'cartBtn'; btn.setAttribute('aria-label', 'Open your order');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span class="cart-count" id="cartCount" hidden>0</span>`;
    header.appendChild(btn);

    document.body.insertAdjacentHTML('beforeend', `
        <div class="cart-overlay" id="cartOverlay"></div>
        <aside class="cart-drawer" id="cartDrawer" aria-label="Your order">
            <div class="cart-head"><h3>Your Order</h3><button class="cart-close" id="cartClose" aria-label="Close">✕</button></div>
            <div class="cart-body" id="cartBody"></div>
            <div class="cart-foot" id="cartFoot" hidden>
                <textarea id="cartNote" placeholder="Add a note (spice level, delivery address, allergies…)"></textarea>
                <div class="cart-total"><span>Total</span><strong id="cartTotal">₦0</strong></div>
                <button class="cart-order" id="cartOrder">Send order on WhatsApp</button>
                <button class="cart-clear" id="cartClear">Clear order</button>
            </div>
        </aside>`);

    btn.addEventListener('click', openCart);
    $('#cartClose').addEventListener('click', closeCart);
    $('#cartOverlay').addEventListener('click', closeCart);
    $('#cartOrder').addEventListener('click', placeOrder);
    $('#cartClear').addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

    $('#cartBody').addEventListener('click', e => {
        if (e.target.closest('[data-close]')) { closeCart(); return; }
        const act = e.target.dataset.act, row = e.target.closest('.cart-item');
        if (!act || !row) return;
        const item = cart.find(c => c.id === row.dataset.id);
        if (!item) return;
        if (act === 'inc') item.qty++;
        if (act === 'dec') item.qty--;
        if (act === 'rm' || item.qty <= 0) cart = cart.filter(c => c !== item);
        saveCart(); renderCart();
    });
    renderCart();
}
buildCartUI();

// ══════════ SEARCHABLE MENU (home page) ══════════
const menuGrid = $('#menuGrid');
if (menuGrid) {
    const SIGNATURE = [
        { id: 'sig-ribs',    name: 'BBQ Beef Ribs',         price: 12500, cat: 'Beef',       idx: 0, desc: '12-hour slow-smoked beef ribs with our house dry rub, served with coleslaw and pickles.' },
        { id: 'sig-kebab',   name: 'Grilled Kebab Platter', price: 9500,  cat: 'Lamb',       idx: 0, desc: 'Marinated lamb and beef skewers over charcoal, with flatbread, hummus, and herb salad.' },
        { id: 'sig-chicken', name: 'Smoked Half Chicken',   price: 8500,  cat: 'Chicken',    idx: 0, desc: 'Brined overnight and smoked low-and-slow with hickory wood. Juicy, tender, unforgettable.' },
        { id: 'sig-veggie',  name: 'Veggie Grill Basket',   price: 6500,  cat: 'Vegetarian', idx: 0, desc: 'Seasonal vegetables chargrilled with olive oil, herbs, and a drizzle of our signature sauce.' },
        { id: 'sig-pork',    name: 'Pork Belly Bites',      price: 7500,  cat: 'Pork',       idx: 0, desc: 'Crispy-edged, melt-in-your-mouth smoked pork belly with sweet chili dipping sauce.' },
        { id: 'sig-burger',  name: 'Pitmaster Burger',      price: 8000,  cat: 'Beef',       idx: 4, desc: 'Double smash patty, aged cheddar, bacon jam, pickled onions, and our smoky house sauce.' },
    ];
    const PAGE = 9;
    const statusEl = $('#menuStatus'), moreBtn = $('#menuMore');
    const items = new Map();
    let list = [], shown = 0;

    const priceFor = id => 4000 + (parseInt(id, 10) % 9) * 750;
    const describe = (cat, area) => area && cat ? `A ${area} ${cat.toLowerCase()} favourite, cooked fresh to order.`
                                  : cat ? `A ${cat.toLowerCase()} special, cooked fresh to order.` : 'Cooked fresh to order.';
    const normalize = (m, cat) => ({
        id: 'm' + m.idMeal, name: m.strMeal, cat: m.strCategory || cat || '', area: m.strArea || '',
        thumb: m.strMealThumb, price: priceFor(m.idMeal), desc: describe(m.strCategory || cat, m.strArea),
    });

    function cardHTML(it, i) {
        items.set(it.id, it);
        const photo = it.thumb
            ? `<div class="photo" data-src="${esc(it.thumb)}" data-label="${esc(it.name)}"></div>`
            : `<div class="photo" data-photo="${esc(it.cat)}" data-idx="${it.idx || 0}"></div>`;
        return `<article class="menu-card reveal" data-id="${esc(it.id)}" style="transition-delay:${Math.min(i % PAGE, 8) * 55}ms">
            <div class="menu-card-img-placeholder">${photo}${it.cat ? `<span class="menu-badge">${esc(it.cat)}</span>` : ''}</div>
            <div class="menu-card-body">
                <h3>${esc(it.name)}</h3>
                <p>${esc(it.desc)}</p>
            </div>
            <div class="menu-card-footer"><span class="price">${naira(it.price)}</span><button class="order-btn" data-add>＋ Add</button></div>
        </article>`;
    }

    function showMore() {
        const slice = list.slice(shown, shown + PAGE);
        menuGrid.insertAdjacentHTML('beforeend', slice.map((it, i) => cardHTML(it, i)).join(''));
        shown += slice.length;
        moreBtn.hidden = shown >= list.length;
        hydratePhotos(menuGrid); observeReveal(menuGrid);
    }

    function showList(arr) {
        list = arr; shown = 0; menuGrid.innerHTML = '';
        showMore();
    }

    function loading(text) {
        statusEl.textContent = text; moreBtn.hidden = true;
        menuGrid.innerHTML = '<div class="menu-skeleton"></div>'.repeat(3);
    }

    function setActiveChip(cat) { $$('.mchip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat)); }

    function showSignature() {
        setActiveChip('signature');
        statusEl.textContent = '';
        showList(SIGNATURE);
    }

    async function showCategory(cat) {
        setActiveChip(cat);
        loading(`Loading ${cat.toLowerCase()} dishes…`);
        const meals = await getMeals(cat);
        if (!meals.length) { statusEl.textContent = 'Could not load dishes right now. Check your connection and try again.'; menuGrid.innerHTML = ''; return; }
        statusEl.textContent = `${meals.length} ${cat.toLowerCase()} dishes`;
        showList(meals.map(m => normalize(m, cat)));
    }

    async function search(q) {
        q = q.trim();
        if (!q) { showSignature(); return; }
        setActiveChip(null);
        loading(`Searching for “${q}”…`);
        let meals = [];
        try {
            const r = await fetch(MEAL_API + 'search.php?s=' + encodeURIComponent(q));
            meals = (await r.json()).meals || [];
        } catch (e) {
            statusEl.textContent = 'Search is unavailable right now. Check your connection and try again.';
            menuGrid.innerHTML = ''; return;
        }
        if (!meals.length) {
            statusEl.textContent = `No dishes found for “${q}”. Try “chicken”, “beef”, “lamb” or “bbq”.`;
            menuGrid.innerHTML = ''; return;
        }
        statusEl.textContent = `${meals.length} dish${meals.length > 1 ? 'es' : ''} found for “${q}”`;
        showList(meals.map(m => normalize(m)));
    }

    // events
    $('#menuSearchForm').addEventListener('submit', e => { e.preventDefault(); search($('#menuSearch').value); });
    $('#menuSearch').addEventListener('input', e => { if (!e.target.value.trim()) showSignature(); });
    $('#menuChips').addEventListener('click', e => {
        const chip = e.target.closest('.mchip'); if (!chip) return;
        $('#menuSearch').value = '';
        chip.dataset.cat === 'signature' ? showSignature() : showCategory(chip.dataset.cat);
    });
    moreBtn.addEventListener('click', showMore);
    menuGrid.addEventListener('click', e => {
        const btn = e.target.closest('[data-add]'); if (!btn) return;
        const card = btn.closest('.menu-card'), item = items.get(card.dataset.id); if (!item) return;
        addToCart({ ...item, thumb: item.thumb || $('.photo', card)?.dataset.url || '' });
        btn.textContent = '✓ Added'; btn.classList.add('added');
        setTimeout(() => { btn.textContent = '＋ Add'; btn.classList.remove('added'); }, 1200);
    });

    showSignature();
}

// ══════════ GALLERY LIGHTBOX ══════════
const galleryGrid = $('.gallery-grid');
if (galleryGrid) {
    document.body.insertAdjacentHTML('beforeend', `
        <div class="lightbox" id="lightbox" role="dialog" aria-label="Photo viewer">
            <button class="lb-close" aria-label="Close">✕</button>
            <button class="lb-prev" aria-label="Previous">‹</button>
            <div class="lightbox-photo" id="lbPhoto"></div>
            <button class="lb-next" aria-label="Next">›</button>
            <div class="lightbox-cap" id="lbCap"></div>
        </div>`);
    const lb = $('#lightbox'), tiles = $$('.gallery-item .photo', galleryGrid);
    let cur = 0;
    const show = i => {
        cur = (i + tiles.length) % tiles.length;
        const t = tiles[cur];
        $('#lbPhoto').style.backgroundImage = t.dataset.url ? `url("${t.dataset.url}")` : 'none';
        $('#lbCap').textContent = t.dataset.caption || '';
    };
    const close = () => lb.classList.remove('open');
    galleryGrid.addEventListener('click', e => {
        const tile = e.target.closest('.gallery-item'); if (!tile) return;
        show(tiles.indexOf($('.photo', tile))); lb.classList.add('open');
    });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(cur - 1));
    $('.lb-next', lb).addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(cur - 1);
        if (e.key === 'ArrowRight') show(cur + 1);
    });
}

// ══════════ KICK OFF ══════════
hydratePhotos();
observeReveal();