const con = require('./database-connection');
const logger = require('../utilities/logger');
const validate = require('./validate');

let queryCounter = 0;
let transactionCounter = 0;

const database = Object.create(null);

database.myQuery = async (qry, callback, credentials, authenticate = true) => {
    logger.debug(`DB query nr ${++queryCounter}. Query: ${qry} | Credentials: ${(credentials) ? Object.keys(credentials): "null"} | Authenticate: ${authenticate}`);

    if (authenticate) {
        if (!(await validate.authentication(credentials, callback))) {
            // Do not need to do anything. Callback is called in authentication
            return;
        }
    }

    logger.debug(`User is authenticated => Run query nr ${queryCounter}`);
    return con.query(qry, callback);
};

database.myTransaction = async (queries, credentials, authenticate = true) => {
    logger.debug(`DB transaction nr ${++transactionCounter}. Queries: ${JSON.stringify(queries)} | Credentials: ${(credentials) ? Object.keys(credentials) : "null"} | Authenticate: ${authenticate}`);

    if (authenticate) {
        if (!(await validate.authentication(credentials, (err) => {
            throw(err);
        }))) {
            // Do not need to do anything. Callback is called in authentication
            return;
        }
    }

    logger.debug(`User is authenticated => Run transaction nr ${transactionCounter}`);

    con.beginTransaction();

    let queryPromises = [];
    queries.forEach((query) => {
        logger.debug(`DB query nr ${++queryCounter} from transaction nr ${transactionCounter}. Query: ${query}`);
        queryPromises.push(
            new Promise((resolve, reject) => {
                con.query(query, (err, rows) => {
                    if (err) {
                        return reject({
                            query: query,
                            err: err
                        });
                    } else {
                        return resolve(rows);
                    }
                });
            })
        );
    });

    return new Promise((resolve, reject) => {
        Promise.all(queryPromises)
            .then((results) => {
                logger.debug(`Commit transaction nr ${transactionCounter}. Result: ${JSON.stringify(results)}`);
                con.commit();
                return resolve({
                    status: true,
                    result: results
                })
            })
            .catch((result) => {
                logger.debug(`Rollback transaction nr ${transactionCounter}. Error: ${JSON.stringify(result.err)}`);
                con.rollback();
                return reject({
                    status: false,
                    result: result
                })
            });
    });
};

// Export
module.exports = {
    query: (qry, callback, credentials, authenticate) => {
        return database.myQuery(qry, callback, credentials, authenticate);
    },

    transaction: (queries, credentials, authenticate) => {
        return database.myTransaction(queries, credentials, authenticate);
    }
};