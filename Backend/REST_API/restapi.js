const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');

const logger = require('./modules/utilities/logger');
const utl = require('./modules/utilities/utility');

const validate = require("./modules/database/validate");

const apiUser = require('./modules/api/api-user');
const apiAchievement = require('./modules/api/api-achievement');
const apiFollower = require('./modules/api/api-follower');
const apiProfile = require('./modules/api/api-profile');
const apiGroup = require('./modules/api/api-group');
const apiNews = require('./modules/api/api-news');


// Set correct PORT
const PORT = process.env.PORT || 5001;

// Logger
logger.debug("Overriding 'Express' logger");
app.use(require('morgan')('morgan', { "stream": logger.stream }));

// Session
// https://github.com/expressjs/session/issues/438
// https://github.com/expressjs/session#options
let store = new session.MemoryStore;
// app.use(app.cookieParser());
app.use(session(
    {
        secret: utl.uuid(),
        name: `Achivi-Cookie`,
        store: store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 15552000000 // Half year (in ms) => 1000 * 60 * 60 * 24 * 180
        }
    }));


// https://stackoverflow.com/questions/46606599/expressjs-post-method-no-access-control-allow-origin
let corsOrigin;
if (process.env.NODE_ENV === 'production') {
    corsOrigin = 'localhost';
}
else {
    corsOrigin = 'http://localhost:8081';
}
corsOrigin = '*';
app.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", corsOrigin);
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.set('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');

    next();
});
logger.info(`CorsOrigin: ${corsOrigin}`);

// https://flaviocopes.com/express-post-query-variables/
app.use(express.json());


