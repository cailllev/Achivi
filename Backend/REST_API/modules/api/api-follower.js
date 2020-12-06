/**
 * @file api-follower.js
 *
 * This file handles the table follow.
 */

const verification = require('../utilities/verification');
const database = require('../database/database');
const logger = require('../utilities/logger');
const validate = require('../database/validate');

const follower = Object.create(null);

/**
 * add entry so that own profile now follows followeeProfileName
 *
 * @param data              containing attribute followeeProfileName, the name to follow
 * @param credentials
 * @returns {Promise<unknown>}
 */
follower.addNewFollowee = async (data, credentials) => {
    const sessionVerification = verification.verifyJSON(data, ["followeeProfileName"], true);
    if (!sessionVerification.status) {
        throw ({
            statusCode: 403,
            message: "No profile name to follow found!"
        })
    }

    const follower_pro_name = await validate.getProfileNameByCredentials(credentials);
    const followee_pro_name = data.followeeProfileName;

    // Check if the profile to follow exists
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name FROM profile WHERE pro_name='${followee_pro_name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Profile. Add New Follower => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read if profile name ${followee_pro_name} exists`
                });
            }
            rows.length > 0 ? resolve() : reject();
        }, credentials);
    })

        // if exists, try to create entry in follow
        .then(() => {
            return new Promise(((resolve, reject) => {
                database.query(`INSERT INTO follow VALUES ('${followee_pro_name}', '${follower_pro_name}', NOW(), NOW())`, (err) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            // Dont throw an error if it already exists. => Return true
                            return resolve({
                                status: true,
                                message: `${follower_pro_name} is already following ${followee_pro_name}.`
                            });
                        }

                        // Throw error if not duplicate
                        logger.error(`API Profile. Add New Follower => Database error. ${JSON.stringify(err)}`);
                        return reject({
                            statusCode: 500,
                            message: `Creation of entry with followee ${followee_pro_name} and follower ${follower_pro_name} failed`
                        });
                    }
                    logger.info(`Creation of entry with followee ${followee_pro_name} and follower ${follower_pro_name} completed`);
                    return resolve({
                        status: true,
                        message: `${follower_pro_name} is now following ${followee_pro_name}.`
                    });
                }, credentials);
            }));
        })

        // profile to follow not found --> 404
        .catch(() => {
            logger.error(`API Profile. Add New Follower => Profile ${followee_pro_name} not found`);
            throw({
                statusCode: 404,
                message: `Could not find profile ${followee_pro_name}`
            });
        })
};

/**
 * See if caller follows otherUser and vice-versa --> are friends
 *
 * @param caller        the caller, your own profile name
 * @param otherUser     the other users profile name
 * @param credentials
 * @returns {Promise<{message: string, status: boolean}>}
 */
follower.isFriendsWith = async (caller, otherUser, credentials) => {

    const own_pro_name = await validate.getProfileNameByCredentials(credentials);
    if (own_pro_name !== caller) {
        throw({
            statusCode: 403,
            message: `Only allowed for yourself`
        })
    }

    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name FROM profile 
        NATURAL JOIN 
            (SELECT * FROM 
                (SELECT pro_name_followee AS pro_name 
                FROM follow 
                WHERE pro_name_follower = '${caller}') as follower 
            WHERE follower.pro_name = '${otherUser}') 
        as friend`, (err, rows) => {
            if (err) {
                logger.error(`API Follow. Is Friends With => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get is friend of profile ${otherUser}`
                });
            }

            if (rows.length > 0) {
                return resolve({
                    status: true,
                    message: `${caller} and ${otherUser} are friends`
                });
            }

            return resolve({
                status: false,
                message: `${caller} and ${otherUser} are not friends`
            })
        }, credentials);
    });
}

/**
 * Friends are profiles following each other
 *
 * @param name              name of profile to get friends of
 * @param credentials
 * @returns {Promise<Object<{
 *              type: [
 *                  {profile_name: "Hans", profile_picture: "AgR4(P", folloing_since: "01.01.2020"}
 *              ]}
 *          >>}
 */
follower.getFriends = async (name, credentials) => {

    const own_pro_name = await validate.getProfileNameByCredentials(credentials);

    return new Promise((resolve, reject) =>  {
        if (own_pro_name !== name) {
            return reject({
                statusCode: 403,
                message: `Request forbidden for other users`
            });
        }

        database.query(`SELECT pro_name, pro_picture, fol_created_at FROM profile 
        NATURAL JOIN 
        (SELECT * FROM 
            (SELECT pro_name_followee AS pro_name, fol_created_at 
                FROM follow 
                WHERE pro_name_follower = '${name}') 
            as followees 
            NATURAL JOIN 
            (SELECT pro_name_follower AS pro_name 
                FROM follow 
                WHERE pro_name_followee = '${name}' 
            ) as followers 
        ) as friends`, (err, rows) => {
            if (err) {
                logger.error(`API Follow. Get Friends of Profile => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get friends of profile ${name}`
                });
            }
            return resolve(rows);
        }, credentials);
    }).then(rows => {
        return follower.toJSON(rows, "friend")
    });
};


/**
 * get all members that follow the profile
 *
 * @param name              X follows <name>, Y follows <name>
 * @param credentials
 * @returns {Promise<{}>}
 */
follower.getFollowersOfProfile = (name, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name, pro_picture, fol_created_at
        FROM follow
        RIGHT JOIN profile
        ON pro_name_follower = pro_name
        WHERE pro_name_followee='${name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Follow. Get Followers Of Profile => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get followers of profile ${name}`
                });
            }
            return resolve(rows);
        }, credentials);
    }).then(rows => {
        return follower.toJSON(rows, "follower");
    });
};

