// Run: node check.js
const assert = require('assert');
const { iso, addDays, daysBetween, isBooked, clashes } = require('./app.js');

assert.equal(iso(new Date(2026, 2, 5)), '2026-03-05');
assert.equal(addDays('2026-12-20', 28), '2027-01-17');  // crosses year
assert.equal(addDays('2028-02-01', 28), '2028-02-29');  // leap year
assert.equal(daysBetween('2026-12-01', '2026-12-29'), 28);
assert.equal(daysBetween('2026-10-01', '2026-10-31'), 30); // spans a DST change in eastern states

const van = { booked: [['2027-02-10', '2027-05-09']] };
assert.equal(isBooked(van, '2027-02-10'), true);
assert.equal(isBooked(van, '2027-05-10'), false);
assert.equal(clashes(van, '2027-01-01', '2027-02-01'), false);
assert.equal(clashes(van, '2027-01-10', '2027-02-10'), true);  // return day = first booked day
assert.equal(clashes(van, '2027-03-01', '2027-04-01'), true);  // inside a booking
assert.equal(clashes(van, '2027-01-01', '2027-07-01'), true);  // spans a booking
assert.equal(clashes(van, '2027-05-10', '2027-06-10'), false); // starts day after return
console.log('ok');
