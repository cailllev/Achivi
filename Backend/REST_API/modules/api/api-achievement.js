/**
 * @file api-achievement.js
 *
 * This file handles the table achievements.
 */

const logger = require('../utilities/logger');
const verification = require('../utilities/verification');

const validate = require("../database/validate");
const database = require('../database/database');

const follow = require('../api/api-follower');
const group = require('../api/api-group');

const achievement = Object.create(null);

achievement.createAchievement = async (data, credentials) => {
    logger.debug(`API Achievement. Create new Achievement`);
    logger.debug(`Data: ${JSON.stringify(data)}`);

    /************ VALIDATE RIGHTS ************/
    const user = await validate.getProfileNameByCredentials(credentials);
    const group_admin = await group.getAdminOfGroup(data.groupName, credentials);
    if (user !== group_admin) {
        throw ({
            statusCode: 403,
            message: "Only a group admin can create achievements!"
        });
    }

    /************ VALIDATE NAME ************/
    let verify = verification.verifyText(data.name, 64, 1, false);
    if (!verify.status) {
        logger.debug(`API Achievement. Verify Text 'name' => Verification failed.`);
        throw verify;
    }

    // Name can not be classes => classes is saved for the classes of the achievements
    if (data.name.toLowerCase() === "classes") {
        logger.debug(`API Achievement. Name can not be "classes"`);
        throw ({
            status: false,
            message: `The Name of the achievement can not be ${data.name}`
        });
    }

    // Description
    verify = verification.verifyText(data.description, 256, 5, false);
    if (!verify.status) {
        logger.debug(`API Achievement. Verify Text 'description' => Verification failed.`);
        throw verify;
    }

    /************ VALIDATE GROUP NAME ************/
    if (data.groupName.toLowerCase() === "community") {
        logger.debug(`API Achievement. Group can not be "Community"`);
        throw ({
            statusCode: 403,
            message: "Only devs can create global achievements!"
        })
    }

    /************ VALIDATE USER IS IN GROUP ************/
    await group.checkIsUserInGroup(user, data.groupName, credentials);

    /************ VALIDATE ACHIEVEMENT CLASS ************/
    return new Promise((resolve, reject) => {
        database.query(`SELECT achcl_id as id FROM achievement_class WHERE achcl_name='${data.achClName}'`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Create Achievement => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not validate achievement class '${data.achClName}'`
                });
            }

            if (rows.length !== 1) {
                return reject({
                    statusCode: 412,
                    message: `Achievement class '${data.achClName}' does not exist`
                });
            }

            resolve(rows[0].id);
        }, credentials);
    })
        .then(achcl_id => {
            logger.debug(`API Achievement. Achievement Class Id: ${achcl_id}`);

            /************ Insert into database ************/
            return new Promise((resolve, reject) => {
                database.query(`INSERT INTO achievement VALUES (NULL, '${data.name}', '${data.description}', NOW(), NOW(), ${achcl_id}, '${data.groupName}');`, (err, rows) => {
                    if (err) {
                        logger.error(`API Achievement. Create Achievement => Database error. ${JSON.stringify(err)}`);
                        return reject({
                            statusCode: 500,
                            message: `Could not create achievement '${data.name}'`
                        });
                    }

                    logger.debug(`Achievement ${data.name} successfully created`);
                    // Success
                    resolve({
                        status: true,
                        message: `Achievement ${data.name} successfully created`,
                        id: rows.insertId
                    });
                }, credentials);
            });
        });

}

achievement.getAllClasses = credentials => {
    logger.debug(`API Achievement. Get all classes for the Achievements`);

    return new Promise((resolve, reject) => {
        database.query(`SELECT achcl_name AS name FROM achievement_class ORDER BY achcl_points`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get All Classes => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get classes for the achievements`
                });
            }

            resolve(rows);
        }, credentials);
    });
}

/**
 * remove an achievement of a group
 *
 * @param id
 * @param credentials
 * @returns {Promise<String>}
 */
