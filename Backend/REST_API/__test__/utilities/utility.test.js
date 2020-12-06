const utility = require('../../modules/utilities/utility');

//silence all logging while testing
const logger = require('../../modules/utilities/logger');
logger.transports.forEach((t) => (t.silent = true));

test(`testing uuid`, () => {
    const uuid = utility.uuid();
    expect(uuid.length).toBe(36);
});

test('testing length of random string function', () => {
    for (let i = 0; i < 1000; i++){
        const salt = utility.randomString(8);
        expect(salt.length).toBe(8);
    }
});

test('testing length of sha function', () => {
    for (let i = 0; i < 1000; i++){
        const pwd = utility.randomString(Math.random() * 256);
        const pwd_hash = utility.sha256Hash(pwd);
        expect(pwd_hash.length).toBe(64);
    }
});

test('testing sha256_hash with & without salt', () => {
    for (let i = 0; i < 1000; i++){
        const pwd = "0123456789abcdef";
        const salt = utility.randomString(8);
        const pwd_hash = utility.sha256Hash(pwd);
        const pwd_salt_hash = utility.sha256Hash(pwd + salt);

        //check length of hash (always to be 64)
        expect(pwd_hash.length).toBe(64);
        expect(pwd_salt_hash.length).toBe(64);

        //check that pwd_salt_hash indeed is different from pwd_hash
        expect(pwd_hash).not.toEqual(pwd_salt_hash);
    }
});

test('testing credentials return', () => {
    const req = {
        session: {
            session_id: 'dummy id',
            api_key: 'dummy key'
        }
    }

    req.get = (() => {
        return null
    });

    const result = utility.cred(req);

    expect(result).toStrictEqual({
        session: req.session,
        header: null
    })
})