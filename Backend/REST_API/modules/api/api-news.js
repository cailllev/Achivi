/**
 * @file api-news.js
 *
 * This file handles the creation of news.
 */

const logger = require('../utilities/logger');

const validate = require('../database/validate');
const database = require('../database/database');

const group = require('./api-group');
const follow = require('./api-follower');

const news = Object.create(null);

const minDate = "1970-01-01";

/*** own news ***/
const newFollower = (user) => {return `Benutzer ${user} folgt dir.`;}
const newFollowee = (user) => {return `Du folgst nun Benutzer ${user}.`;}

const globalAchievementGet = (achievementName) => {return `Du hast Achievement ${achievementName} erreicht.`;}
const globalAchievementFriendsGet = (friend, achievement_name) => {return `${friend} hat ${achievement_name} errreicht.`;}

/*** group news ***/
const groupJoin = (user, groupName) => {return `Benutzer ${user} ist der Gruppe ${groupName} beigetreten.`;}
const groupAdminSwitch = (user, groupName) => {return `Benutzer ${user} ist nun Admin der Gruppe ${groupName}.`;}

const groupAchievementNew = (achievementName) => {return `Neues Achievement ${achievementName} zur Gruppe hinzugefügt.`;}
const groupAchievementGetSelf = (achievementName) => {return `Du hast das Achievement ${achievementName} erreicht.`;}
const groupAchievementGetOther = (user, achievementName) => {return `Benutzer ${user} hat das Achievement ${achievementName} errreicht.`;}

/**
 * Get all news of own user
 *
 * @param timestamp
 * @param credentials
 * @protected
 * @returns {Object<
 *              { news:
 *                  {
 *                      follower_news: [
 *                          {
 *                              text: "Benutzer ... folgt dir nun",
 *                              link: "profile_name",
 *                              date: "DATE from DB"
 *                          },
 *                      ],
 *                      followee_news: [
 *                          {
 *                              text: "Du folgst nun ...",
 *                              link: "profile_name",
 *                              date: "DATE from DB"
 *                          },
 *                      ],
 *                      achievement_news:
 *                          {
 *                              friends_achievements:
 *                                  [
 *                                      {
 *                                          text: "... hat Achievement ... erreicht",
 *                                          link: "achievement_id",
 *                                          date: "DATE from DB"
 *                                      },
 *                                      {
 *                                          text: "... hat Achievement ... erreicht",
 *                                          link: "achievement_id",
 *                                          date: "DATE from DB"
 *                                      }
 *                                  ],
 *                              own_achievements:
 *                                  [
 *                                      {
 *                                          text: "Du hast Achievement ... erreicht",
 *                                          link: "achievement_id",
 *                                          date: "DATE from DB"
 *                                      },
 *                                      {
 *                                          text: "Du hast Achievement ... erreicht",
 *                                          link: "achievement_id",
 *                                          date: "DATE from DB"
 *                                      }
 *                                  ]
 *                          }
 *                  },
 *               last_updated: "YYYY-MM-DD hh:mm:ss"
 *               }
 *           >}
 */
