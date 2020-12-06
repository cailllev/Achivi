const verifyInteger = require('../../../modules/utilities/verification').verifyInteger;

//silence all logging while testing
const logger = require('../../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));


test('Check if figure is integer or can be parsed', () => {
    var figure = "asdf",
        result;

    try {
        result = verifyInteger(figure);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`);


    figure = "a2";
    try {
        result = verifyInteger(figure);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`);



    figure = "2.3";
    try {
        result = verifyInteger(figure);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`);


    figure = "2a";
    try {
        result = verifyInteger(figure);
    } catch (e) {
        result = e;
    }

    expect(result.statusCode).toBe(412);
    expect(result.message).toBe(`Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`);


    figure = "2";
    result = verifyInteger(figure);
    expect(result.status).toBe(true);
});

test('Check if figure can be null', () => {
    var figure = null,
        result;

    result = verifyInteger(figure);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be null. Figure: ${figure}`);

    result = verifyInteger(figure, null, null, true);
    expect(result.status).toBe(true);


    figure = "";
    result = verifyInteger(figure);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be null. Figure: ${figure}`);

    result = verifyInteger(figure, null, null, true);
    expect(result.status).toBe(true);
});

test('Check min', () => {
    var figure = 7,
        min = figure,
        result;

    result = verifyInteger(figure, min);
    expect(result.status).toBe(true);


    min = figure + 1;
    result = verifyInteger(figure, min);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be lower than the min value. Figure: ${parseInt(figure)} | Min: ${min}`);


    figure = null;
    result = verifyInteger(figure, min, null, true);
    expect(result.status).toBe(true);

    figure = min - 1;
    result = verifyInteger(figure, min, null, true);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be lower than the min value or must be empty. Figure: ${parseInt(figure)} | Min: ${min}`);

    // Negative numbers
    figure = -13;
    min = figure;
    result = verifyInteger(figure, min);
    expect(result.status).toBe(true);

    min = figure + 1;
    result = verifyInteger(figure, min);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be lower than the min value. Figure: ${parseInt(figure)} | Min: ${min}`);

    figure = min - 1;
    result = verifyInteger(figure, min, null, true);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be lower than the min value or must be empty. Figure: ${parseInt(figure)} | Min: ${min}`);
});

test('Check max', () => {
    var figure = 7,
        max = figure,
        result;

    result = verifyInteger(figure, null, max);
    expect(result.status).toBe(true);


    max = figure - 1;
    result = verifyInteger(figure, null, max);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be higher than the max value. Figure: ${parseInt(figure)} | Max: ${max}`);


    figure = null;
    result = verifyInteger(figure, null, max, true);
    expect(result.status).toBe(true);


    figure = max + 1;
    result = verifyInteger(figure, null, max, true);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be higher than the max value or must be empty. Figure: ${parseInt(figure)} | Max: ${max}`);

    // Negative numbers
    figure = -13;
    max = figure;
    result = verifyInteger(figure, null, max);
    expect(result.status).toBe(true);

    max = figure - 1;
    result = verifyInteger(figure, null, max);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be higher than the max value. Figure: ${parseInt(figure)} | Max: ${max}`);

    figure = max + 1;
    result = verifyInteger(figure, null, max, true);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`Figure can not be higher than the max value or must be empty. Figure: ${parseInt(figure)} | Max: ${max}`);
});

test('Check numbers', () => {
    var figure = 7,
        min = figure,
        max = figure,
        result;

    result = verifyInteger(figure, min, max);
    expect(result.status).toBe(true);

    figure = null;
    result = verifyInteger(figure, min, max, true);
    expect(result.status).toBe(true);


    figure = -7;
    min = figure - 1;
    max = figure + 1;
    result = verifyInteger(figure, min, max);
    expect(result.status).toBe(true);


    figure = 0;
    min = figure - 1;
    max = figure + 1;
    result = verifyInteger(figure, min, max);
    expect(result.status).toBe(true);
});