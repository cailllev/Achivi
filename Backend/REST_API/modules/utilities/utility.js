const utility = Object.create(null);

/**
 * Creates a uuid version 4 with length 36
 *
 * @protected
 * @returns {string} uuid
 */
utility.uuid = () => {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
};

/**
 * Creates a random string with length l
 *
 * Source: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
 *
 * @param {int} length
 * @protected
 */
utility.randomString = length => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * Creates a sha256 hash from given string
 *
 * Source: https://nodejs.org/en/knowledge/cryptography/how-to-use-crypto-module/
 *
 * @param {string} toHash
 * @protected
 */
utility.sha256Hash = toHash => {
    return require("crypto").createHash("sha256").update(toHash).digest("hex");
};


/**
 * Returns correct credentials
 *
 * @returns {object} credentials
 * @protected
 * @param req
 */
utility.getCredentials = (req) => {
    let header = req.get('platformid') || req.get('User-Agent');
    return {
        session: req.session,
        header: header
    };
};

module.exports = {
    uuid: () => {
        return utility.uuid();
    },

    sha256Hash: s => {
        return utility.sha256Hash(s);
    },

    randomString: l => {
        return utility.randomString(l);
    },

    cred: (req) => {
        return utility.getCredentials(req);
    }
};