 // Hamburger
        const hamburger = document.getElementById('hamburger');
        const nav = document.getElementById('main-nav');
        hamburger.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
            });
        });

        // Back to top
        const btn = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // Contact form submit feedback
        document.querySelector('.contact-form button').addEventListener('click', function() {
            this.textContent = '✓ Message Sent!';
            this.style.background = '#256025';
            setTimeout(() => {
                this.textContent = 'Send Message';
                this.style.background = '';
            }, 3000);
        });

        // Newsletter submit feedback
        document.querySelector('.newsletter-form button').addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.value) {
                this.textContent = '✓ Subscribed!';
                input.value = '';
                setTimeout(() => { this.textContent = 'Subscribe'; }, 3000);
            }
        });







/* - blog - */

         /* ── Tab Switching ── */
    function switchTab(section, btn) {
        // Update buttons
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        // Update panels
        document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + section).classList.add('active');

        // Scroll to tabs
        document.querySelector('.tabs-wrap').scrollIntoView({ behavior: 'smooth' });
    }

    /* ── Hamburger ── */
    const hb  = document.getElementById('hamburger');
    const hnv = document.getElementById('headerNav');
    hb.addEventListener('click', () => {
        const o = hnv.classList.toggle('open');
        hb.classList.toggle('open', o);
    });

    /* ── Apply buttons ── */
    document.querySelectorAll('.btn-apply').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Application form coming soon! Please send your CV to careers@bbqflame.com');
        });
    });









     /* ── Ember particles ── */
    const emb = document.getElementById('embers');
    for (let i = 0; i < 20; i++) {
        const e = document.createElement('div');
        e.className = 'ember';
        e.style.cssText = `
            left:${Math.random()*100}%;
            width:${2+Math.random()*3}px; height:${2+Math.random()*3}px;
            background:${Math.random()>.5?'#7ed957':'#e74c3c'};
            --dur:${4+Math.random()*6}s;
            --delay:${Math.random()*8}s;
            --drift:${(Math.random()-.5)*70}px;
        `;
        emb.appendChild(e);
    }

    /* ── Set min date to today ── */
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('resDate').min = today;

    /* ── State ── */
    let guestCount = 2;
    let selectedTime = '';
    let selectedOccasion = 'casual';
    let selectedAddons = [];
    let currentStep = 1;

    /* ── Guest counter ── */
    function changeGuests(d) {
        guestCount = Math.max(1, Math.min(50, guestCount + d));
        document.getElementById('guestVal').textContent = guestCount;
        updateSummary();
    }

    /* ── Occasion chips ── */
    function selectChip(el) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('sel-chip'));
        el.classList.add('sel-chip');
        selectedOccasion = el.dataset.val;
        updateSummary();
    }

    /* ── Time slots ── */
    function selectTime(el) {
        if (el.classList.contains('unavailable')) return;
        document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
        selectedTime = el.dataset.time;
        updateSummary();
    }

    /* ── Add-ons ── */
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

    /* ── Summary updater ── */
    function updateSummary() {
        const fname = document.getElementById('fname').value.trim();
        const lname = document.getElementById('lname').value.trim();
        const name  = (fname || lname) ? `${fname} ${lname}`.trim() : null;
        const date  = document.getElementById('resDate').value;
        const seating = document.getElementById('seating');
        const seatingText = seating.options[seating.selectedIndex]?.text || '';

        document.getElementById('sum-name').innerHTML    = name ? `<span>${name}</span>` : '<em class="empty">—</em>';
        document.getElementById('sum-guests').textContent = `${guestCount} guest${guestCount>1?'s':''}`;
        document.getElementById('sum-occasion').textContent = selectedOccasion.charAt(0).toUpperCase()+selectedOccasion.slice(1);
        document.getElementById('sum-date').innerHTML    = date ? `<span>${formatDate(date)}</span>` : '<em class="empty">—</em>';
        document.getElementById('sum-time').innerHTML    = selectedTime ? `<span>${formatTime(selectedTime)}</span>` : '<em class="empty">—</em>';
        document.getElementById('sum-seating').innerHTML = seatingText && seatingText !== 'Choose a section…'
            ? `<span>${seatingText.split('—')[0].trim()}</span>` : '<em class="empty">—</em>';

        if (selectedAddons.length) {
            document.getElementById('sum-addons').innerHTML = selectedAddons.map(a=>`<div>${a.name}</div>`).join('');
        } else {
            document.getElementById('sum-addons').innerHTML = '<em class="empty">None</em>';
        }

        const total = selectedAddons.reduce((s,a) => s+a.price, 0);
        document.getElementById('sum-total').textContent = `₦${total.toLocaleString()}`;
    }

    function formatDate(d) {
        const dt = new Date(d+'T00:00:00');
        return dt.toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
    }
    function formatTime(t) {
        const [h,m] = t.split(':').map(Number);
        const ampm = h>=12?'PM':'AM';
        const h12  = h>12?h-12:h===0?12:h;
        return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
    }

    /* ── Stepper ── */
    function goStep(n) {
        if (n > currentStep && !validateStep(currentStep)) return;
        currentStep = n;
        // panels
        document.querySelectorAll('.form-panel').forEach((p,i) => p.classList.toggle('active', i===n-1));
        // steps
        for (let i=1;i<=4;i++) {
            const s = document.getElementById('s'+i);
            s.classList.remove('active','done');
            if (i<n) s.classList.add('done');
            else if (i===n) s.classList.add('active');
            // check icon for done
            const num = document.getElementById('sn'+i);
            num.textContent = i<n ? '✓' : i;
        }
        if (n === 4) buildReview();
        updateSummary();
        window.scrollTo({top:0,behavior:'smooth'});
    }

    /* ── Validation ── */
    function validateStep(step) {
        let ok = true;
        const show = (id, show) => {
            const el = document.getElementById(id);
            if (el) { el.classList.toggle('show', show); }
        };
        const markField = (id, hasErr) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('has-error', hasErr);
        };

        if (step === 1) {
            const fname = document.getElementById('fname').value.trim();
            const lname = document.getElementById('lname').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();

            if (!fname) { show('e-fname',true); markField('fname',true); ok=false; }
            else         { show('e-fname',false); markField('fname',false); }
            if (!lname) { show('e-lname',true); markField('lname',true); ok=false; }
            else         { show('e-lname',false); markField('lname',false); }
            if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { show('e-email',true); markField('email',true); ok=false; }
            else { show('e-email',false); markField('email',false); }
            if (!phone) { show('e-phone',true); markField('phone',true); ok=false; }
            else { show('e-phone',false); markField('phone',false); }
        }

        if (step === 2) {
            const date    = document.getElementById('resDate').value;
            const seating = document.getElementById('seating').value;
            if (!date)    { show('e-date',true); markField('resDate',true); ok=false; }
            else          { show('e-date',false); markField('resDate',false); }
            if (!seating) { show('e-seating',true); markField('seating',true); ok=false; }
            else          { show('e-seating',false); markField('seating',false); }
            if (!selectedTime) { show('e-time',true); ok=false; }
            else               { show('e-time',false); }
        }

        return ok;
    }

    /* ── Build review table ── */
    function buildReview() {
        const date    = document.getElementById('resDate').value;
        const seating = document.getElementById('seating');
        const dur     = document.getElementById('duration');
        const dietary = document.getElementById('dietary');
        const notes   = document.getElementById('notes').value;
        const fname   = document.getElementById('fname').value.trim();
        const lname   = document.getElementById('lname').value.trim();
        const email   = document.getElementById('email').value.trim();
        const phone   = document.getElementById('phone').value.trim();

        const rows = [
            ['Guest',    `${fname} ${lname}`],
            ['Email',    email],
            ['Phone',    phone],
            ['Guests',   `${guestCount} guest${guestCount>1?'s':''}`],
            ['Occasion', selectedOccasion.charAt(0).toUpperCase()+selectedOccasion.slice(1)],
            ['Date',     formatDate(date)],
            ['Time',     formatTime(selectedTime)],
            ['Duration', `${dur.options[dur.selectedIndex].text}`],
            ['Seating',  seating.options[seating.selectedIndex].text],
            ['Dietary',  dietary.options[dietary.selectedIndex].text],
            ['Add-ons',  selectedAddons.length ? selectedAddons.map(a=>`${a.name} — ₦${a.price.toLocaleString()}`).join('<br>') : 'None'],
            ['Notes',    notes || 'None'],
            ['Total',    `₦${selectedAddons.reduce((s,a)=>s+a.price,0).toLocaleString()} (add-ons only)`],
        ];

        document.getElementById('reviewTable').innerHTML = rows.map(([k,v]) => `
            <div class="summary-row">
                <span class="sum-key">${k}</span>
                <span class="sum-val">${v}</span>
            </div>
        `).join('');
    }

    /* ── Confirm ── */
    function confirmReservation() {
        const btn = document.getElementById('confirmBtn');
        btn.textContent = 'Processing…';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            // Generate ref
            const ref = 'BBQ-' + Math.random().toString(36).substr(2,6).toUpperCase();
            document.getElementById('refCode').textContent = ref;

            // Hide all panels
            document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
            // Update stepper — all done
            for (let i=1;i<=4;i++) {
                const s = document.getElementById('s'+i);
                s.classList.remove('active');
                s.classList.add('done');
                document.getElementById('sn'+i).textContent = '✓';
            }
            // Show success
            document.getElementById('successScreen').style.display = 'block';
            window.scrollTo({top:0,behavior:'smooth'});
        }, 1800);
    }

    /* ── Live summary updates on input ── */
    ['fname','lname','resDate','seating'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSummary);
        if (el) el.addEventListener('change', updateSummary);
    });

    /* ── Hamburger ── */
    const hb  = document.getElementById('hamburger');
    const hnv = document.getElementById('headerNav');
    hb.addEventListener('click', () => {
        const o = hnv.classList.toggle('open');
        hb.classList.toggle('open', o);
    });

    /* ── Init ── */
    updateSummary();



