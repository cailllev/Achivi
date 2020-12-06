/**
 * @file api-database-group.js
 *
 * This file handles the table group_member and usergroup.
 */

const logger = require('../utilities/logger');
const verification = require('../utilities/verification');

const database = require('../database/database');
const follow = require('./api-follower');

const group = Object.create(null);

/**
 * Get a user by email
 *
 * @protected
 * @param caller        the profile name of the caller
 * @param data          contains group name and members (if any)
 * @param credentials
 */
group.createGroup = async (caller, data, credentials) => {
    const jsonVerification = verification.verifyJSON(data, ["groupName", "members"], true);
    if (!jsonVerification.status) {
        throw (
            jsonVerification
        );
    }

    const admin = caller;
    const group_name = data.groupName;
    const members = data.members;

    if (group_name.toLowerCase() === "community" || (group_name.toLowerCase() === "test_group" && !credentials.header.startsWith("axios"))) {
        logger.debug(`Only devs can create group 'Community' or 'test_group'`);
        throw ({
            statusCode: 403,
            message: `Cannot create group ${group_name}, reserved name`
        });
    }

    const queryCreateUsergroup = `INSERT INTO usergroup VALUES('${group_name}', NOW(), NOW(), '${admin}')`;
    const queryAddGroupAdmin = `INSERT INTO group_member VALUES('${caller}', '${group_name}', 'admin', NOW(), NOW())`;
    const queries = [queryCreateUsergroup, queryAddGroupAdmin];

    return new Promise((resolve, reject) => {
        database.transaction(queries, credentials)
            //transaction worked --> group created, admin set and category set
            .then(() => {
                logger.debug(`Created group ${group_name} and set admin to ${caller}`);

                return new Promise((resolve) => {
                    // wait until add members resolves

                    return resolve(group.addMembers(admin, group_name, members, credentials));
                })

                    .then((result) => {
                        //**************************** SUCCESS *********************************//
                        if (result.status) {
                            return resolve({
                                status: true,
                                message: `Group ${group_name} created and all members added to group, admin set to ${admin}`
                            });

                        //gets here if some members could not be added
                        } else {
                            return resolve({
                                status: false,
                                message: `Group successfully created but some members could not be added\n${result.message}`,
                                usersUnableToAdd: result.usersUnableToAdd,
                                usersForbiddenToAdd: result.usersForbiddenToAdd
                            });
                        }
                    });
            })

            //transaction failed, gets here on rollback
            .catch((err) => {
                logger.error(`API Group. Create Group => Database error. ${JSON.stringify(err)}`);
                return reject({
                    status: false,
                    message: "Could not create group"
                })
            })
    });
};

/**
 * Adds members to a group
 *
 * @param caller            profile name of the caller
 * @param groupName         group name to add members
 * @param usersToAdd        list of the users to be added
 * @param credentials
 */
