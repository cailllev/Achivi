const verifyDate = require('../../../modules/utilities/verification').verifyDate;

//silence all logging while testing
const logger = require('../../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));

test('Can be null', () => {
    var d = "",
        canBeNull = true,
        result;

    result = verifyDate(d, null, null, canBeNull);
    expect(result.status).toBe(true);


    // Correct date and null
    d = new Date("2020-03-13");
    result = verifyDate(d, null, null, canBeNull);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe(`${d.toString()}`);
});

test('Invalid Date', () => {
    var d = new Date("foo"),
        result;

    result = verifyDate(d);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Given date is not a valid Date. DateToString: ${d.toString()}`);


    d = new Date("31.02.2020");
    result = verifyDate(d);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Given date is not a valid Date. DateToString: ${d.toString()}`);


    d = "01:01:2020";
    result = verifyDate(d);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Could not recognize date. Date: ${d.toString()}`);


    d = "31.01.20.20";
    result = verifyDate(d);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Could not recognize date. Date: ${d}`);


    d = new Date("151351351351");
    result = verifyDate(d);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Given date is not a valid Date. DateToString: ${d.toString()}`);
});


test('Catch invalid date [Only given as a string => new Date(2020-02-30) === new Date(2020-03-01)]', () => {
    var d = "31.02.2020",
        result;

    result = verifyDate(d);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Invalid date. Date: 2020-02-31`);

    // If given as Date Object. It is accepted
    d = new Date("2020-02-30");
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date("2020-03-01").toString()));
});

test('Check min date', () => {
    var d = new Date("2020-03-13"),
        minDate = new Date("2020-03-13"),
        result;

    result = verifyDate(d, minDate);
    expect(result.status).toBe(true);

    d = new Date("2020-3-13");
    result = verifyDate(d, minDate);
    expect(result.status).toBe(true);


    // Can be null
    result = verifyDate(null, minDate, null, true);
    expect(result.status).toBe(true);

    // Min date
    minDate = new Date();
    d = new Date((new Date()).setDate(minDate.getDate() - 2));
    result = verifyDate(d, minDate);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Given date is lower than min date. GivenDate: ${d.toString()} | minDate: ${minDate.toString()}`);

    // Wrong min date
    minDate = new Date("foo");
    try {
        result = result = verifyDate(d, minDate);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Date: Given min date not recognized: MinDate: ${minDate.toString()}`);
});

test('Check max date', () => {
    var d = new Date("2020-03-13"),
        maxDate = new Date("2020-03-13"),
        result;

    result = verifyDate(d, null, maxDate);
    expect(result.status).toBe(true);

    d = new Date("2020-3-13");
    result = verifyDate(d, null, maxDate);
    expect(result.status).toBe(true);


    // Can be null
    result = verifyDate(null, null, maxDate, true);
    expect(result.status).toBe(true);

    // Min date
    maxDate = new Date();
    d = new Date((new Date()).setDate(maxDate.getDate() + 2));
    result = verifyDate(d, null, maxDate);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Given date is higher than max date. GivenDate: ${d.toString()} | maxDate: ${maxDate.toString()}`);

    // Wrong min date
    maxDate = new Date("foo");
    try {
        result = result = verifyDate(d, null, maxDate);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Date: Given max date not recognized: MaxDate: ${maxDate.toString()}`);
});

test('Check min and max date', () => {
    var d = new Date("2020-03-13"),
        minDate = new Date("2020-03-13"),
        maxDate = new Date("2020-03-13"),
        result;

    result = verifyDate(d, minDate, maxDate);
    expect(result.status).toBe(true);


    minDate = new Date("2019-03-13");
    maxDate = new Date("2021-03-13");
    result = verifyDate(d, minDate, maxDate);
    expect(result.status).toBe(true);
});

test('Correct date in different formats', () => {
    var d,
        result;

    d = "1588327200000"; //Fri May 01 2020 12:00:00 GMT+0200
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString().substring(0,15)).toBe("Fri May 01 2020");

    d = 1588327200000; //Fri May 01 2020 12:00:00 GMT+0200
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString().substring(0,15)).toBe("Fri May 01 2020");

    d = "01-01-2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString().substring(0,15)).toBe((new Date(d)).toString().substring(0,15));

    d = "2020-03-13";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date(d)).toString());

    d = "13.03.2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date("2020-03-13")).toString());

    d = "03/13/2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date(d)).toString());


    d = "2020-03-1"
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date(d)).toString());

    d = "1.03.2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date("2020-3-01")).toString());

    d = "03/1/2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date(d)).toString());


    d = "2020-3-1"
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date(d)).toString());

    d = "1.3.2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date("2020-3-1")).toString());

    d = "3/1/2020";
    result = verifyDate(d);
    expect(result.status).toBe(true);
    expect(result.convertedDate.toString()).toBe((new Date(d)).toString());
});