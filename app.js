// ── EDIT HERE ────────────────────────────────────────────────────────────
// Booked periods per van as ["first day", "return day"] in YYYY-MM-DD, both
// inclusive. These days show greyed out and can't be picked.
const CONTACT_EMAIL = 'bookings@africarrentals.example'; // replace with the real inbox
const MIN_DAYS = 28;
const VANS = [ // replace names/descriptions with the real fleet
  { name: 'Van 1', desc: 'Panel van · 3 seats', booked: [['2026-11-01', '2027-01-31']] },
  { name: 'Van 2', desc: 'Panel van · 3 seats', booked: [] },
  { name: 'Van 3', desc: 'Long wheelbase · 3 seats', booked: [['2026-12-10', '2027-03-10'], ['2027-06-01', '2027-08-01']] },
  { name: 'Van 4', desc: 'Long wheelbase · 3 seats', booked: [['2027-02-15', '2027-05-15']] },
  { name: 'Van 5', desc: 'Crew van · 6 seats', booked: [['2026-11-20', '2026-12-20']] },
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
  let van, start, end;

  $('#vans').innerHTML = VANS.map((v, i) =>
    `<button class="van" data-i="${i}"><span class="icon" aria-hidden="true">🚐</span><strong>${v.name}</strong><span>${v.desc}</span><em>Check dates →</em></button>`
  ).join('');

  $('#vans').onclick = e => {
    const b = e.target.closest('.van');
    if (!b) return;
    van = VANS[b.dataset.i];
    start = end = null;
    $('#van-name').textContent = van.name;
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
    const clash = end && clashes(van, start, end);
    const err = note || (clash && `${fmt(start)} → ${fmt(end)} overlaps an existing hire. Tap a new start date.`);
    grid.querySelectorAll('[data-day]').forEach(b =>
      b.classList.toggle('sel', !!start && b.dataset.day >= start && b.dataset.day <= (end || start)));
    send.disabled = !end || clash;
    summary.classList.toggle('error', !!err);
    summary.textContent = err || (!start ? `Tap your start date. Minimum hire ${MIN_DAYS} days.`
      : !end ? `Start ${fmt(start)}. Now tap your return date (${fmt(addDays(start, MIN_DAYS))} or later).`
      : `${fmt(start)} → return ${fmt(end)} · ${daysBetween(start, end)} days`);
  }

  // 1st tap = start, 2nd tap = return; once both are set, the next tap starts over.
  grid.onclick = e => {
    const b = e.target.closest('[data-day]');
    if (!b || b.disabled) return;
    const day = b.dataset.day;
    if (!start || end || day <= start) { start = day; end = null; }
    else if (daysBetween(start, day) < MIN_DAYS) return update(`Minimum hire is ${MIN_DAYS} days. Earliest return is ${fmt(addDays(start, MIN_DAYS))}.`);
    else end = day;
    update();
  };

  send.onclick = () => {
    const body = `Hi Africar Rentals,\n\nI'd like to hire ${van.name}.\nStart: ${fmt(start)}\nReturn: ${fmt(end)}\nDuration: ${daysBetween(start, end)} days\n\nName:\nPhone:\n`;
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Van hire inquiry – ${van.name}`)}&body=${encodeURIComponent(body)}`;
  };
}

if (typeof module === 'object') module.exports = { iso, addDays, daysBetween, isBooked, clashes };
else init();