achievement.deleteAchievement = async (id, credentials) => {
    const name = await validate.getProfileNameByCredentials(credentials);
    const group_name = await achievement.getGroupOfAchievement(id, credentials);

    if (group_name === "Community") {
        throw ({
            statusCode: 403,
            message: "Only devs can delete global achievements!"
        });
    }

    const group_admin = await group.getAdminOfGroup(group_name, credentials);
    if (name !== group_admin) {
        throw ({
            statusCode: 403,
            message: "Only a group admin can delete achievements!"
        });
    }

    await group.checkIsUserInGroup(name, group_name, credentials);

    return new Promise((resolve, reject) => {
        database.query(`DELETE FROM achievement WHERE ach_id=${id}`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Delete Achievement => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not delete achievement with id ${id}`
                });
            }

            if (rows.affectedRows === 0) {
                logger.debug(`API Achievement. Unable to delete achievement, no achievement with id ${id} found`);

                return resolve({
                    status: false,
                    message: `No achievement with id ${id} found`
                })
            }

            return resolve({
                status: true,
                message: `Achievement with id ${id} successfully deleted`
            });
        }, credentials);
    });
};

achievement.sqlGetQueryGroup = (group, profileName) => {
    return `
        SELECT 
        CONVERT(ach_id, char) as id, 
        ach_name as achievement_name, 
        ach_description as achievement_description, 
        gro_name as group_name, 
        achcl_name as class_name, 
        CONVERT(achcl_points, char) as achievement_points, 
        achca_name as category_name, 
        achca_description as category_description, 
        fla_created_at as flagged,
	achge_created_at as claimed
        FROM 
            (SELECT * FROM 
                (SELECT * FROM achievement WHERE gro_name = '${group}') as achievement_info 
                NATURAL JOIN 
                achievement_class 
                LEFT JOIN 
                (SELECT 
                    ach_id as foreign_ach_id, 
                    achca_name, 
                    achca_description 
                FROM 
                    achievement_has_category 
                    NATURAL JOIN 
                    achievement_category 
                ) as category_info 
                ON achievement_info.ach_id = category_info.foreign_ach_id 
            ) as achievement_complete 
            LEFT JOIN 
            (SELECT ach_id as foreign_ach_id, fla_created_at FROM flag_achievement WHERE pro_name='${profileName}') as flagged 
            ON achievement_complete.ach_id = flagged.foreign_ach_id
            LEFT JOIN 
            (SELECT ach_id as foreign_ach_id, achge_created_at FROM achievement_get WHERE pro_name='${profileName}') as claimed 
            ON achievement_complete.ach_id = claimed.foreign_ach_id`;
};

achievement.sqlGetQueryCategory = (category, profileName) => {
    return `
        SELECT 
        CONVERT(ach_id, char) as id, 
        ach_name as achievement_name, 
        ach_description as achievement_description, 
        gro_name as group_name, 
        achcl_name as class_name, 
        CONVERT(achcl_points, char) as achievement_points, 
        achca_name as category_name, 
        achca_description as category_description, 
        fla_created_at as flagged 
        FROM 
	        (SELECT * FROM 
                (SELECT * FROM achievement_has_category WHERE achca_name = '${category}') as achievement_in_category 
                NATURAL JOIN 
                achievement_category 
                NATURAL JOIN 
                achievement 
                NATURAL JOIN 
                achievement_class 
            ) as achievement_complete 
            LEFT JOIN 
            (SELECT ach_id as foreign_ach_id, fla_created_at FROM flag_achievement WHERE pro_name='${profileName}') as flagged 
            ON achievement_complete.ach_id = flagged.foreign_ach_id`;
};

achievement.sqlGetQueryUser = (user) => {
    return `
        SELECT 
        CONVERT(ach_id, char) as id, 
        ach_name as achievement_name, 
        ach_description as achievement_description, 
        gro_name as group_name, 
        achcl_name as class_name, 
        CONVERT(achcl_points, char) as achievement_points, 
        achca_name as category_name, 
        achca_description as category_description 
        FROM 
            (SELECT * FROM 
                (SELECT * FROM achievement_get WHERE pro_name='${user}') as user_achievement 
                NATURAL JOIN 
                achievement 
                NATURAL JOIN 
                achievement_class) as achievement_info 
            LEFT JOIN 
                (SELECT 
                    ach_id as foreign_ach_id, 
                    achca_name, 
                    achca_description 
                FROM 
                    achievement_has_category 
                NATURAL JOIN 
                achievement_category 
                ) as category_info 
            ON achievement_info.ach_id = category_info.foreign_ach_id`;
};

achievement.sqlGetQueryUserFlag = (user) => {
    return `
        SELECT 
        CONVERT(ach_id, char) as id, 
        ach_name as achievement_name, 
        ach_description as achievement_description, 
        gro_name as group_name, 
        achcl_name as class_name, 
        CONVERT(achcl_points, char) as achievement_points, 
        achca_name as category_name, 
        achca_description as category_description 
        FROM 
            (SELECT * FROM 
                (SELECT * FROM flag_achievement WHERE pro_name='${user}') as user_flag 
                NATURAL JOIN 
                achievement 
                NATURAL JOIN 
                achievement_class 
            ) as achievement_info 
            LEFT JOIN 
                (SELECT 
                    ach_id as foreign_ach_id, 
                    achca_name, 
                    achca_description 
                FROM 
                    achievement_has_category 
                NATURAL JOIN 
                achievement_category 
                ) as category_info 
            ON achievement_info.ach_id = category_info.foreign_ach_id`;
};

achievement.sqlGetQueryID = (id) => {
    return `
        SELECT 
        CONVERT(ach_id, char) as id, 
        ach_name as achievement_name, 
        ach_description as achievement_description, 
        gro_name as group_name, 
        achcl_name as class_name, 
        CONVERT(achcl_points, char) as achievement_points, 
        achca_name as category_name, 
        achca_description as category_description 
        FROM 
            (SELECT * FROM 
                (SELECT * FROM achievement WHERE ach_id='${id}') as achievement_from_id 
                NATURAL JOIN 
                achievement_class 
            ) as achievement_info 
            LEFT JOIN 
                (SELECT 
                    ach_id as foreign_ach_id, 
                    achca_name, 
                    achca_description 
                FROM 
                    achievement_has_category 
                NATURAL JOIN 
                achievement_category 
                ) as category_info 
            ON achievement_info.ach_id = category_info.foreign_ach_id`;
};

achievement.sqlGetQueryPoints = (user) => {
    return `
        SELECT 
        CONVERT(SUM(achcl_points), char) as points
        FROM 
            (SELECT * FROM achievement_get WHERE pro_name='${user}') as user_achievement 
            NATURAL JOIN 
            achievement 
            NATURAL JOIN 
            achievement_class`;
}

/**
 * returns all achievements of a category
 *
 * @param category      the name of the category
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.getAllAchievementsByCategory = async (category, credentials) => {
    logger.debug(`API Achievement. Get All Achievement By Category: ${category}`);

    const own_pro_name = await validate.getProfileNameByCredentials(credentials);

    return new Promise((resolve, reject) => {
        database.query(`${achievement.sqlGetQueryCategory(category, own_pro_name)} ORDER BY ach_name`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get All Achievement By Category => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get achievements by category ${category}`
                });
            }

            if (!rows) {
                logger.debug(`No Achievements found with category ${category}`);
                return resolve({
                    status: false,
                    message: `No Achievements found with category ${category}`
                });
            }

            logger.debug(`Get All Achievements By Category. ${rows.length} Achievements found.`);

            return resolve({
                status: true,
                message: rows
            });
        }, credentials);
    });
};

