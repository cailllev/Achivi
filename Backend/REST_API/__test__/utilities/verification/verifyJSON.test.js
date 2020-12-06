const verification = require('../../../modules/utilities/verification');

//silence all logging while testing
const logger = require('../../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));

test('test verification with 2 properties each', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = ["email", "pwd"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(true);
});

test('test verification with 1 property each', () => {
    const input = {
        email: "xxx@gmail.com"
    };
    const propertiesToHave = ["email"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(true);
});

test('test verification works with string instead of list (for only one prop)', () => {
    const input = {
        email: "xxx@gmail.com"
    };
    const propertiesToHave = "email";

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(true);
});

test('test input for different order of properties', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = ["pwd", "email"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(true);
});

test('test input for list attribute', () => {
    const input = {
        name: "Hans",
        groups: ["Bauer ledig sucht", "Der Bachelor"]
    };
    const propertiesToHave = ["name", "groups"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(true);
});

test('test input for too many properties when too many allowed', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver",
        salt: "leSalt"
    };
    const propertiesToHave = ["pwd", "email"];

    const result = verification.verifyJSON(input, propertiesToHave, true);
    expect(result.status).toBe(true);
});

test('test canContainMoreProperties defaults to false when NULL', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver",
        salt: "leSalt"
    };
    const propertiesToHave = ["pwd", "email"];

    const result = verification.verifyJSON(input, propertiesToHave);
    expect(result.status).toBe(false);
});

test('test input for too less properties when canContainMore is false => false', () => {
    const input = {
        email: "xxx@gmail.com"
    };
    const propertiesToHave = ["email", "pwd"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test input for too less properties when canContainMore is true => false', () => {
    const input = {
        email: "xxx@gmail.com"
    };
    const propertiesToHave = ["email", "pwd"];

    const result = verification.verifyJSON(input, propertiesToHave, true);
    expect(result.status).toBe(false);
});

test('test input for too many properties => false', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = ["email"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test input for one incorrect property name => false', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = ["email", "name"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test input for all incorrect property names => false', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = ["id", "name"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test for null input => false', () => {
    const input = null;
    const propertiesToHave = ["id", "name"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test for empty input => false', () => {
    const input = null;
    const propertiesToHave = ["id", "name"];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test propertiesToHave for not list and not string => false', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = 3;

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});

test('test propertiesToHave for list but not only strings => false', () => {
    const input = {
        email: "xxx@gmail.com",
        pwd: "bestPasswordEver"
    };
    const propertiesToHave = ["email", 3];

    const result = verification.verifyJSON(input, propertiesToHave, false);
    expect(result.status).toBe(false);
});