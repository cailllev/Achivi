/**
 * @file api-api.js
 *
 * This file handles the table api. The table api contains
 * a key the id of the user and the creation date. In this
 * file we can create, and delete data of the table api.
 */

const utility = require('../utilities/utility');
const logger = require('../utilities/logger');

const database = require('../database/database');

const api = Object.create(null);

/**
 * Generate api key
 *
 * @param {string|number} usr_id
 * @param userAgent
 * @public
 */
api.generateSession = async (usr_id, userAgent) => {
    const pro_name = await api.getProfileNameByUserID(usr_id);
    logger.info(`Generate session_id and api_key for user ${pro_name}`);

    const session_id = utility.uuid();
    await api.deleteSession(usr_id)
        .catch((err) => {
            logger.error(`API API. Generate Session => Database error. ${JSON.stringify(err)}`);
            throw({
                statusCode: 500,
                message: `Could not create api key and session id`
            })
        });

    const s = utility.randomString(Math.random() * 32 + 32);
    const api_key = utility.sha256Hash(s);

    const queryAddAPIKey = `INSERT INTO api VALUES('${api_key}', NOW(), NOW(), '${usr_id}')`;
    const queryAddSessionID = `INSERT INTO session VALUES('${session_id}', '${userAgent}', NOW(), NOW(), '${usr_id}')`;

    const queries = [queryAddAPIKey, queryAddSessionID];

    return new Promise((resolve) => {
        database.transaction(queries, null, false)
            .then(() => {
                logger.debug( `New api key and session id created for user ${pro_name}`);
                return resolve({
                    status: true,
                    message: "New api key and session id created",
                    api_key: api_key,
                    session_id: session_id
                })
            })
            .catch((err) => {
                logger.error(`API API. Generate Session => Database error. ${JSON.stringify(err)}`);
                return resolve({
                    status: false,
                    message: `Could not create api key and session id`
                })
            })
    })
};

api.deleteSession = async (usr_id) => {
    const pro_name = await api.getProfileNameByUserID(usr_id);
    logger.info(`Delete session for user ${pro_name}`);

    const queryDelAPIKey = `DELETE FROM session WHERE usr_id='${usr_id}'`;
    const queryDelSessionID = `DELETE FROM api WHERE usr_id='${usr_id}'`;

    const queries = [queryDelAPIKey, queryDelSessionID];

    return new Promise((resolve, reject) => {
        database.transaction(queries, null, false)
            .then(() => {
                logger.debug( `Session deleted for user ${pro_name}`);
                return resolve({
                    status: true,
                    message: `Session deleted`
                })
            })
            .catch((err) => {
                logger.error(`API API. Delete Session => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not delete session`
                })
            })
    });
};

/**
 *
 * @param id
 * @returns {Promise<String>}
 */
api.getProfileNameByUserID = async id => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name FROM profile NATURAL JOIN user WHERE usr_id='${id}'`, (err, rows) => {
            if (err) {
                logger.error(`API API. Get Profile Name By User ID => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get profile name by user id`
                });
            }

            return resolve(rows.length > 0 ? rows[0].pro_name : null);
        }, null, false);
    });
};

module.exports = {
    generateSession: (usr_id, userAgent) => {
        return api.generateSession(usr_id, userAgent);
    },

    deleteSession: (usr_id) => {
        return api.deleteSession(usr_id);
    }
};