/**
 * returns all achievements of a group
 *
 * @param group         the name of the group
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.getAllAchievementsByGroup = async (group, credentials) => {
    logger.debug(`API Achievement. Get All Achievement By Group: ${group}`);

    const own_pro_name = await validate.getProfileNameByCredentials(credentials);

    return new Promise((resolve, reject) => {
        database.query(`${achievement.sqlGetQueryGroup(group, own_pro_name)} ORDER BY ach_name`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get All Achievement By Group => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get achievements by group ${group}`
                });
            }

            if (!rows) {
                logger.debug(`No Achievements found with group ${group}`);
                return resolve({
                    status: false,
                    message: `No Achievements found with group ${group}`
                });
            }

            logger.debug(`Get All Achievements By Group. ${rows.length} Achievements found.`);

            return resolve({
                status: true,
                message: rows
            });
        }, credentials);
    });
};

/**
 * returns an achievement by id
 *
 * @param id
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.getAchievementById = (id, credentials) => {
    logger.debug(`API Achievement. Get Achievement By Id. Id: ${id}`);

    // Verify status
    const verify = verification.verifyInteger(id, 0);
    if (!verify.status) {
        throw (verify);
    }

    id = verify.parsedNumber;
    logger.debug(`Id parsed and verified.`);

    return new Promise((resolve, reject) => {
        database.query(`${achievement.sqlGetQueryID(id)}`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get Achievement By Id => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get achievement by id ${id}`
                });
            }

            if (!rows || rows.length < 1) {
                logger.debug(`No Achievements found with the id ${id}`);
                return resolve({
                    status: false,
                    message: `No Achievements found with the id ${id}`
                });
            }

            logger.debug(`Achievement '${rows.achievement_name}' found`);

            return resolve(rows[0]);
        }, credentials);
    });
};

/**
 * returns all claimed achievements from caller
 *
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.getAllAchievementsOfUser = async (credentials) => {
    const pro_name = await validate.getProfileNameByCredentials(credentials);
    logger.debug(`API Achievement. Get all Achievements of user with name ${pro_name}`);

    return new Promise((resolve, reject) => {
        database.query(`${achievement.sqlGetQueryUser(pro_name)}`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get All Achievements for user ${pro_name} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get achievements for user ${pro_name}`
                });
            }

            logger.debug(`API Achievement. Get All Achievements of user with name: ${pro_name}. ${rows.length} Achievements found.`);

            return resolve(rows);
        }, credentials);
    });
};

/**
 * returns all flagged achievements from caller
 *
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.getAllFlaggedAchievementsOfUser = async (credentials) => {
    const pro_name = await validate.getProfileNameByCredentials(credentials);
    logger.debug(`API Achievement. Get all Flagged Achievements of user with name ${pro_name}`);

    return new Promise((resolve, reject) => {
        database.query(`${achievement.sqlGetQueryUserFlag(pro_name)}`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get All Flagged Achievements for user ${pro_name} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get flagged achievements for user ${pro_name}`
                });
            }

            logger.debug(`API Achievement. Get All Flagged Achievements of user with name: ${pro_name}. ${rows.length} flagged Achievements found.`);

            return resolve(rows);
        }, credentials);
    });
};


/**
 * flags the achievement for the caller
 *
 * @param id            the id of the achievement
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.flagAchievement = async (id, credentials) => {
    const pro_name = await validate.getProfileNameByCredentials(credentials);
    logger.debug(`API Achievement. Flag Achievement with id ${id}`);

    // get group of achievement
    const groupName = await achievement.getGroupOfAchievement(id, credentials);

    // check if user is in group only if not community
    if (groupName.toLowerCase() !== 'community') {
        await group.checkIsUserInGroup(pro_name, groupName, credentials);
    }

    return new Promise((resolve, reject) => {
        database.query(`INSERT INTO flag_achievement VALUES('${pro_name}', '${id}', NOW(), NOW())`, (err) => {
            if (err) {
                logger.error(`API Achievement. Flag Achievement ${id} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not flag achievement ${id} for user ${pro_name}`
                });
            }

            logger.debug(`API Achievement. Flagged achievement ${id} for user ${pro_name}`);

            return resolve({
                status: true,
                message: `Flagged achievement ${id} for user ${pro_name}`
            });
        }, credentials);
    });
};

/**
 * deflags the achievement for the caller
 *
 * @param id            the id of the achievement
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.deflagAchievement = async (id, credentials) => {
    const pro_name = await validate.getProfileNameByCredentials(credentials);
    logger.debug(`API Achievement. Deflag Achievement with id ${id}`);

    return new Promise((resolve, reject) => {
        database.query(`DELETE FROM flag_achievement WHERE ach_id='${id}' AND pro_name='${pro_name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Deflag Achievement ${id} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not deflag achievement ${id} for user ${pro_name}`
                });
            }

            if (rows.affectedRows > 0) {
                logger.debug(`API Achievement. Deflagged achievement ${id} for user ${pro_name}`);

                return resolve({
                    status: true,
                    message: `Deflagged achievement ${id} for user ${pro_name}`
                })
            }

            logger.debug(`Achievement ${id} for user ${pro_name} was not flagged`);
            return resolve({
                status: false,
                message: `Achievement ${id} for user ${pro_name} was not flagged`
            })
        }, credentials);
    });
};

/**
 * get all achievement points of profile, only works if profile is own or friends
 *
 * @param profileName       name of profile to get points
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.getPoints = async (profileName, credentials) => {
    logger.debug(`API Achievement. Get Points for profile ${profileName}`);
    const own_pro_name = await validate.getProfileNameByCredentials(credentials);

    // only works if own profile or friends profile
    if (own_pro_name === profileName) {
        logger.debug(`API Achievement. Get Points for own profile`);

    } else if ((await follow.isFriendsWith(own_pro_name, profileName, credentials)).status) {
        logger.debug(`API Achievement. Get Points for friends profile ${profileName}`);

    } else {
        logger.debug(`API Achievement. Cannot get points for strangers profile ${profileName}`);
        throw ({
            statusCode: 403,
            message: `Cannot get points for stranger profile ${profileName}`
        });
    }

    return new Promise((resolve, reject) => {
        database.query(achievement.sqlGetQueryPoints(profileName), (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get Achievement Points for ${profileName} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Get Achievement Points for ${profileName}`
                });
            }

            logger.debug(`Got ${rows[0].points} for profile ${profileName}`);
            return resolve(rows[0].points);
        }, credentials);
    });
};

/**
 * claim an achievement
 *
 * @param id            the id of the achievement
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.claimAchievement = async (id, credentials) => {
    const pro_name = await validate.getProfileNameByCredentials(credentials);
    logger.debug(`API Achievement. Claim Achievement with id ${id}`);

    // get group of achievement
    const groupName = await achievement.getGroupOfAchievement(id, credentials);

    // check if user is in group
    logger.debug(pro_name + " " + groupName);
    await group.checkIsUserInGroup(pro_name, groupName, credentials);

    return new Promise((resolve, reject) => {
        database.query(`INSERT INTO achievement_get VALUES('${pro_name}', '${id}', NOW(), NOW())`, (err) => {
            if (err) {
                logger.error(`API Achievement. Claim Achievement for ${pro_name} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not claim achievements for user ${pro_name}`
                });
            }

            logger.debug(`API Achievement. Claimed achievement ${id} for user ${pro_name}`);

            resolve();
        }, credentials)
            /*.then(() => {
                return new Promise((resolve) => {
                    resolve(achievement.deflagAchievement(id, credentials));
                })*/
            .then(() => {
                return resolve({
                    status: true,
                    message: `Claimed Achievement ${id} for user ${pro_name}`
                });
            })
        /*})*/
    });
};