news.getNews = async (timestamp, credentials) => {
    const startTime = news.getDateTime();

    if (!timestamp || timestamp === "" || timestamp === "0" || timestamp === 0) {
        timestamp = minDate;
    }

    const own_profile_name = await validate.getProfileNameByCredentials(credentials);

    /****************** FOLLOWER ******************/
    const followerNewsRaw = await news.followerNews(own_profile_name, timestamp, credentials);
    let follower_news = [];

    followerNewsRaw.forEach(row => {
        follower_news.push({
            text: newFollower(row.follower),
            link: row.follower,
            date: row.date
        });
    })

    /****************** FOLLOWEE ******************/
    const followeeNewsRaw = await news.followeeNews(own_profile_name, timestamp, credentials);
    let followee_news = [];

    followeeNewsRaw.forEach(row => {
        followee_news.push({
            text: newFollowee(row.followee),
            link: row.followee,
            date: row.date
        });
    })


    /**************** ACHIEVEMENT ****************/
        /*** friends ***/
    const friends = (await follow.getFriends(own_profile_name, credentials)).friend;
    let namesQuery = "";
    friends.forEach(friend => {
        namesQuery += `pro_name='${friend.profile_name}' OR `;
    })
    namesQuery = namesQuery.substring(0, namesQuery.length - 4);
    logger.debug(`Created search query for friends: ${namesQuery}`)

    let friends_achievements = [];
    if (namesQuery !== "") {
        const achievementNewsFriendsRaw = await news.achievementNewsFriends(namesQuery, timestamp, credentials);

        achievementNewsFriendsRaw.forEach(row => {
            friends_achievements.push({
                text: globalAchievementFriendsGet(row.user, row.name),
                link: row.id,
                date: row.date
            });
        })
    }

        /*** own ***/
    const achievementNewsRaw = await news.achievementNews(own_profile_name, timestamp, credentials);
    let own_achievements = [];

    achievementNewsRaw.forEach(row => {
        own_achievements.push({
            text: globalAchievementGet(row.name),
            link: row.id,
            date: row.date
        });
    })

    const achievement_news = {friends_achievements, own_achievements}

    return {
        news: {follower_news, followee_news, achievement_news},
        last_updated: startTime
    }
};

/**
 * get new followers (guys that follow you) of user
 *
 * @param name          of user
 * @param timestamp     news newer than timestamp
 * @param credentials
 * @returns {Promise<[{follower: "xy", date: "YYYY-MM-DD hh:mm:ss"}]>}
 */
news.followerNews = async (name, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name_follower as follower, fol_updated_at as date FROM follow WHERE pro_name_followee='${name}' AND fol_updated_at>'${timestamp}'`, (err, rows) => {
            if (err) {
                logger.error(`API News. Follower News => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get followers of ${name} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};

/**
 * get new followees (guys you follow) of user
 *
 * @param name          of user
 * @param timestamp     news newer than timestamp
 * @param credentials
 * @returns {Promise<[{followee: "xy", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.followeeNews = async (name, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name_followee as followee, fol_updated_at as date FROM follow WHERE pro_name_follower='${name}' AND fol_updated_at>'${timestamp}'`, (err, rows) => {
            if (err) {
                logger.error(`API News. Followee News => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get followees of ${name} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};

/**
 * get newly claimed achievements for user
 *
 * @param user          name of the user
 * @param timestamp     news after timestamp
 * @param credentials
 * @returns {Promise<[{id: "id", name: "name", class: "gold", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.achievementNews = async (user, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT ach_id as id, ach_name as name, achcl_name as class, achge_updated_at as date FROM
        (SELECT ach_id, achge_updated_at FROM achievement_get WHERE achge_updated_at>'${timestamp}' AND pro_name='${user}') as new_achievement 
        NATURAL JOIN 
        achievement
        NATURAL JOIN
        achievement_class`, (err, rows) => {
            if (err) {
                logger.error(`API News. Achievement News => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get achievement news of ${user} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};



/**
 * get newly claimed achievements for user
 *
 * @param names         names of friends
 * @param timestamp     news after timestamp
 * @param credentials
 * @returns {Promise<[{user: "devTest", id: "id", name: "name", class: "gold", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.achievementNewsFriends = async (names, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name as user, ach_id as id, ach_name as name, achcl_name as class, achge_updated_at as date FROM
        (SELECT ach_id, pro_name, achge_updated_at FROM achievement_get WHERE achge_updated_at>'${timestamp}' AND (${names})) as new_achievement 
        NATURAL JOIN 
        (SELECT * FROM achievement WHERE gro_name="Community") as global_achievements
        NATURAL JOIN
        achievement_class`, (err, rows) => {
            if (err) {
                logger.error(`API News. Achievement News Friends => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get achievements new friends newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};


/**
 * get group news
 *
 * @param groupName
 * @param timestamp
 * @param credentials
 * @returns {Object<
 *              {
 *              news: {
 *                  group_join: [
 *                      {
 *                          text: "Benutzer ... ist der Gruppe group_name beigetreten",
 *                          link: "profile_name",
 *                          date: "DATE from DB"
 *                      }
 *                  ],
 *                  admin_switch: [
 *                      {
 *                          text: "Benutzer ... ist nun Admin der Gruppe ...",
 *                          link: "profile_name",
 *                          date: "DATE from DB"
 *                      }
 *                  ],
 *                  group_achievement_get: [
 *                      {
 *                          text: "Benutzer ... hat das Achievement ... erreicht",
 *                          link: "achievement_id",
 *                          date: "DATE from DB"
 *                      },
 *                      {
 *                          text: "Du hast das Achievement ... erreicht",
 *                          link: "achievement_id",
 *                          date: "DATE from DB"
 *                      }
 *                  ],
 *                  group_achievement_new: [
 *                      {
 *                          text: "Neues Gruppenachievement ... erstellt",
 *                          link: "achievement_id",
 *                          date: "DATE from DB"
 *                      }
 *                  ]
 *              },
 *              last_updated: "YYYY-MM-DD hh:mm:ss"
 *           }
 *       >}
 */