group.addMembers = async (caller, groupName, usersToAdd, credentials) => {
    await group.checkGroupExits(groupName, credentials);

    const group_admin = await group.getAdminOfGroup(groupName, credentials);
    if (caller !== group_admin) {
        throw ({
            statusCode: 403,
            message: "Only an admin can add members to their group"
        })
    }

    logger.debug(`Members: ${usersToAdd}`);

    // if members are string, try parsing them to List
    if (typeof usersToAdd === 'string') {
        try {
            usersToAdd = JSON.parse(usersToAdd);
        } catch (e) {
            logger.debug(`Could not parse members: ${usersToAdd}`);
            throw({
                statusCode: 400,
                message: "Bad Request, members attribute must be \"[user_name_1, user_name_2, ...]\")"
            })
        }
    }
    logger.debug(`Successfully parsed members: ${JSON.stringify(usersToAdd)}`);

    // now members must be an array, else throw 400
    if (typeof usersToAdd !== 'object' || !(usersToAdd instanceof Array)) {
        logger.debug(`Members are not an array: ${JSON.stringify(usersToAdd)}`);
        throw({
            statusCode: 400,
            message: "Bad Request, members attribute must be \"[user_name_1, user_name_2, ...]\")"
        })
    }
    logger.debug(`Successfully checked parsed type of members: ${typeof usersToAdd}`);

    let usersOkToAdd = [];
    let usersForbiddenToAdd = [];

    const followersOfAdminAsObjectList = (await follow.getFollowers(group_admin, credentials)).follower;

    let followersOfAdmin = [];
    followersOfAdminAsObjectList.forEach((follower) => { followersOfAdmin.push(follower.profile_name) });


    logger.debug(followersOfAdmin);

    for (const userToAdd of usersToAdd) {

        logger.debug(usersToAdd);

        // check if userToAdd follows admin --> ok to add
        const isFollower = (await follow.isFollower(caller, userToAdd, credentials)).status;
        if (isFollower) {
            usersOkToAdd.push(userToAdd);
            continue;
        }

        // check if userToAdd follows a follower of admin --> ok to add
        let isFollowerOfFollowerOfAdmin;
        for (const followerOfAdmin of followersOfAdmin) {
            if ((await follow.isFollower(followerOfAdmin, userToAdd, credentials)).status) {
                isFollowerOfFollowerOfAdmin = true;
                break;
            }
        }

        if (isFollowerOfFollowerOfAdmin) {
            usersOkToAdd.push(userToAdd);
            continue;
        }

        // user is not following admin and is not following a follower of admin --> not ok to add
        usersForbiddenToAdd.push(userToAdd);
    }


    //resolves if every promise in promises resolve(), rejects if one promise in promises reject()
    return new Promise((resolve) => {

        // create promises and push them into a list
        let promises = [];
        let usersUnableToAdd = [];
        usersOkToAdd.forEach(user =>
            promises.push(
                new Promise((resolve) => {
                    logger.debug(`Preparing to add member ${user} to group ${groupName}`);
                    database.query(`INSERT INTO group_member VALUES('${user}', '${groupName}', 'member', NOW(), NOW())`, (err) => {
                        if (err) {
                            usersUnableToAdd.push(user);
                        }
                        return resolve();
                    }, credentials)
                })
            )
        );

        //execute all promises, then returns resolve if all members were added or returns reject if at least one member could not be added
        Promise.all(promises)
            .then(() => {
                if (usersUnableToAdd.length === 0 && usersForbiddenToAdd.length === 0) {
                    logger.debug(`All users added to group ${groupName}`);
                    return resolve({
                        status: true,
                        message: `All users added to group ${groupName}`
                    });
                } else {
                    logger.debug(`Users ${usersUnableToAdd} unable to be added to group ${groupName}`);
                    logger.debug(`Users ${usersForbiddenToAdd} forbidden to be added to group ${groupName}`);
                    return resolve({
                        status: false,
                        message: `Users '${usersUnableToAdd}' unable to be added to group\nUsers '${usersForbiddenToAdd}' forbidden to be added to group ${groupName}`,
                        usersUnableToAdd: usersUnableToAdd,
                        usersForbiddenToAdd: usersForbiddenToAdd
                    });
                }
            })
    });
};

/**
 * Sets the Admin of a group
 *
 * @protected
 * @param caller        profile name of the caller, has to be the old admin
 * @param admin_new     the new admin
 * @param groupName     the name of the group where the admin changes
 * @param credentials
 */
group.setAdminOfGroup = async (caller, admin_new, groupName, credentials) => {
    await group.checkGroupExits(groupName, credentials);

    const current_admin = await group.getAdminOfGroup(groupName, credentials);
    if (current_admin === admin_new){
        return {
            status: true,
            message: `${admin_new} is already admin of group`
        }
    }

    if (caller !== current_admin) {
        throw ({
            statusCode: 403,
            message: "Only an admin can assign the new admin"
        })
    }

    try {
        await group.checkIsUserInGroup(admin_new, groupName, credentials);
    } catch (e) {
        logger.debug(`New admin ${admin_new} is not yet in group ${groupName}, add him to group first.`);
        e.message += ". Add them to group before setting them to admin";
        throw (e);
    }

    const queryUsergroupChangeAdmin = `UPDATE usergroup SET gro_updated_at=NOW(), gro_admin='${admin_new}' WHERE gro_name='${groupName}'`;
    const querySetOldAdminToMember = `UPDATE group_member SET grome_priv='member', grome_updated_at=NOW() WHERE gro_name='${caller}'`;
    const querySetMemberToNewAdmin = `UPDATE group_member SET grome_priv='admin', grome_updated_at=NOW() WHERE gro_name='${admin_new}'`;
    const queries = [queryUsergroupChangeAdmin, querySetOldAdminToMember, querySetMemberToNewAdmin];

    return new Promise((resolve, reject) => {
        database.transaction(queries, credentials)
            .then(() => {
                logger.info(`Admin successfully changed in group ${groupName} from ${caller} to ${admin_new}`);
                return resolve({
                    status: true,
                    message: "Admin successfully changed"
                })
            })
            .catch((err) => {
                logger.error(`API Group. Set Admin Of Group => Database error. ${JSON.stringify(err)}`);
                return reject({
                    status: false,
                    message: "Admin could not be changed"
                })
            })
    })
};

