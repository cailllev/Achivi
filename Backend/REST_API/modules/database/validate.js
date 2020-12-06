const verification = require('../utilities/verification');
const logger = require('../utilities/logger');

const con = require('./database-connection');

const validate = Object.create(null);

validate.checkCredentialJSON = async (credentials, callback) => {
    const sessionVerification = await verification.verifyJSON(credentials.session, ["session_id", "api_key"], true);
    if (!sessionVerification.status) {
        logger.error(`Validate. Get Profile Name By Credentials => JSON Verification Error. ${JSON.stringify(sessionVerification)}`);

        // if there is a callback --> return false and do callback()
        if (callback) {
            logger.debug(`User is not authorized to run this query.`);
            callback({
                statusCode: 401,
                message: "ACCESS DENIED"
            });
            return false;
        } else {
            throw (sessionVerification);
        }
    }
}

/**
 *
 * @param credentials
 * @returns {Promise<unknown>}
 * @protected
 */
validate.getUserIDByCredentials = async credentials => {
    await validate.checkCredentialJSON(credentials);

    return new Promise((resolve, reject) => {
        con.query(`SELECT usr_id FROM session WHERE sesn_id='${credentials.session.session_id}' AND sesn_userAgent='${credentials.header}'`, (err, rows) => {
            if (err) {
                logger.error(`Validate. Get UserID By Credentials => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get user id`
                });
            }

            return resolve(rows.length > 0 ? rows[0].usr_id : null);
        });
    });
};

/**
 *
 * @param credentials
 * @returns {Promise<String>}
 */
validate.getProfileNameByCredentials = async credentials => {
    logger.debug(`Get profile name by credentials: ${Object.keys(credentials)}`);
    await validate.checkCredentialJSON(credentials);

    return new Promise((resolve, reject) => {
        con.query(`SELECT pro_name FROM profile NATURAL JOIN session WHERE sesn_id='${credentials.session.session_id}' AND sesn_userAgent='${credentials.header}'`, (err, rows) => {
            if (err) {
                logger.error(`Validate. Get Profile Name By Credentials => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get profile name by credentials`
                });
            }
            logger.debug('Got user name: ' + (rows.length > 0 ? rows[0].pro_name : "null"));
            return resolve(rows.length > 0 ? rows[0].pro_name : null);
        });
    });
};

/**
 *
 * @param credentials       credentials to be checked --> {session: {session_id: "uuidv4", api_key: "sha256"}, header: "??"}
 * @param callback          behavior on not authenticated
 * @returns {Promise<*>}
 * @protected
 */
validate.authentication = async (credentials, callback) => {
    await validate.checkCredentialJSON(credentials, callback);

    try {
        if (!(await validate.validateRequest(credentials)).status) {
            logger.debug(`User is not authorized to run this query.`);
            callback({
                statusCode: 401,
                message: "ACCESS DENIED"
            });
            return false;
        }
    } catch (e) {
        callback(e);
        return false;
    }
    return true;
};

/**
 * validates if the user is authenticated
 *
 * @returns {Promise<{message: string, status: boolean}>}
 * @param credentials
 * @protected
 */
validate.validateRequest = async (credentials) => {
    const session_id = credentials.session.session_id;
    const api_key = credentials.session.api_key;

    //first get usr_id from session_id, then get api_key for usr_id
    const usr_id = await validate.getUserIDByCredentials(credentials);
    if (!usr_id) {
        throw ({
            statusCode: 401,
            message: "Could not verify user, no api key found"
        });
    }
    let db_api_key = await validate.getAPIKey(usr_id);
    if (!db_api_key || db_api_key.length !== 1) {
        logger.debug(`User with session id ${session_id} not authenticated for queries, request denied`);
        throw ({
            statusCode: 401,
            message: "Could not verify user, no api key found"
        })
    }
    db_api_key = db_api_key[0]; //select first


    //finally, compare the api_key from session and the api_key from db
    if (api_key !== db_api_key.api_key) {
        throw ({
            statusCode: 401,
            message: "User is not authenticated!"
        });
    }

    return {
        status: true,
        message: 'User is authenticated'
    };
};

/**
 * Send api key
 *
 * @param {unknown} usr_id
 * @protected
 */
validate.getAPIKey = usr_id => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT api_key FROM api WHERE usr_id='${usr_id}'`, (err, rows) => {
            if (err) {
                logger.error(`Validate. Get APIKey => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get api key`
                });
            }

            return resolve(rows);
        });
    });
};

module.exports = {
    getUserIDByCredentials: credentials => {
        return validate.getUserIDByCredentials(credentials);
    },

    getProfileNameByCredentials: credentials => {
        return validate.getProfileNameByCredentials(credentials);
    },

    authentication: (credentials, callback) => {
        return validate.authentication(credentials, callback);
    }
};