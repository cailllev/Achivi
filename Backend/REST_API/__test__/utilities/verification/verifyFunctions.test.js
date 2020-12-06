const verification = require('../../../modules/utilities/verification');

//silence all logging while testing
const logger = require('../../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));


test('Check if the module verification contains the functions to test', () => {
    // verifyText    
    expect(verification.hasOwnProperty('verifyText')).toBe(true);
    expect(typeof verification.verifyText).toBe('function');

    // verifyInteger    
    expect(verification.hasOwnProperty('verifyInteger')).toBe(true);
    expect(typeof verification.verifyInteger).toBe('function');

    // verifyDate    
    expect(verification.hasOwnProperty('verifyDate')).toBe(true);
    expect(typeof verification.verifyDate).toBe('function');

    // verifyEmail
    expect(verification.hasOwnProperty('verifyEMail')).toBe(true);
    expect(typeof verification.verifyEMail).toBe('function');

    // verifyJSON
    expect(verification.hasOwnProperty('verifyJSON')).toBe(true);
    expect(typeof verification.verifyJSON).toBe('function');
});