/**
 * Gets the admin of a group
 *
 * @param groupName
 * @param credentials
 * @returns {Promise<String>}
 */
group.getAdminOfGroup = async (groupName, credentials) => {
    await group.checkGroupExits(groupName, credentials);

    return new Promise((resolve, reject) => {
        database.query(`SELECT gro_admin FROM usergroup WHERE gro_name='${groupName}'`, (err, rows) => {
            if (err) {
                logger.error(`API Group. Get Admin Of Group => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not get admin of group ${groupName}`
                });
            }

            logger.debug(`Get Admin of group with name ${groupName} successful, admin is ${rows.length > 0 ? rows[0].gro_admin : null}`);
            return resolve(rows.length > 0 ? rows[0].gro_admin : null);
        }, credentials);
    });
};

/**
 * Deletes a group by name
 *
 * @protected
 * @param caller        profile name of the caller
 * @param groupName     group name of the group to be deleted
 * @param credentials
 */
group.deleteGroup = async (caller, groupName, credentials) => {
    await group.checkGroupExits(groupName, credentials);

    const group_admin = await group.getAdminOfGroup(groupName, credentials);
    if (group_admin !== caller) {
        logger.debug(`Only an admin can delete their group`);
        throw ({
            statusCode: 403,
            message: "Only an admin can delete their group"
        })
    }

    return new Promise((resolve, reject) => {
        database.query(`DELETE FROM usergroup WHERE gro_name='${groupName}'`, (err, rows) => {
            if (err) {
                logger.error(`API Group. Delete Group => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Deletion of group ${groupName} failed`
                });
            }

            if (rows.affectedRows === 0) {
                logger.debug(`API Group. Group ${groupName} could not be deleted.`);

                return resolve({
                    status: false,
                    message: `Group ${groupName} could not be deleted.`
                })


            } else {
                logger.info(`Deletion of group with name ${groupName} successful`);
                return resolve({
                    status: true,
                    message: `Deletion of group successful`
                })
            }
        }, credentials)
    });
};

/**
 * removes a group member
 *
 * only the admin can remove other members
 * normal users only can remove themselves
 * the admin cannot be removed
 *
 * @param caller                the user that wants to remove someone
 * @param memberToBeRemoved     the user to be removed
 * @param groupName             the name of the group
 * @param credentials
 * @returns {Promise<unknown>}
 */
group.removeGroupMember = async (caller, memberToBeRemoved, groupName, credentials) => {
    await group.checkGroupExits(groupName, credentials);

    const group_admin = await group.getAdminOfGroup(groupName, credentials);
    if (memberToBeRemoved === group_admin) {
        logger.debug("The admin cannot be removed from a group");
        throw ({
            statusCode: 403,
            message: "The admin cannot be removed, give admin to someone else first"
        })
    }

    if (caller !== group_admin && caller !== memberToBeRemoved) {
        logger.debug("Only an admin can remove other members");
        throw ({
            statusCode: 403,
            message: "Only an admin can remove other members"
        })
    }

    return new Promise((resolve, reject) => {
        database.query(`DELETE FROM group_member WHERE gro_name='${groupName}' AND pro_name='${memberToBeRemoved}'`, (err, rows) => {
            if (err) {
                logger.error(`API Group. Remove Group Member => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not remove member ${memberToBeRemoved} from group ${groupName}`
                });
            }

            if (rows.affectedRows === 0) {
                logger.debug(`API Group. User ${memberToBeRemoved} was not in group ${groupName}`);

                return resolve({
                    status: false,
                    message: `User ${memberToBeRemoved} was not in group ${groupName}`
                })
            }

            logger.info(`User ${memberToBeRemoved} removed from group ${groupName}`);
            return resolve({
                status: true,
                message: `User ${memberToBeRemoved} removed from group ${groupName}`
            })
        }, credentials);
    });
};

/**
 * gets all members of a group, only works if caller is member
 *
 * @param caller            the caller
 * @param groupName         the group in question
 * @param credentials
 * @returns {Promise<void>}
 */
