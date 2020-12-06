/**
 * @file api-profile.js
 *
 * This file handles the table profile.
 */

const logger = require('../utilities/logger');
const verification = require('../utilities/verification');

const validate = require("../database/validate");
const database = require('../database/database');
const apiFollower = require('./api-follower');

let profile = Object.create(null);

/**
 * Get Profile by name
 *
 * @params {string} profile_name, {object} credentials
 * @returns object {access, profile_name, bio, firstname, lastname, birthdate, picture}
 * @public
 */
profile.getProfile = async (name, credentials) => {
    const own_pro_name = await validate.getProfileNameByCredentials(credentials);

    let accessRight;
    if ((own_pro_name === name)) {
        accessRight = "owner";
    } else if ((await apiFollower.isFriendsWith(own_pro_name, name, credentials)).status) {
        accessRight = "friends";
    } else {
        accessRight = "guest";
    }

    logger.debug(`Getting profile with name ${name}, with access right: ${accessRight}`);
    return profile.retrieveProfile(name, credentials, accessRight);
};

/**
 * Get Own Profile
 *
 * @params {object} credentials
 * @returns object {access, profile_name, bio, firstname, lastname, birthdate, picture}
 * @public
 */
profile.getOwnProfile = async (credentials) => {
    const name = await validate.getProfileNameByCredentials(credentials);
    return profile.retrieveProfile(name, credentials, 'owner');
};

/**
 * Retrieve Profile
 *
 * @params {string} profile_name, {object} credentials, {string} accessRight
 * @returns object {access, profile_name, bio, firstname, lastname, birthdate, picture}
 * @protected
 */
profile.retrieveProfile = (name, credentials, accessRight) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT * FROM profile WHERE pro_name='${name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Profile. Get Profile => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get profile ${name}`
                });
            }
            return resolve(rows);
        }, credentials);
    }).then(rows => {
        logger.debug(`ROWS: ${JSON.stringify(rows)}`);
        if (rows.length < 1) {
            throw ({
                statusCode: 413,
                message: 'No profile found'
            });
        }
        return profile.toJSON(rows, accessRight);
    });
};

/**
* Only returns the query to create a new Profile, only gets called at register
*
* @params {object} data, {string} user_id
* @public
*/
profile.addProfileQuery = (data, user_id) => {
    logger.info(`Adding new profile for user with name ${data.profileName}`);
    return `INSERT INTO profile VALUES ('${data.profileName}', '${data.birthDate}', '${data.firstName}', '${data.lastName}', '', '', NOW(), NOW(), '${user_id}')`
};

/**
 * Update existing Profile
 *
 * @param {string} name
 * @param {object} req
 * @param credentials
 * @public
 */
profile.updateProfile = async (name, req, credentials) => {
    //check if its own profile
    let own_profile_name = await validate.getProfileNameByCredentials(credentials);
    if (name !== own_profile_name) {
        throw ({
            statusCode: 403,
            message: "Permission denied, not own profile!"
        });
    }

    if (!verification.verifyJSON(req, ["birthDate", "firstName", "lastName", "bio", "picture"], true).status) {
        throw ({
            statusCode: 412,
            message: "Data incorrect. Bad request!"
        });
    }

    return new Promise((resolve, reject) => {
        database.query(`UPDATE profile
        SET pro_birth_date='${req.birthDate}', pro_firstname='${req.firstName}', pro_lastname='${req.lastName}', pro_bio='${req.bio}', pro_picture='${req.profile_picture}'
        WHERE pro_name='${name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Follow. Get Members => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not update profile ${name}`
                });
            }
            return resolve(rows);
        }, credentials);
    }).then(() => {
        return profile.getOwnProfile(credentials);
    });
};

/**
 * ckecks if profile name is already used by another user
 *
 * @public
 * @param profile_name
 */
profile.profileNameUsed = (profile_name) => {
    logger.debug(`Looking for profile name ${profile_name} already taken`);
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name FROM profile WHERE pro_name='${profile_name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Profile. Profile Name Used => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read if profile name ${profile_name} used`
                });
            }

            return resolve({
                status: rows.length > 0
            });
        }, null, false);
    });
};

/**
 * searches for profile names like "name"
 *
 * %name% == row.contains(name)
 * https://www.w3schools.com/SQL/sql_like.asp
 *
 * @public
 * @param query
 * @param credentials
 */
profile.searchForProfileName = async (query, credentials) => {
    let searchString = `%${query.q}%`;
    let limit = query.limit || 15;
    let findMySelf = query.findMySelf === 'true';
    findMySelf = findMySelf ? `` : `AND pro_name<>'${(await validate.getProfileNameByCredentials(credentials))}'`;

    logger.debug(`API Profile. Run query => SearchString: ${searchString} | limit: ${limit} | findMySelf: ${findMySelf}`);

    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name as name FROM profile WHERE (pro_name LIKE '${searchString}' ${findMySelf}) LIMIT ${limit}`, (err, rows) => {
            if (err) {
                logger.error(`API Profile. Search For Profile Name => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read profile names like ${searchString}`
                });
            }
            logger.debug(`API Profile. Search For Profile Name => search results count = ${rows.length}`)

            return resolve({
                status: rows.length > 0,
                message: rows
            });
        }, credentials);
    });
};

/**
 * toJSON
 *
 * @params {object} data, {string] accessRights
 * @returns {object}
 * @protected
 */
profile.toJSON = (data, accessRight) => {
    let sqlProfile = data[0];
    logger.debug(`Profile to JSON: ${sqlProfile.pro_name}`);

    let formattedProfile = Object.create(null);

    switch (accessRight) {
        case "owner":
            formattedProfile.access = 'owner';
            formattedProfile.birthdate = sqlProfile.pro_birth_date;
            formattedProfile.bio = sqlProfile.pro_bio;
            formattedProfile.firstname = sqlProfile.pro_firstname;
            formattedProfile.lastname = sqlProfile.pro_lastname;
            break;
        case "friends":
            formattedProfile.access = 'friends';
            formattedProfile.bio = sqlProfile.pro_bio;
            formattedProfile.firstname = sqlProfile.pro_firstname;
            formattedProfile.lastname = sqlProfile.pro_lastname;
            break;
        default:
            formattedProfile.access = 'guest';
    }

    formattedProfile.profile_name = sqlProfile.pro_name;
    formattedProfile.profile_picture = sqlProfile.pro_picture;

    return formattedProfile;
};

module.exports = {
    getProfile: (profile_name, credentials) => {
        return profile.getProfile(profile_name, credentials);
    },
    getOwnProfile: credentials => {
        return profile.getOwnProfile(credentials);
    },
    addProfileQuery: (req, user_id) => {
        return profile.addProfileQuery(req, user_id);
    },
    updateProfile: (name, req, credentials) => {
        return profile.updateProfile(name, req, credentials);
    },
    isProfileNameUsed: (profile_name) => {
        return profile.profileNameUsed(profile_name);
    },
    searchForProfileName: (query, credentials) => {
        return profile.searchForProfileName(query, credentials);
    }
};