// Informations about the REST API
// https://codeforgeek.com/render-html-file-expressjs/
app.all('/api/', (req, res) => {
    logger.debug(utl.cred(req));
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Check header contents
// ONLY WORKS IF THE REQUEST IS NOT OWER IP
// https://stackoverflow.com/questions/23271250/how-do-i-check-content-type-using-expressjs/46018920
app.all('/api/*', (req, res, next) => {
    // ONLY WORKS IF ADRESS IS NO IP
    // var contype = req.headers['content-type'];
    // logger.debug(`Content: ${contype}`);
    // logger.debug(req.headers);
    // logger.debug(`Content-Type: ${req.get('Content-Type')}`);
    // if (!contype || contype.indexOf('application/json') !== 0) {
    //     return res.send(400);
    // }

    next();
});

//------------------------------------------- Achievement Methods -------------------------------------------//
// POST new achievement
//    params:   ---
//    body:     name, description, achClName (achievement class name), groupName
//    returns:  .status = true if worked, .status = false if not worked, error if rejected
// https://stackoverflow.com/questions/15350025/express-js-single-routing-handler-for-multiple-routes-in-a-single-line
app.all('/api/achievements', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);
    if (req.method === 'POST') {
        try {
            res.status(200).json(await apiAchievement.createAchievement(req.body, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET all claimed achievements of user who is logged in
//    params:   userName
//    body:     ---
//    returns:  all Achievements if worked, .status = false if no Achievements found or error if rejected
app.all('/api/profiles/:profileName/achievements/claimed', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getAllAchievementsOfUser(utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET all flagged achievements of user who is logged in
//    params:   userName
//    body:     ---
//    returns:  all Achievements if worked, .status = false if no Achievements found or error if rejected
app.all('/api/profiles/:profileName/achievements/flagged', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getAllFlaggedAchievementsOfUser(utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// get all classes of the achievements
//    params:   ---
//    body:     ---
//    returns:  all classes if worked or error if rejected
app.all('/api/achievements/classes', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getAllClasses(utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET single achievement
//    params:   id
//    body:     ---
//    returns:  Achievement if worked, .status = false if no Achievement found or error if rejected
// DELETE single achievement
//    params:   id
//    body:     ---
//    returns:  .status = true if worked or error if rejected
app.all('/api/achievements/:id', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getAchievementById(req.params.id, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else if (req.method === 'DELETE') {
        try {
            res.status(200).json(await apiAchievement.deleteAchievement(req.params.id, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    }else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET all achievements in category
//    params:   name (of category)
//    body:     ---
//    returns:  .status = true and Achievements, .status = false if no Achievements found or error if rejected
app.all('/api/achievements/categories/:name', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getAllAchievementsByCategory(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET all achievements of group
//    params:   name (of group)
//    body:     ---
//    returns:  .status = true and Achievements, .status = false if no Achievements found or error if rejected
app.all('/api/groups/:name/achievements', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getAllAchievementsByGroup(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});


// GET all achievement points of profile
//    params:   userName, achievementID
//    body:     ---
//    returns:  points or error if rejected
app.all('/api/profiles/:profileName/achievements/points', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiAchievement.getPoints(req.params.profileName, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// Claim an achievement for caller
//    params:   userName, achievementID
//    body:     ---
//    returns:  .status = true or error if rejected
// Declaim an achievement for caller
//    params:   userName, achievementID
//    body:     ---
//    returns:  .status = true or error if rejected
app.all('/api/profiles/:profileName/achievements/:achievementID/claim', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);
    if (req.method === 'POST') {
        try {
            res.status(200).json(await apiAchievement.claimAchievement(req.params.achievementID, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else if (req.method === 'DELETE') {
        try {
            res.status(200).json(await apiAchievement.declaimAchievement(req.params.achievementID, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// Flag an achievement for caller
//    params:   achievementID
//    body:     ---
//    returns:  .status = true or error if rejected
// Deflag an achievement for caller
//    params:   achievementID
//    body:     ---
//    returns:  .status = true, .status = false if no flag found or error if rejected
app.all('/api/profiles/:profileName/achievements/:achievementID/flag', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);
    if (req.method === 'POST') {
        try {
            res.status(200).json(await apiAchievement.flagAchievement(req.params.achievementID, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else if (req.method === 'DELETE') {
        try {
            res.status(200).json(await apiAchievement.deflagAchievement(req.params.achievementID, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});


//------------------------------------------------- User Methods -------------------------------------------------//
// register
//    params:   ---
//    body:     email, password, profileName, birthDate, firstName, lastName
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/register', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    if (req.method === 'POST') {
        try {
            logger.debug(`Create user: ${JSON.stringify(req.body)}`);

            res.status(200).json(await apiUser.register(req.body));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// login
//    params:   ---
//    body:     email, password
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/login', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'POST') {
        try {
            const result = await apiUser.login(req.body, utl.cred(req));
            req.session.session_id = result.session_id;
            req.session.api_key = result.api_key;

            if (result.status) {
                logger.info(`Logged in user with email ${req.body.email}, session_id: ${result.session_id}, api_key: ${result.api_key}`);
            } else {
                logger.debug(`Login for user with email ${req.body.email} denied`);
            }

            res.status(200).json({
                status: result.status,
                message: result.message
            })
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// logout
//    params:   profileName
//    body:     ---
//    returns:  .status = true if worked or error if rejected
app.all('/api/logout/:profileName', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'DELETE') {
        try {
            logger.debug(`Logging out ${req.params.profileName}`);
            await apiUser.logout(utl.cred(req));

            // Destroy session if set
            if (req.session) {
                req.session.destroy();
                logger.info(`Logged out ${req.params.profileName}`);
            }

            res.status(200).json({
                status: true,
                message: `Successfully logged out`
            })
        } catch (e) {
            logger.debug(`Error in logging out ${req.params.profileName}`);
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// update email
//    params:   ---
//    body:     email_old, email_new
//    returns:  .status = true if email does exist, .status = false if email does not exists or error if rejected
app.all('/api/users/change-email', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'POST') {
        try {
            logger.debug(`Update user email of user ${req.body.email_old}`);
            const result = await apiUser.updateUserEmail(req.body.email_old, req.body.email_new, utl.cred(req));
            logger.info(`Updated user email from ${req.body.email_old} to ${req.body.email_new}`);

            res.status(200).json({ status: result.status, message: result.message });
        } catch (e) {
            logger.debug(`Error in updating user email of user ${req.body.email_old}`);
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// checks if email is used
//    params:   email
//    body:     ---
//    returns:  .status = true if email does exist, .status = false if email does not exists or error if rejected
app.all('/api/users/:email/is-used', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            logger.debug(`Check if email ${req.body.email} is already used`);
            if ((await apiUser.userEmailUsed(req.params.email)).status) {
                res.status(200).json({
                    status: false,
                    message: 'Email is already taken'
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: 'Email is free'
                });
            }
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// DELETE user with email (no backsies)
//    params:   email (of user to be deleted, only for own user allowed)
//    body:     ---
//    returns:  .status = true if email does exist, .status = false if email does not exists or error if rejected
app.all('/api/users/:email', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Delete User. Email: ${req.params.email}`);

    // Check of method type
    if (req.method === 'DELETE') {
        try {
            res.status(200).json(await apiUser.delUser(req.params.email, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});


//--------------------------------------------Profiles Methods-----------------------------------------------//
// GET Profile by Name
//    params:   name
//    body:     ---
//
// PUT Profile by Name
//    params:   name
//    body:     name, birthDate, firstName, lastName, bio, picture
app.all('/api/profiles/:name', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);
    // Check of method type
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiProfile.getProfile(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else if (req.method === 'PUT') {
        try {
            res.status(200).json(await apiProfile.updateProfile(req.params.name, req.body, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// checks is profile name used
//    params:   email
//    body:     ---
//    returns:  .status = true if email does exist, .status = false if email does not exists or error if rejected
app.all('/api/profiles/:name/is-used', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            logger.debug(`Check if profile name ${req.body.name} is already used`);
            if ((await apiProfile.isProfileNameUsed(req.params.name)).status) {
                res.status(200).json({
                    status: true,
                    message: 'Profile name is already taken'
                });
            } else {
                res.status(200).json({
                    status: false,
                    message: 'Profile name is free'
                });
            }
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET Own Profile or search for profile name
//    params:   ---
//    body:     ---
//    query:    q, limit, findMySelf
//    returns:  .status = true and list of names like name, .status = false if nothing found or error if rejected
app.all('/api/profiles', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            // Check if there is a search request
            if (Object.keys(req.query).length !== 0 && req.query.constructor === Object) {
                logger.debug(`Search Request. => Query: ${JSON.stringify(req.query)}`);
                res.status(200).json(await apiProfile.searchForProfileName(req.query, utl.cred(req)));
            } else {
                logger.debug('Get Profile Request');
                res.status(200).json(await apiProfile.getOwnProfile(utl.cred(req)));
            }
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

//--------------------------------------------Followers Methods-----------------------------------------------//
// GET all Followers by Profile Name
//    params:   name
//    body:     ---
//
app.all('/api/profiles/:name/followers', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiFollower.getFollowers(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET all Followees by Profile Name
//    params:   name
//    body:     ---
//
// POST create new Followee relationship
//      params: ---
//      body: followeeProfileName
//      returns: .status = true if worked
app.all('/api/profiles/:name/followees', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiFollower.getFollowees(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else if (req.method === 'POST') {
        try {
            res.status(200).json(await apiFollower.addFollowee(req.body, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// DELETE Follower of Profile Name
//    params:   name
//    body:     ---
app.all('/api/profiles/:profileName/followees/:name', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'DELETE') {
        try {
            res.status(200).json(await apiFollower.deleteFollowee(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET Friends of Profile Name
//    params:   name
//    body:     ---
//    returns:  JSON array of objects "friend", containing pro_name, pro_picture
app.all('/api/profiles/:name/friends', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // check method type, must be GET
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiFollower.getFriends(req.params.name, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }

});


//----------------------------------------------Groups Methods-------------------------------------------------//
// create group, automatically sets admin to creator (caller)
//    params:   ---
//    body:     groupName, members (profile names, as list of strings)
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/groups', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'POST') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to create group with name ${req.body.groupName}`);

            res.status(200).json(await apiGroup.createGroup(caller, req.body, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET all members of a group
//    params:   name (groupName)
//    body:     ---
//    returns:  .status = true if groups found, .status = false if nothing found or error if rejected
// POST members to group
//    params:   groupName
//    body:     users (profile names, as a list of strings)
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/groups/:groupName/members', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to get names of all groups they are in`);

            res.status(200).json(await apiGroup.getAllMembers(caller, req.params.groupName, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else if (req.method === 'POST') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);
            const groupName = req.params.groupName;
            const users = req.body.users;

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to add members ${JSON.stringify(users)} to group with name ${groupName}`);

            res.status(200).json(await apiGroup.addMembers(caller, groupName, users, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = {
                status: e.status,
                message: e.message,
                usersUnableToAdd: e.usersUnableToAdd,
                usersForbiddenToAdd: e.usersForbiddenToAdd,
            };
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// DELETE group member
//    params:   groupName, memberToBeRemoved
//    body:     ---
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/groups/:groupName/members/:memberToBeRemoved', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'DELETE') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);
            const groupName = req.params.groupName;
            const memberToBeRemoved = req.params.memberToBeRemoved;

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to remove member ${memberToBeRemoved} from group with name ${groupName}`);

            res.status(200).json(await apiGroup.removeGroupMember(caller, memberToBeRemoved, groupName, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// change admin of group, only works if caller is current admin
//    params:   groupName, newAdmin
//    body:     ---
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/groups/:groupName/change-admin/:newAdmin', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'PUT') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);
            const groupName = req.params.groupName;
            const admin_new = req.params.newAdmin;

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to change admin to ${admin_new} in group with name ${groupName}`);

            res.status(200).json(await apiGroup.setAdminOfGroup(caller, admin_new, groupName, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// delete group
//    params:   groupName
//    body:     ---
//    returns:  .status = true if worked, .status = false if not worked or error if rejected
app.all('/api/groups/:groupName', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'DELETE') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);
            const groupName = req.params.groupName;

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to delete group with name ${groupName}`);

            res.status(200).json(await apiGroup.deleteGroup(caller, groupName, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// get all groups of caller
//    params:   ---
//    body:     ---
//    returns:  .status = true if groups found, .status = false if nothing found or error if rejected
app.all('/api/profiles/:profileName/groups', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // Check of method type
    if (req.method === 'GET') {
        try {
            const credentials = utl.cred(req);
            const caller = await validate.getProfileNameByCredentials(credentials);

            if (!caller) {
                // noinspection ExceptionCaughtLocallyJS
                throw ({
                    statusCode: 401,
                    message: `User ${caller} is not logged in`
                })
            }

            logger.debug(`User ${caller} tries to get names of all groups they are in`);

            res.status(200).json(await apiGroup.getAllGroupsOfUser(caller, req.params.profileName, credentials));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});


//----------------------------------------------News Methods-------------------------------------------------//
// GET News of Profile Name
//    params:   name (of profile), after (news after timestamp)
//    body:     ---
//    returns:  news
app.all('/api/profiles/:name/news/:after', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // check method type, must be GET
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiNews.getNews(req.params.after, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }
});

// GET News of Group
//    params:   groupName, after (news after timestamp)
//    body:     ---
//    returns:  news
app.all('/api/groups/:groupName/news/:after', async (req, res) => {
    logger.debug(`REST Api. ${req.url}. Method: ${req.method}`);

    // check method type, must be GET
    if (req.method === 'GET') {
        try {
            res.status(200).json(await apiNews.getGroupNews(req.params.groupName, req.params.after, utl.cred(req)));
        } catch (e) {
            let statusCode = e.statusCode || 404;
            let err = e.message || e;
            res.status(statusCode).json(err);
        } finally {
            res.end();
        }
    } else {
        res.status(405).json({ error: `Method type '${req.method}' not supported!` }).end();
    }

});

// LISTEN
app.listen(PORT, function () {
    logger.debug("RESTApi ready to use");
    logger.debug('Port: ' + PORT);
});