news.getGroupNews = async (groupName, timestamp, credentials) => {
    const startTime = news.getDateTime();

    if (!timestamp || timestamp === "" || timestamp === "0" || timestamp === 0) {
        timestamp = minDate;
    }

    const own_profile_name = await validate.getProfileNameByCredentials(credentials);
    await group.checkIsUserInGroup(own_profile_name, groupName, credentials);

    const group_join_time = await news.groupJoinDate(own_profile_name, groupName, timestamp, credentials);

    /****************** GROUP JOINS ******************/
    const groupJoinRaw = await news.groupJoins(groupName, group_join_time, timestamp, credentials);
    let group_join = [];

    groupJoinRaw.forEach(row => {
        group_join.push({
            text: groupJoin(row.user, groupName),
            link: row.user,
            date: row.date
        });
    });

    /***************** ADMIN SWITCHES *****************/
    const adminSwitchesRaw = await news.groupAdminSwitches(groupName, group_join_time, timestamp, credentials);
    let admin_switch = [];

    adminSwitchesRaw.forEach(row => {
        admin_switch.push({
            text: groupAdminSwitch(row.admin, groupName),
            link: row.admin,
            date: row.date
        });
    });

    /************* GROUP ACHIEVEMENT GET *************/
    const groupAchievementGetRaw = await news.groupAchievementGet(groupName, group_join_time, timestamp, credentials);
    let group_achievement_get = [];

    groupAchievementGetRaw.forEach(row => {
        group_achievement_get.push(
            (row.user === own_profile_name) ?
                {
                    text: groupAchievementGetSelf(row.name),
                    link: row.id,
                    date: row.date
                } :
                {
                    text: groupAchievementGetOther(row.user, row.name),
                    link: row.id,
                    date: row.date
                }
            );
    });

    /************* GROUP ACHIEVEMENT GET *************/
    const groupAchievementNewRaw = await news.groupAchievementNew(groupName, group_join_time, timestamp, credentials);
    let group_achievement_new = [];

    groupAchievementNewRaw.forEach(row => {
        group_achievement_new.push({
            text: groupAchievementNew(row.name),
            link: row.id,
            date: row.date
        });
    });

    return {
        news: {group_join, admin_switch, group_achievement_get, group_achievement_new},
        last_updated: startTime
    }
};

