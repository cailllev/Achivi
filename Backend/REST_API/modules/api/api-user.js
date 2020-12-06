/**
 * @file api-user.js
 *
 * This file handles the table user, session and api.
 */

const logger = require('../utilities/logger');
const verification = require('../utilities/verification');

const validate = require('../database/validate');
const database = require('../database/database');

const api = require('./api-api');
const profile = require('./api-profile');
const utl = require('../utilities/utility');

const user = Object.create(null);
const salt_length = 8;

/**
 * Adds a user and a profile
 *
 * @protected
 * @param data
 */
user.register = async data => {
    const jsonValidation = verification.verifyJSON(data, ["email", "password", "profileName", "birthDate", "firstName", "lastName"], true);
    if (!jsonValidation.status) {
        logger.debug('Cannot register a new user, missing attributes');
        throw ({
            statusCode: 412,
            message: 'Cannot register a new user, missing attributes'
        });
    }

    const emailValidation = verification.verifyEMail(data.email);
    if (!emailValidation.status) {
        logger.debug('Cannot register a new user, not a valid email');
        throw ({
            statusCode: 412,
            message: jsonValidation.message
        });
    }

    const emailUsed = await user.userEmailUsed(data.email);
    if (emailUsed.status) {
        logger.debug('Cannot register a new user, email is taken');
        return {
            status: false,
            message: "Email is already used"
        };
    }

    const nameUsed = await profile.isProfileNameUsed(data.profileName).status;
    if (nameUsed) {
        logger.debug('Cannot register a new user, profileName is taken');
        return {
            status: false,
            message: "Profile name is already used"
        };
    }

    const given_email = data.email;
    const given_pwd = data.password;

    const textVerification = verification.verifyText(given_pwd, 64, 10, false);
    if (!textVerification.status) {
        logger.debug("Password is too short");
        return {
            status: false,
            message: textVerification.message
        };
    }

    const birthDateVerification = verification.verifyDate(data.birthDate);
    if (!birthDateVerification.status) {
        return {
            birthDateVerification
        }
    }

    // Get correct birthDate format
    data.birthDate = birthDateVerification.dbDate;

    logger.info(`Register a new user with email ${data.email} and profile name ${data.profileName}`);

    const uuid = utl.uuid();
    const salt = utl.randomString(salt_length);
    const pwd_hash = utl.sha256Hash(given_pwd + salt);

    const queryAddNewUser = `INSERT INTO user VALUES('${uuid}', '${given_email}', '${pwd_hash}', '${salt}', NOW(), NOW())`;
    const queryAddNewProfile = profile.addProfileQuery(data, uuid);
    const queries = [queryAddNewUser, queryAddNewProfile];

    return new Promise((resolve) => {
        database.transaction(queries, null, false)
            .then(() => {
                logger.debug(`Created user with email ${given_email}`);
                return resolve({
                    status: true,
                    message: "Successfully created user"
                })
            })
            .catch((err) => {
                logger.error(`API User. Register => Database error. ${JSON.stringify(err)}`);
                return resolve({
                    status: false,
                    message: "Could not create user"
                })
            })
    });
};

/**
 * Logs a user in
 *
 * @protected
 * @param data          contains email and password
 * @param credentials
 */
user.login = async (data, credentials) => {

    logger.debug(`API User. Login. Data: ${JSON.stringify(data)}`);

    const jsonVerification = verification.verifyJSON(data, ["email", "password"], true);
    if (!jsonVerification.status) {
        throw ({
            statusCode: 412,
            message: jsonVerification.message
        });
    }

    const given_email = data.email;
    const given_pwd = data.password;
    const given_userAgent = credentials.header;

    const emailValidation = verification.verifyEMail(given_email);
    if (!emailValidation.status) {
        throw ({
            statusCode: 412,
            message: emailValidation.message
        });
    }

    let db_user = await user.getUserByEmail(given_email);

    let passwords_match;

    if (!db_user || db_user.length !== 1) {
        // do not return here, possibility of security problems (return times --> possible to get emails)
        passwords_match = false;

    } else {
        db_user = db_user[0]; // select first
        const db_salt = db_user.usr_salt;
        const db_pwd_hash = db_user.usr_pwd;
        const pwd_hash_calc = utl.sha256Hash(given_pwd + db_salt);

        passwords_match = pwd_hash_calc === db_pwd_hash;
    }

    // Check if password matches
    if (passwords_match) {
        const session_info = await api.generateSession(db_user.usr_id, given_userAgent);
        const jsonVerification = verification.verifyJSON(session_info, ["session_id", "api_key"], true);

        if (jsonVerification.status) {
            const session_id = session_info.session_id;
            const api_key = session_info.api_key;

            logger.info(`User ${given_email} has successfully logged in`);

            return {
                status: true,
                message: "User has successfully logged in",
                session_id: session_id,
                api_key: api_key
            };
        }
    }

    return {
        status: false,
        message: "Wrong email or password!"
    };
};

