const errorHandling = require('../../modules/utilities/error-handling');

test('testing output of expected error message', () => {
    // example SQL error message
    const sqlError = {
         "code": "ER_DUP_ENTRY",
         "errno": 1062,
         "sqlMessage": "Duplicate entry 'undefined' for key 'PRIMARY'",
         "sqlState": "23000",
         "index": 0,
         "sql": "SOMETHING"
    };
    let errorMessage = errorHandling.getMessage(sqlError);
    expect(errorMessage.message).toBe("Already assigned.");
});

test('testing output of foreign key error message', () => {
    // example SQL error message
    const sqlError = {
        "code": "ER_NO_REFERENCED_ROW_2",
        "errno": 1062,
        "sqlMessage": "Duplicate entry 'undefined' for key 'PRIMARY'",
        "sqlState": "23000",
        "index": 0,
        "sql": "SOMETHING"
    };
    let errorMessage = errorHandling.getMessage(sqlError);
    expect(errorMessage.message).toBe("Foreign key is missing.");
});

test('testing output of wrong type error message', () => {
    // example SQL error message
    const sqlError = {
        "code": "ER_TRUNCATED_WRONG_VALUE",
        "errno": 1062,
        "sqlMessage": "Duplicate entry 'undefined' for key 'PRIMARY'",
        "sqlState": "23000",
        "index": 0,
        "sql": "SOMETHING"
    };
    let errorMessage = errorHandling.getMessage(sqlError);
    expect(errorMessage.message).toBe("Type of value is wrong.");
});

test('testing output of unknown error message', () => {
    // example SQL error message
    const sqlError = {
         "code": "SOMETHING_UNEXPECTED",
         "errno": 1062,
         "sqlMessage": "Duplicate entry 'jerom1' for key 'PRIMARY'",
         "sqlState": "23000",
         "index": 0,
         "sql": "INSERT INTO profile VALUES ('jerom1', '1995-11-29', 'Jerom', 'Pathipat', '', 'undefined', NOW(), NOW(), 'undefined')"
    };
    let errorMessage = errorHandling.getMessage(sqlError);
    expect(errorMessage.message).toBe("An unknown Error occured.");
});