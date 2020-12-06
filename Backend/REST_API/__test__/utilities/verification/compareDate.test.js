const compare = require('../../../modules/utilities/verification').compareDate;

let a,
    b;

test('Compare dates, year', () => {
    a = new Date("01.01.2019");
    b = new Date("01.01.2020");

    expect(compare(a, b)).toBe(-1);

    a = new Date("01.01.2015");
    b = new Date("01.01.2014");

    expect(compare(a, b)).toBe(1);
});

test('Compare dates, month', () => {
    a = new Date("01.01.2020");
    b = new Date("01.02.2020");

    expect(compare(a, b)).toBe(-1);

    a = new Date("01.04.2020");
    b = new Date("01.03.2020");

    expect(compare(a, b)).toBe(1);
});

test('Compare dates, days', () => {
    a = new Date("01.01.2020");
    b = new Date("02.01.2020");

    expect(compare(a, b)).toBe(-1);

    a = new Date("04.01.2020");
    b = new Date("03.01.2020");

    expect(compare(a, b)).toBe(1);
});

test('Compare dates, equality', () => {
    a = new Date("01.01.2020");
    b = new Date("01.01.2020");

    expect(compare(a, b)).toBe(0);
});