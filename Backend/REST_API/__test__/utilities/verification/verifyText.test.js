const verifyText = require('../../../modules/utilities/verification').verifyText;

//silence all logging while testing
const logger = require('../../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));


test('Typeof text = number', () => {
    var result, text = 1;

    try {
        verifyText(text);
    } catch (e) {
        result = e;
    }
    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: text must be of type string. Type of text: ${typeof text}`);
});

test('MaxLength = null', () => {
    var result, text = "Hello world!";
    try {
        verifyText(text);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength can not be null`);
});

test('Text less than 50 chars, maxLength = 50', () => {
    var text = "Hello world!",
        result = verifyText(text, 50);

    // Test if the result is an object
    expect(typeof result).toBe("object");
    expect(Object.prototype.toString.call(result)).toBe("[object Object]");

    expect(result.status).toBe(true);
});

test('Test maxLength', () => {
    var text = "Hello world!",
        maxLength = "asdf",
        result;

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);


    // Number as double
    maxLength = 30.3;

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be an Integer. MaxLength: ${maxLength}`);


    // Number as string
    maxLength = "30";

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);


    // Number as string with char
    maxLength = "30a";

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);

    maxLength = "a30";

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);

    maxLength = "a30a";

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);

    maxLength = "a3a0a";

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);


    // Max length is less than 1
    maxLength = 0;

    try {
        verifyText(text, maxLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength can not be lower than 1. MaxLength: ${maxLength}`);
});


test('Test minLength', () => {
    var text = "Hello world!",
        maxLength = Number.MAX_SAFE_INTEGER,
        minLength = "asdf",
        result;

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);


    // Number as double
    minLength = 30.3;

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be an Integer. MinLength: ${minLength}`);

    // Number as string
    minLength = "30";

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);


    // Number as string with char
    minLength = "30a";

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);

    minLength = "a30";

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);

    minLength = "a30a";

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);

    minLength = "a3a0a";

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);

    // Min length is less than 0
    minLength = -1;

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: minLength can not be lower than 0. MinLength: ${minLength}`);
});

test('MaxLength, minLength', () => {
    var text = "Hello world!",
        maxLength = Number.MAX_SAFE_INTEGER - 1,
        minLength = maxLength + 1,
        result;

    try {
        verifyText(text, maxLength, minLength);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: maxLength can not be lower than minLength. MaxLength: ${maxLength} | MinLength: ${minLength}`);

    // Correct
    maxLength = Number.MAX_SAFE_INTEGER;
    minLength = 0;

    result = verifyText(text, maxLength, minLength);

    expect(result.status).toBe(true);
});

test('Boolean, minLength', () => {
    var text = "Hello world!",
        maxLength = Number.MAX_SAFE_INTEGER,
        bool = "asdf",
        result;

    try {
        verifyText(text, maxLength, null, bool);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: canBeNull must be of type boolean. Type of canBeNull: ${typeof bool}`);


    bool = "true";

    try {
        verifyText(text, maxLength, null, bool);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: canBeNull must be of type boolean. Type of canBeNull: ${typeof bool}`);


    bool = 1;

    try {
        verifyText(text, maxLength, null, bool);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Text: canBeNull must be of type boolean. Type of canBeNull: ${typeof bool}`);


    bool = true;
    result = verifyText(text, maxLength, null, bool);
    expect(result.status).toBe(true);

    bool = false;
    result = verifyText(text, maxLength, null, bool);
    expect(result.status).toBe(true);
});


test('Can text be empty', () => {
    var text = "",
        maxLength = 1,
        result;

    result = verifyText(text, maxLength);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Text can not be empty.`);

    result = verifyText(text, maxLength, null, true);
    expect(result.status).toBe(true);
});


test('Check for the maxLength', () => {
    var text = "Hello world",
        maxLength = 1,
        result;

    result = verifyText(text, maxLength);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Text can not have more than 1 chars. Text length: ${text.length}.`);

    maxLength = Number.MAX_SAFE_INTEGER;
    result = verifyText(text, maxLength);
    expect(result.status).toBe(true);
});


test('Check for the minLength', () => {
    var text = "Hello world!",
        minLength = Number.MAX_SAFE_INTEGER,
        result;

    result = verifyText(text, Number.MAX_SAFE_INTEGER, minLength);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Text must be at least ${minLength} chars long. Text length: ${text.length}.`);

    minLength = 0;
    result = verifyText(text, Number.MAX_SAFE_INTEGER, minLength);
    expect(result.status).toBe(true);
});

test('Check if the text correspondent to the minimum size if it can be null', () => {
    var text = "",
        minLength = 13,
        result;

    result = verifyText(text, Number.MAX_SAFE_INTEGER, minLength, true);
    expect(result.status).toBe(true);


    text = "Hello world!";
    result = verifyText(text, Number.MAX_SAFE_INTEGER, minLength, true);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Text must be at least ${minLength} chars long or be empty. Text length: ${text.length}.`);
});

test('Check text which are correct', () => {
    var text = "Hello world",
        maxLength = 50,
        minLength = 7,
        result;

    result = verifyText(text, maxLength, minLength);
    expect(result.status).toBe(true);
});