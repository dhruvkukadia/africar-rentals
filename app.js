// ── EDIT HERE ────────────────────────────────────────────────────────────
// Booked periods per van as ["first day", "return day"] in YYYY-MM-DD, both
// inclusive. These days show greyed out and can't be picked.
const CONTACT_EMAIL = 'dhruvkukadia25@gmail.com'; // temporary: switch to info@africarrentals.com.au
const MIN_DAYS = 28;
const ONE_T = { type: '1-tonne', size: '1t', desc: 'Mid-size. Made for courier runs and deliveries.' };
const TWO_T = { type: '2-tonne', size: '2t', desc: 'High roof. Made for trades and removals.' };
const VANS = [ // replace names (e.g. "Mitsubishi Express") and booked dates with the real fleet
  { name: 'Van 1', ...ONE_T, booked: [['2026-11-01', '2027-01-31']] },
  { name: 'Van 2', ...ONE_T, booked: [] },
  { name: 'Van 3', ...ONE_T, booked: [['2026-12-10', '2027-03-10'], ['2027-06-01', '2027-08-01']] },
  { name: 'Van 4', ...TWO_T, booked: [['2027-02-15', '2027-05-15']] },
  { name: 'Van 5', ...TWO_T, booked: [['2026-11-20', '2026-12-20']] },
];
// ─────────────────────────────────────────────────────────────────────────

const pad = n => String(n).padStart(2, '0');
// Local date as YYYY-MM-DD (toISOString is UTC and shifts the day near midnight).
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };
// Rounded so a 23/25-hour daylight-saving day still counts as one day.
const daysBetween = (a, b) => Math.round((fromIso(b) - fromIso(a)) / 864e5);

// YYYY-MM-DD strings compare correctly as plain strings.
const isBooked = (van, day) => van.booked.some(([from, to]) => day >= from && day <= to);
const clashes = (van, start, end) => van.booked.some(([from, to]) => from <= end && to >= start);

