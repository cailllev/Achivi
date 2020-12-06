const verifyEMail = require('../../../modules/utilities/verification').verifyEMail;

//silence all logging while testing
const logger = require('../../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));


test(`Test can be null`, () => {
    var email = null,
        result;

    result = verifyEMail(email, true)
    expect(result.status).toBe(true);

    email = "";
    result = verifyEMail(email, true)
    expect(result.status).toBe(true);
});

test(`Test valid email`, () => {
    var email = "abc@gmail.com";
    var result;

    result = verifyEMail(email, true)
    expect(result.status).toBe(true);
});

test('Test wrong email addresses', () => {
    var email = "foo",
        result;

    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);

    email = "@abc.xyz";
    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);

    email = "abc@xyz";
    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);

    email = "abc@xyz.";
    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);

    email = "abc@xy.z";
    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);

    email = "abc@.xyz";
    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);

    email = "abc@%.xyz";
    result = verifyEMail(email);
    expect(result.status).toBe(false);
    expect(result.message).toBe(`E-Mail-Address is not valid. E-Mail: ${email}`);
});