/**
 * get all members the profile follows
 *
 * @param name              <name> follows X, <name> follows Y
 * @param credentials
 * @returns {Promise<{}>}
 */
follower.getFolloweesOfProfile = (name, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name, pro_picture, fol_created_at
        FROM follow
        RIGHT JOIN profile
        ON pro_name_followee = pro_name
        WHERE pro_name_follower='${name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Follow. Get Followees Of Profile => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get followees of profile ${name}`
                });
            }
            return resolve(rows);
        }, credentials);
    }).then(rows => {
        return follower.toJSON(rows, "followee");
    });
};

/**
 * remove a followee
 *
 * @param followee_pro_name     <name> follows X --> <name> does not follow X
 * @param credentials
 * @returns {Promise<unknown>}
 */
follower.deleteFollowee = async (followee_pro_name, credentials) => {
    const follower_pro_name = await validate.getProfileNameByCredentials(credentials);

    return new Promise(((resolve, reject) => {
        database.query(`DELETE FROM follow WHERE pro_name_follower='${follower_pro_name}' AND pro_name_followee='${followee_pro_name}'`, (err, rows) => {
            if (err) {
                logger.error(`Deletion of entry with followee ${followee_pro_name} and follower ${follower_pro_name} failed`);
                logger.debug(`${JSON.stringify(err)}`);
                return reject(err);
            }

            if (rows.affectedRows === 0) {
                logger.error(`Cant delete non existing entry of followee ${followee_pro_name} and follower ${follower_pro_name}`);
                return resolve({
                    status: false,
                    message: `${follower_pro_name} didnt follow ${followee_pro_name}.`
                });
            }

            logger.info(`Deletion of entry with followee ${followee_pro_name} and follower ${follower_pro_name} completed`);
            return resolve({
                status: true,
                message: `${follower_pro_name} is no longer following ${followee_pro_name}.`
            });
        }, credentials);
    }));
};

/**
 * see if <followerName> follows <followeeName>
 *
 * @param followeeName      the followee's name
 * @param followerName      the follower's name
 * @param credentials
 * @returns {Promise<unknown>}
 */
follower.getIsFollower = (followeeName, followerName, credentials) => {
    logger.debug(`Get is ${followerName} following ${followeeName}`);
    return new Promise((resolve, reject) => {
        database.query(`SELECT *
        FROM follow
        WHERE (pro_name_followee="${followeeName}" AND pro_name_follower="${followerName}")`, (err, rows) => {
            if (err) {
                logger.error(`API Follow. Get Is Followers => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read if ${followerName} is follower of profile`
                });
            }
            return resolve(rows);
        }, credentials);
    })
        .then(rows => {
            if (rows.length > 0) {
                return {
                    status: true,
                    message: `${followerName} is following ${followeeName}`
                };
            }
            return {
                status: false,
                message: `${followerName} is not following ${followeeName}`
            };
        });
};

/**
 * adding all objects (profiles) in array, prepend type of objects (follower)
 *
 * @param array
 * @param type
 * @returns {Object<{"type": [{profile_name: "Hans", profile_picture: "AgR4(P", folloing_since: "01.01.2020"}]}>}
 */
follower.toJSON = (array, type) => {
    let formattedArray = [];
    let i;
    for (i = 0; i < array.length; i++) {
        let obj = Object.create(null);
        obj.profile_name = array[i].pro_name;
        obj.profile_picture = array[i].pro_picture;
        obj.following_since = array[i].fol_created_at;
        formattedArray[i] = obj;
    }

    let formattedResult = {};
    formattedResult = { ...formattedResult, [type]: formattedArray };
    return formattedResult;
};

module.exports = {
    getFollowers: (name, credentials) => {
        return follower.getFollowersOfProfile(name, credentials);
    },

    getFollowees: (name, credentials) => {
        return follower.getFolloweesOfProfile(name, credentials);
    },

    isFriendsWith: (caller, otherUser, credentials) => {
        return follower.isFriendsWith(caller, otherUser, credentials);
    },

    getFriends: (name, credentials) => {
        return follower.getFriends(name, credentials);
    },

    isFollower: (followeeName, followerName, credentials) => {
        return follower.getIsFollower(followeeName, followerName, credentials);
    },

    addFollowee: (data, credentials) => {
        return follower.addNewFollowee(data, credentials);
    },

    deleteFollowee: (name, credentials) => {
        return follower.deleteFollowee(name, credentials);
    }
};
