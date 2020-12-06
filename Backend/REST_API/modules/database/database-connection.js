const mysql = require('mysql');
const fs = require('fs');
const logger = require('../utilities/logger')

// Read credentials file
// https://stackabuse.com/reading-and-writing-json-files-with-node-js/
let rawData = fs.readFileSync('.config/credentials-db.json', 'utf8');
let credentialsDB = JSON.parse(rawData);

const config = {
    host: credentialsDB.host,
    user: credentialsDB.user,
    password: credentialsDB.password,
    database: credentialsDB.database,
    port: credentialsDB.port,
    debug: true
}

// Create Connection
let con = null;

// https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
const tryConnecting = () => {
    con = mysql.createConnection(config);
    logger.error('Database Connection. Trying to connect to Database.');

    // Try to establish connection
    con.connect((err) => {
        if(err) {
            // Do not try to instantly connect again at err, wait a second to avoid "busy wait"
            logger.error('Database Connection. Error Connecting: ' + err.stack);
            logger.error('Database Connection. Trying again in 1 sec.');
            setTimeout(tryConnecting, 1000);
        }

        logger.info('Database Connection. Connected as id ' + con.threadId);
    });

    // Connection usually lost due to server restart or connnection idle timeout, try connection again if err.code == PROTOCOL_CONNECTION_LOST
    con.on('error', (err) => {
        logger.error('Database Connection. Connection ro Database Error:' + err.stack);

        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            tryConnecting();

        } else {
            logger.error('Database Connection. Error Connecting: ' + err.stack);
            logger.error('Error code is not PROTOCOL_CONNECTION_LOST, stop trying');
            throw err;
        }
    });
}

tryConnecting();

//--------------- COUNT USERS ---------------//
const delay = 30 * 60 * 1000; //30 mins in millisec
const now = new Date();
const nowHour = now.getHours();
const nowMin = now.getMinutes();
const nowSec = now.getSeconds();

let startHour = nowHour;
let startMin = 0;
let startSec = 0;

//set start to full or half an hour
if (nowMin >= 30) {
    startHour = nowHour + 1;
} else {
    startMin = 30;
}

let timeTillStart;
timeTillStart = startHour - nowHour; //hours till start
timeTillStart *= 60;
timeTillStart += startMin - nowMin; //minutes till start
timeTillStart *= 60;
timeTillStart += startSec - nowSec; //seconds till start
timeTillStart *= 1000;

const repeat = () => {
    userCount();
    setTimeout(repeat, delay);
}

setTimeout(repeat, timeTillStart);
logger.debug(`First user count scheduled to ${startHour}:${startMin}`)

const userCount = () => {
    return new Promise(() => {
        con.query("SELECT COUNT(*) as count FROM profile", null, (err, rows) => {
            if (err) {
                logger.error(`Database Connection. Error in User Count => ${JSON.stringify(err)}`);

            } else {
                logger.info(`User count @ ${(new Date()).toISOString()} is ${rows[0].count}.`)
            }
        });
    })
}

// Export
module.exports = con;

module.exports.query = con.query;
module.exports.beginTransaction = con.beginTransaction;
module.exports.commit = con.commit;
module.exports.rollback = con.rollback;