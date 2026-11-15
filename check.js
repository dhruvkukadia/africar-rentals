// Run: node check.js
const assert = require('assert');
const { iso, addMonths, isBooked, clashes } = require('./app.js');
const d = (y, m, day) => new Date(y, m - 1, day);

assert.equal(iso(d(2026, 3, 5)), '2026-03-05');
assert.equal(iso(addMonths(d(2026, 11, 15), 3)), '2027-02-15'); // crosses year
assert.equal(iso(addMonths(d(2027, 1, 31), 1)), '2027-02-28'); // clamps to month end
assert.equal(iso(addMonths(d(2028, 1, 31), 1)), '2028-02-29'); // leap year

const van = { booked: [['2027-02-10', '2027-05-09']] };
assert.equal(isBooked(van, '2027-02-10'), true);
assert.equal(isBooked(van, '2027-05-10'), false);
assert.equal(clashes(van, '2027-01-01', '2027-02-01'), false);
assert.equal(clashes(van, '2027-01-10', '2027-02-10'), true);  // return day = first booked day
assert.equal(clashes(van, '2027-03-01', '2027-04-01'), true);  // inside a booking
assert.equal(clashes(van, '2027-01-01', '2027-07-01'), true);  // spans a booking
assert.equal(clashes(van, '2027-05-10', '2027-06-10'), false); // starts day after return
console.log('ok');