user.logout = async (credentials) => {
    const usr_id = await validate.getUserIDByCredentials(credentials);
    return await api.deleteSession(usr_id);
};

/**
 * Get a user by email
 *
 * @param {string} email
 * @protected
 */
user.getUserByEmail = email => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT * FROM user WHERE usr_email='${email}'`, (err, rows) => {
            if (err) {
                logger.error(`API User. Get User By Email => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get user by email ${email}`
                });
            }
            return resolve(rows);
        }, null, false);
    });
};

/**
 * Check if email is already used
 *
 * @param {string} email
 * @protected
 */
user.userEmailUsed = email => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT * FROM user WHERE usr_email='${email}'`, (err, rows) => {
            if (err) {
                logger.error(`API User. User Email Used => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read if email ${email} is used`
                });
            }
            return resolve(
                {
                    status: rows.length > 0
                });
        }, null, false);
    });
};

/**
 * Deletes a user by ID
 *
 * @protected
 * @param id
 */
user.deleteUser = id => {
    return new Promise((resolve, reject) => {
        database.query(`DELETE FROM user WHERE usr_id='${id}'`, (err) => {
            if (err) {
                logger.error(`API User. Delete User => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not delete user`
                });
            }
            logger.info(`Deletion of user with id ${id} successful`);
            return resolve({
                status: true,
                message: `User with id ${id} successfully deleted`
            });
        });
    });
};

/**
 * @param email_old
 * @param email_new
 * @param credentials
 *
 * @protected
 */
user.updateUserEmail = (email_old, email_new, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`UPDATE user SET usr_email='${email_new}', usr_updated_at=NOW() WHERE usr_email='${email_old}'`, (err) => {
            if (err) {
                logger.error(`API User. Update User Email => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not update users email`
                });
            }
            return resolve({
                status: true,
                message: `Changed email successfully from ${email_old} to ${email_new}`
            });
        }, credentials);
    });
};

/**
 * exports
 */
module.exports = {
    register: data => {
        return user.register(data);
    },

    login: (data, credentials) => {
        return user.login(data, credentials);
    },

    logout: (credentials) => {
        return user.logout(credentials);
    },

    userEmailUsed: usr_email => {
        return user.userEmailUsed(usr_email);
    },

    updateUserEmail: (email_old, email_new, credentials) => {
        return user.updateUserEmail(email_old, email_new, credentials);
    },

    // DELETE WHEN GO LIVE
    delUser: (email, credentials) => {
        return user.delUser(email, credentials);
    }
};


// DELETE WHEN GO LIVE
user.delUser = async (email, credentials) => {
    const own_pro_name = await validate.getProfileNameByCredentials(credentials);

    if (!own_pro_name || own_pro_name === ""){
        throw({
            statusCode: 412,
            message: "User not existing"
        })
    }

    return new Promise((resolve, reject) => {
        database.query(`SELECT usr_email FROM user NATURAL JOIN profile WHERE pro_name='${own_pro_name}'`, (err, rows) => {
            if (err) {
                return reject({
                    statusCode: 500,
                    message: `Could not delete user with email: ${email}. => Database error. ${JSON.stringify(err)}`
                });
            }

            if (rows.length > 0) {
                return resolve(rows[0].usr_email);
            } else {
                logger.debug(`No user found with email: ${email}. Canceled Deletion`)
                return reject({
                    statusCode: 412,
                    message: `No user found with email: ${email}. Canceled Deletion`
                });
            }
        }, credentials);
    })
        .then((db_email) => {
            if (db_email !== email) {
                logger.debug("You cannot delete other users")
                throw({
                    statusCode: 403,
                    message: "You cannot delete other users"
                })
            }

            return new Promise((resolve, reject) => {
                database.query(`DELETE FROM user WHERE usr_email='${email}'`, (err) => {
                    if (err) {
                        return reject({
                            statusCode: 500,
                            message: `Could not delete user with email: ${email}. => Database error. ${JSON.stringify(err)}`
                        });
                    }
                    return resolve({
                        status: true,
                        message: `User successfully deleted`
                    });
                }, credentials);
            });
        });
}