/**
 * declaims the achievement for the caller
 *
 * @param id            the id of the achievement
 * @param credentials
 * @returns {Promise<unknown>}
 */
achievement.declaimAchievement = async (id, credentials) => {
    const pro_name = await validate.getProfileNameByCredentials(credentials);
    logger.debug(`API Achievement. Declaim Achievement with id ${id}`);

    return new Promise((resolve, reject) => {
        database.query(`DELETE FROM achievement_get WHERE ach_id='${id}' AND pro_name='${pro_name}'`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Declaim Achievement ${id} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not declaim achievement ${id} for user ${pro_name}`
                });
            }

            if (rows.affectedRows > 0) {
                logger.debug(`API Achievement. Declaimed achievement ${id} for user ${pro_name}`);

                return resolve({
                    status: true,
                    message: `Declaimed achievement ${id} for user ${pro_name}`
                })
            }

            logger.debug(`Achievement ${id} for user ${pro_name} was not claimed`);
            return resolve({
                status: false,
                message: `Achievement ${id} for user ${pro_name} was not claimed`
            })
        }, credentials);
    });
};

/**
 * get the name of the group from the achievement with id
 *
 * @param id
 * @param credentials
 * @returns {Promise<String>}
 */
achievement.getGroupOfAchievement = async (id, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT gro_name as name FROM achievement WHERE ach_id='${id}'`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Get Group Of Achievement => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not read group of achievement with id ${id}`
                });
            }

            if (rows.length === 0) {
                logger.debug(`No group for achievement with id ${id} found`);
                return reject({
                    statusCode: 412,
                    message: `No group for achievement with id ${id} found`
                })
            }

            return resolve(rows[0].name);
        }, credentials)
    });
}


module.exports = {
    createAchievement: (data, credentials) => {
        return achievement.createAchievement(data, credentials);
    },

    getAllClasses: (credentials) => {
        return achievement.getAllClasses(credentials);
    },

    getAllAchievementsByCategory: (category, credentials) => {
        return achievement.getAllAchievementsByCategory(category, credentials);
    },

    getAllAchievementsByGroup: (group, credentials) => {
        return achievement.getAllAchievementsByGroup(group, credentials);
    },

    getAchievementById: (id, credentials) => {
        return achievement.getAchievementById(id, credentials);
    },

    deleteAchievement: (id, credentials) => {
        return achievement.deleteAchievement(id, credentials);
    },

    getAllAchievementsOfUser: (credentials) => {
        return achievement.getAllAchievementsOfUser(credentials);
    },

    getAllFlaggedAchievementsOfUser: (credentials) => {
        return achievement.getAllFlaggedAchievementsOfUser(credentials);
    },

    getPoints: (profileName, credentials) => {
        return achievement.getPoints(profileName, credentials);
    },

    claimAchievement: (id, credentials) => {
        return achievement.claimAchievement(id, credentials);
    },

    declaimAchievement: (id, credentials) => {
        return achievement.declaimAchievement(id, credentials);
    },

    flagAchievement: (id, credentials) => {
        return achievement.flagAchievement(id, credentials);
    },

    deflagAchievement: (id, credentials) => {
        return achievement.deflagAchievement(id, credentials);
    }
};