/**
 * get new group joins of group
 *
 * @param groupName         the group name
 * @param groupJoinTime     when the user joined the group
 * @param timestamp         news newer than timestamp
 * @param credentials
 * @returns {Promise<[{user: "user", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.groupJoins = async (groupName, groupJoinTime, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name as user, grome_updated_at as date FROM group_member WHERE gro_name='${groupName}' AND grome_updated_at>'${timestamp}' AND grome_updated_at>'${groupJoinTime}'`, (err, rows) => {
            if (err) {
                logger.error(`API News. Group Joins => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get group joins of group ${groupName} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};

/**
 * get new group joins of group
 *
 * @param groupName         the group name
 * @param groupJoinTime     when the user joined the group
 * @param timestamp         news newer than timestamp
 * @param credentials
 * @returns {Promise<[{admin: "user", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.groupAdminSwitches = async (groupName, groupJoinTime, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT gro_admin as admin, gro_updated_at as date FROM usergroup WHERE gro_name='${groupName}' AND gro_updated_at>'${timestamp}' AND gro_updated_at>'${groupJoinTime}'`, (err, rows) => {
            if (err) {
                logger.error(`API News. Group Admin Switches => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get admin switches of group ${groupName} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};

/**
 * get new group joins of group
 *
 * @param groupName         the group name
 * @param groupJoinTime     when the user joined the group
 * @param timestamp         news newer than timestamp
 * @param credentials
 * @returns {Promise<[{user: "user", id: "id", name: "name", class:"gold", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.groupAchievementGet = async (groupName, groupJoinTime, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT pro_name as user, ach_id as id, ach_name as name, achcl_name as class, achge_updated_at as date FROM
        (SELECT pro_name, ach_id, achge_updated_at FROM achievement_get WHERE achge_updated_at>'${timestamp}' AND achge_updated_at>'${groupJoinTime}') as new_achievement 
        NATURAL JOIN 
        (SELECT * FROM achievement WHERE gro_name='${groupName}') as achievement_from_group
        NATURAL JOIN
        achievement_class`, (err, rows) => {
            if (err) {
                logger.error(`API News. Group Achievement Get => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get newly achieved achievements of group ${groupName} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};

/**
 * get new group joins of group
 *
 * @param groupName         the group name
 * @param groupJoinTime     when the user joined the group
 * @param timestamp         news newer than timestamp
 * @param credentials
 * @returns {Promise<[{id: "id", name: "name", class:"gold", date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.groupAchievementNew = async (groupName, groupJoinTime, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT ach_id as id, ach_name as name, achcl_name as class, ach_updated_at as date FROM
        (SELECT * FROM achievement WHERE gro_name='${groupName}' AND ach_updated_at>'${timestamp}' AND ach_updated_at>'${groupJoinTime}') as achievement_from_group
        NATURAL JOIN
        achievement_class`, (err, rows) => {
            if (err) {
                logger.error(`API News. Group Achievement New => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get newly created achievements of group ${groupName} newer than ${timestamp}`
                });
            }

            return resolve(rows);
        }, credentials)
    });
};

/**
 * get the date when user joined group
 *
 * @param user          the user
 * @param groupName     the group name
 * @param timestamp     news newer than timestamp
 * @param credentials
 * @returns {Promise<[{date: "YYYY-MM-DD hh:mm:ss"}]>}
 * https://dev.mysql.com/doc/refman/8.0/en/datetime.html
 */
news.groupJoinDate = async (user, groupName, timestamp, credentials) => {
    return new Promise((resolve, reject) => {
        database.query(`SELECT grome_updated_at as date FROM group_member WHERE gro_name='${groupName}' AND pro_name='${user}'`, (err, rows) => {
            if (err) {
                logger.error(`API News. Group Join Date => Database error. ${JSON.stringify(err)}`);
                return reject({
                    statusCode: err.statusCode || 500,
                    message: err.message || `Could not get group join date of user ${user} and group ${groupName}`
                });
            }

            let date = rows[0].date.toISOString();

            date = date.replace('T', ' ');
            date = date.substring(0, date.length - 5);

            return resolve(date);
        }, credentials)
    });
};

/**
 * https://www.geeksforgeeks.org/how-to-convert-javascript-datetime-to-mysql-datetime/
 * @returns {string}
 */
news.getDateTime = () => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/**
* exports
*/
module.exports = {
    getNews: (timestamp, credentials) => {
        return news.getNews(timestamp, credentials);
    },

    getGroupNews: (groupName, timestamp, credentials) => {
        return news.getGroupNews(groupName, timestamp, credentials);
    }
};