group.getAllMembers = async (caller, groupName, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name as name, grome_priv as privilege FROM group_member WHERE gro_name='${groupName}'`, (err, rows) => {
            if (err) {
                logger.error(`API Group. Get All Members => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read members of group ${groupName}`
                });
            }

            // check if caller is a member, if not member, caller is not in rows --> throw error 403, FORBIDDEN
            if (!(rows.find(member => member.name === caller))) {
                return reject({
                    statusCode: 403,
                    message: `Can only see members of groups you are a member, caller ${caller}, group ${groupName}`
                })
            }

            return resolve({
                status: rows.length > 0,
                message: rows
            });
        }, credentials);
    });
};

/**
 *
 * @param caller                    the caller
 * @param userNameInGroups          the user that the caller wants to see the groups
 * @param credentials
 * @returns {Promise<unknown>}
 */
group.getAllGroupsOfUser = async (caller, userNameInGroups, credentials) => {

    //if userNameInGroups is empty or equal to caller, get ownGroups
    //else get groups of userNameInGroups without members
    let ownGroups = false;
    if (userNameInGroups === "" || userNameInGroups === null || caller === userNameInGroups) {
        ownGroups = true;
        userNameInGroups = caller;
    }

    return new Promise((resolve, reject) => {
        database.query(`SELECT gro_name as name FROM group_member WHERE pro_name='${userNameInGroups}'`, (err, rows) => {
            if (err) {
                logger.error(`API Group. Get All Groups Of User => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: 500,
                    message: `Could not read groups of ${caller}`
                });
            }

            logger.debug(`User ${caller} is in groups ${JSON.stringify(rows)}`);

            let promises = [];
            rows.forEach((row) => {
                promises.push(
                    new Promise((resolve) => {
                        if (ownGroups) {
                            resolve(group.getAllMembers(caller, row.name, credentials))
                        } else {
                            resolve({
                                message: []
                            })
                        }
                    })
                        .then((result) => {

                            //add members to the group
                            row.members = result.message;
                        })
                );
            });

            Promise.all(promises)
                .then(() => {

                    return resolve({
                        status: rows.length > 0,
                        message: rows
                    })
                })

        }, credentials);
    });
};

/**
 * checks if user is in group, throws error if not in group
 *
 * @param user          the profile name
 * @param group         the group name
 * @param credentials
 * @returns
 */
group.checkIsUserInGroup = async (user, group, credentials) => {
    if (group.toLowerCase() === "community") {
        return;
    }


    return new Promise((resolve, reject) => {
        database.query(`SELECT * FROM group_member WHERE pro_name='${user}' AND gro_name='${group}'`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Check Is User In Group; User: ${user}, Group: ${group} => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not read if user ${user} is in group '${group}'`
                });
            }

            if (rows.length === 0) {
                logger.debug(`User ${user} is not in group ${group}`);
                return reject({
                    statusCode: 403,
                    message: `User ${user} is not in group ${group}`
                });
            }

            return resolve();
        }, credentials)
    });
};

/**
 * checks if user is in group, throws error if not in group
 *
 * @param groupName     the name of the group
 * @param credentials
 * @returns {Promise<unknown>}
 */
group.checkGroupExits = async (groupName, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT * FROM usergroup WHERE gro_name='${groupName}'`, (err, rows) => {
            if (err) {
                logger.error(`API Achievement. Check Group Exists => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not read if group '${groupName}' exists`
                });
            }

            if (rows.length === 0) {
                logger.debug(`Group ${groupName} does not exist`);
                return reject({
                    statusCode: 403,
                    message: `Group ${groupName} does not exist`
                });
            }

            return resolve();
        }, credentials)
    });
};


/**
* exports
*/
module.exports = {
    createGroup: (caller, data, credentials) => {
        return group.createGroup(caller, data, credentials);
    },

    setAdminOfGroup: (admin_old, admin_new, groupName, credentials) => {
        return group.setAdminOfGroup(admin_old, admin_new, groupName, credentials);
    },

    getAdminOfGroup: (groupName, credentials) => {
        return group.getAdminOfGroup(groupName, credentials);
    },

    addMembers: (caller, groupName, membersToAdd, credentials) => {
        return group.addMembers(caller, groupName, membersToAdd, credentials);
    },

    deleteGroup: (caller, groupName, credentials) => {
        return group.deleteGroup(caller, groupName, credentials);
    },

    removeGroupMember: (caller, memberToBeRemoved, groupName, credentials) => {
        return group.removeGroupMember(caller, memberToBeRemoved, groupName, credentials);
    },

    getAllMembers: (caller, groupName, credentials) => {
        return group.getAllMembers(caller, groupName, credentials);
    },

    getAllGroupsOfUser: (caller, userNameInGroups, credentials) => {
        return group.getAllGroupsOfUser(caller, userNameInGroups, credentials);
    },

    checkIsUserInGroup: (user, groupName, credentials) => {
        return group.checkIsUserInGroup(user, groupName, credentials);
    }
};