function init() {
  const $ = s => document.querySelector(s);
  const dlg = $('#cal'), grid = $('#grid'), send = $('#send'), summary = $('#summary');
  const fmt = (s, o = { day: 'numeric', month: 'short', year: 'numeric' }) => fromIso(s).toLocaleDateString('en-AU', o);
  let van, start, end, picking; // picking = return date is still the 28-day default

  // Van tiles go before the static "How it works" tile; a click anywhere on a tile opens its calendar.
  $('#fleet').insertAdjacentHTML('afterbegin', VANS.map((v, i) =>
    `<article class="tile van${v.size === '2t' ? ' dark' : ''}" data-i="${i}">
      <div class="copy"><span class="tag">${v.type}</span><h3>${v.name}</h3><p>${v.desc}</p><button class="btn" type="button">Check dates</button></div>
      <svg class="art" viewBox="0 0 700 580" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><text class="glyph" x="664" y="330" text-anchor="end">${v.size.toUpperCase()}</text><use href="#van-${v.size}" y="270" width="700" height="292"/></svg>
    </article>`
  ).join(''));
  $('#mock').innerHTML = '<i></i>'.repeat(35);
  document.querySelector('.paddles').onclick = e => {
    const dir = e.target.dataset.dir, strip = $('#strip');
    if (dir) strip.scrollBy({ left: dir * strip.clientWidth * .8, behavior: 'smooth' });
  };

  $('#fleet').onclick = e => {
    const b = e.target.closest('.van');
    if (!b) return;
    van = VANS[b.dataset.i];
    start = end = null;
    details.reset();
    show('dates');
    $('#van-name').textContent = `${van.name} · ${van.type}`;
    render();
    update();
    dlg.showModal();
    grid.scrollTop = 0;
  };

  function render() {
    const now = new Date(), today = iso(now);
    let html = '';
    for (let i = 0; i < 12; i++) {
      const first = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      html += `<section><h3>${fmt(iso(first), { month: 'long', year: 'numeric' })}</h3><div class="days">`
        + [...'MTWTFSS'].map(d => `<b aria-hidden="true">${d}</b>`).join('')
        + '<i></i>'.repeat((first.getDay() + 6) % 7); // Monday-first offset
      for (let d = 1; d <= count; d++) {
        const day = iso(new Date(first.getFullYear(), first.getMonth(), d));
        const booked = isBooked(van, day);
        html += `<button type="button" data-day="${day}"${booked ? ' class="booked"' : ''}${booked || day < today ? ' disabled' : ''} aria-label="${fmt(day)}${booked ? ', on hire' : ''}">${d}</button>`;
      }
      html += '</div></section>';
    }
    grid.innerHTML = html;
  }

  function update(note) {
    const clash = start && clashes(van, start, end);
    const err = note || (clash && `${fmt(start)} → ${fmt(end)} overlaps an existing hire. Pick a different start date.`);
    grid.querySelectorAll('[data-day]').forEach(b =>
      b.classList.toggle('sel', !!start && b.dataset.day >= start && b.dataset.day <= end));
    summary.classList.toggle('error', !!err);
    summary.textContent = err || (!start ? `Tap your start date. Minimum hire ${MIN_DAYS} days.`
      : `${fmt(start)} → return ${fmt(end)} · ${daysBetween(start, end)} days. `
        + (picking ? 'Tap a later date to stay longer.' : 'Tap any date to start again.'));
    return !!start && !clash;
  }

  // 1st tap = start with a 28-day default return; a later tap (28+ days out)
  // moves the return date; once moved, the next tap starts over.
  grid.onclick = e => {
    const b = e.target.closest('[data-day]');
    if (!b || b.disabled) return;
    const day = b.dataset.day;
    if (!start || !picking || clashes(van, start, end) || day < addDays(start, MIN_DAYS)) { start = day; end = addDays(day, MIN_DAYS); picking = true; }
    else { end = day; picking = false; }
    update();
  };

  // Steps inside the dialog: dates → details → thanks.
  const details = $('#details'), submit = $('#submit'), formError = $('#form-error');
  const show = step => dlg.querySelectorAll('[data-step]').forEach(el => { el.hidden = el.dataset.step !== step; });
  const picked = () => `${van.name} (${van.type}) · ${fmt(start)} → ${fmt(end)} · ${daysBetween(start, end)} days`;
  const subject = () => `Van hire enquiry – ${van.name} (${van.type})`;

  // Never disabled: a press always either moves on or says what's missing.
  send.onclick = () => {
    if (!update(start ? null : 'Tap a start date on the calendar first.')) return;
    $('#picked').textContent = picked();
    formError.textContent = '';
    show('details');
    details.elements.name.focus();
  };
  $('#back').onclick = () => show('dates');

  details.onsubmit = async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(details));
    submit.disabled = true;
    submit.textContent = 'Sending…';
    formError.textContent = '';
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...f, van: `${van.name} (${van.type})`, start: fmt(start), return: fmt(end),
          days: daysBetween(start, end), _subject: subject(), _template: 'table' }),
      });
      const data = await r.json();
      if (String(data.success) !== 'true') throw new Error(data.message || `HTTP ${r.status}`);
      $('#thanks-msg').textContent = `Thanks ${f.name.split(' ')[0]}, we've got your enquiry for ${picked()}. We'll call or text you on ${f.phone} soon.`;
      show('thanks');
    } catch (x) {
      // Don't lose the enquiry: offer a pre-filled email as a fallback.
      const body = `${picked()}\n\nName: ${f.name}\nPhone: ${f.phone}\nEmail: ${f.email}\n\n${f.message}`;
      const a = Object.assign(document.createElement('a'), {
        href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(body)}`,
        textContent: 'email it to us instead',
      });
      formError.replaceChildren(`Sorry, that didn't send (${x.message}). Try again, or `, a, '.');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Submit enquiry';
    }
  };
}

if (typeof module === 'object') module.exports = { iso, addDays, daysBetween, isBooked, clashes };
else init();
