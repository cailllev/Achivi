const logger = require('./logger');

const verification = Object.create(null);

verification.verifyText = (text, maxLength, minLength = 0, canBeNull = false) => {
    logger.debug(`Verification: verifyText => text: ${text} | maxLength: ${maxLength} | minLength: ${minLength} | canBeNull: ${canBeNull}`);
    // Set parameters correct
    minLength = minLength || 0;
    canBeNull = canBeNull || false;

    // Check if the parameters are given
    if (typeof text !== 'string') {
        logger.error(`Verify Text: text must be of type string. Type of text: ${typeof text}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: text must be of type string. Type of text: ${typeof text}`
        });
    }
    if (!maxLength && maxLength !== 0) {
        logger.error(`Verify Text: maxLength can not be null`);
        throw ({
            statusCode: 412,
            message: `Verify Text: maxLength can not be null`
        });
    }

    logger.debug(`Verify Text: Text and maxLength are set.`);


    // Test maxLength
    // Check if max length is a number
    if (typeof maxLength !== 'number') {
        logger.error(`Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: maxLength must be a number. Type of maxLength: ${typeof maxLength}`
        });
    }

    // Check for Integer
    if (maxLength !== parseInt(maxLength)) {
        logger.error(`Verify Text: maxLength must be an Integer. MaxLength: ${maxLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: maxLength must be an Integer. MaxLength: ${maxLength}`
        });
    }

    // Check if the max length is at least 1
    if (maxLength < 1) {
        logger.error(`Verify Text: maxLength can not be lower than 1. MaxLength: ${maxLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: maxLength can not be lower than 1. MaxLength: ${maxLength}`
        });
    }

    logger.debug(`Verify Text: MaxLength is correct. maxLength: ${maxLength}`);


    // Test minLength
    // Check if max length is a number    
    if (typeof minLength !== 'number') {
        logger.error(`Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: minLength must be a number. Type of minLength: ${typeof minLength}`
        });
    }

    // Check for Integer
    if (minLength !== (parseInt(minLength))) {
        logger.error(`Verify Text: minLength must be an Integer. minLength: ${minLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: minLength must be an Integer. MinLength: ${minLength}`
        });
    }

    // Check if the min length is at least 0
    if (minLength < 0) {
        logger.error(`Verify Text: minLength can not be lower than 0. MinLength: ${minLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: minLength can not be lower than 0. MinLength: ${minLength}`
        });
    }

    logger.debug(`Verify Text: MinLength is correct. minLength: ${minLength}`);


    // Max length can not be lower than min length
    if (maxLength < minLength) {
        logger.error(`Verify Text: maxLength can not be lower than minLength. MaxLength: ${maxLength} | MinLength: ${minLength}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: maxLength can not be lower than minLength. MaxLength: ${maxLength} | MinLength: ${minLength}`
        });
    }

    logger.debug(`Verify Text: MaxLength is greater or equal minLength.`);


    // Test canBeNull
    if (typeof canBeNull !== 'boolean' || canBeNull !== true && canBeNull !== false) {
        logger.debug(`Verify Text: canBeNull must be of type boolean. Type of canBeNull: ${typeof canBeNull}`);
        throw ({
            statusCode: 412,
            message: `Verify Text: canBeNull must be of type boolean. Type of canBeNull: ${typeof canBeNull}`
        });
    }

    logger.debug(`Verify Text: Text can be null. canBeNull: ${canBeNull}`);


    // Test text
    // Check if the text is empty
    if (text.length === 0 && !canBeNull) {
        logger.debug(`Verify Text: Text can not be empty.`);
        return {
            status: false,
            message: `Text can not be empty.`
        };
    }

    // Check for the maximum length
    if (text.length > maxLength) {
        logger.debug(`Verify Text: Text can not have more than ${maxLength} chars. Text length: ${text.length}.`);
        return {
            status: false,
            message: `Text can not have more than ${maxLength} chars. Text length: ${text.length}.`
        };
    }

    // Check for the minimum length
    if (text.length < minLength && (text.length !== 0 || !(text.length === 0 && canBeNull))) {
        let canBeNullText = canBeNull ? ' or be empty' : '';
        logger.debug(`Verify Text: Text must be at least ${minLength} chars long${canBeNullText}. Text length: ${text.length}.`);
        return {
            status: false,
            message: `Text must be at least ${minLength} chars long${canBeNullText}. Text length: ${text.length}.`
        };
    }

    logger.debug(`Verify Text: Text successfully verified.`);


    // Text successfully verified
    return {
        status: true
    };
};

verification.verifyInteger = (figure, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, canBeNull = false) => {
    logger.debug(`Verification: verifyInteger => figure: ${figure} | min: ${min} | max: ${max} | canBeNull: ${canBeNull}`);

    // Set parameters correct
    min = parseInt(min || Number.MIN_SAFE_INTEGER);
    max = parseInt(max || Number.MAX_SAFE_INTEGER);
    canBeNull = canBeNull || false;

    logger.debug(`Verification: verifyInteger (after setting correct parameters)=> figure: ${figure} | min: ${min} | max: ${max} | canBeNull: ${canBeNull}`);

    // figure can be null but is number         --> test all

    // figure can not be null and is not null   --> test all

    // figure can be null and is null           --> returns true
    if (canBeNull && !figure) {
        // Integer successfully verified
        return {
            status: true,
            parsedNumber: figure
        };
    }

    // figure can not be null, but is null      --> returns false
    if (!canBeNull && (figure === "" || (!figure && figure !== 0))) {
        return {
            status: false,
            message: `Figure can not be null. Figure: ${figure}`
        }
    }

    // is not a number
    if (isNaN(figure)) {
        logger.error(`Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`);
        throw ({
            statusCode: 412,
            message: `Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`
        });
    }

    // is number but no Integer
    if (!isNaN(figure) && parseFloat(figure) !== parseInt(figure)) {
        logger.error(`Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`);
        throw ({
            statusCode: 412,
            message: `Verify Integer: Figure is not an integer. Figure: ${figure} | parseInt(figure): ${parseInt(figure)}`
        });
    }

    // Make sure figure is an integer
    figure = parseInt(figure);

    logger.debug(`Verify Integer: Figure (integer / number) is of type number. Figure: ${figure} | type of: ${typeof figure}`);


    // Check min
    let canBeNullText = canBeNull ? ' or must be empty' : '';

    if (figure < min) {
        logger.debug(`Verify Integer: Figure can not be lower than the min value${canBeNullText}. Figure: ${figure} | Min: ${min}.`);
        return {
            status: false,
            message: `Figure can not be lower than the min value${canBeNullText}. Figure: ${figure} | Min: ${min}`
        };
    }

    logger.debug(`Verify Integer: Integer is higher or equal than the min value. Figure: ${figure} | Min: ${min}`);


    // Check max
    if (figure > max) {
        logger.debug(`Verify Integer: Figure can not be higher than the max value${canBeNullText}. Figure: ${figure} | Max: ${max}`);
        return {
            status: false,
            message: `Figure can not be higher than the max value${canBeNullText}. Figure: ${figure} | Max: ${max}`
        };
    }

    logger.debug(`Verify Integer: Integer is lower or equal than the max value. Figure: ${figure} | max: ${max}`);


    logger.debug(`Verify Integer: Integer successfully verified.`);

    // Integer successfully verified
    return {
        status: true,
        parsedNumber: figure
    };
};

verification.verifyDate = (givenDate, minDate = null, maxDate = null, canBeNull = false) => {
    logger.debug(`Verification: verifyDate => givenDate: ${givenDate} | minDate: ${minDate} | maxDate: ${maxDate} | canBeNull: ${canBeNull}`);

    // Set parameters correct
    canBeNull = canBeNull || false;

    // Test first if it can be null
    if (canBeNull && (givenDate === "" || !givenDate)) {
        logger.debug(`Verify Date: Date can be null and is null or empty. Date: ${givenDate} | canBeNull: ${canBeNull}`);
        return {
            status: true
        };
    }

    logger.debug(`Verify Date: Date is not null or empty. Date: ${givenDate}.`);


    // Is given input of type date
    if (Object.prototype.toString.call(givenDate) !== "[object Date]" || !(givenDate instanceof Date)) {
        logger.debug(`Verify Date: Date is not of type Date. Date: ${Object.prototype.toString.call(givenDate)}.`);

        // Check if givenDate is a string
        if (typeof givenDate === "string") {
            logger.debug(`Verify Date: Date is of type sting.`);

            // Check if the string is a number
            if (!isNaN(givenDate)) {
                logger.debug(`Verify Date: Given date is a number.`);
                givenDate = parseInt(givenDate);
            } else {
                logger.debug(`Verify Date: Given date is not a number.`);

                // Check if year is not first
                if ((parseInt(givenDate).toString().length) !== 4) {
                    logger.debug(`Verify Date: Given date does not start with the year.`);

                    // Check for date with /
                    if (givenDate.indexOf('/') === -1) {
                        // Date is not with /
                        logger.debug(`Verify Date: Given date may be separated with .`);

                        // Check if split char is . or -
                        let splitChar;
                        if (givenDate.indexOf('.') >= 0) {
                            splitChar = '.';
                        } else if (givenDate.indexOf('-') >= 0){
                            splitChar = '-';
                        } else {
                            logger.debug(`Verify Date: Could not recognize date. Date: ${givenDate}`);
                            return {
                                status: false,
                                message: `Could not recognize date. Date: ${givenDate}`
                            };
                        }


                        // Split date with ${splitChar}
                        // Always expect that day is first
                        let splittedDate = givenDate.split(splitChar);

                        if (splittedDate.length !== 3) {
                            logger.debug(`Verify Date: Could not recognize date. Date: ${givenDate}`);
                            return {
                                status: false,
                                message: `Could not recognize date. Date: ${givenDate}`
                            };
                        }

                        givenDate = `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`;

                        logger.debug(`Verify Date: Date converted into: ${givenDate}`);

                        if (parseInt(splittedDate[0]) !== (new Date(givenDate)).getDate()) {
                            logger.debug(`Verify Date: Invalid date. Date: ${givenDate}`);
                            return {
                                status: false,
                                message: `Invalid date. Date: ${givenDate}`
                            };
                        }
                    } else {
                        // ELSE: Given string can be put into new Date()
                        logger.debug(`Verify Date: Given Date as a string can be put into new Date. Date ${givenDate}.`);
                    }
                } else {
                    // ELSE: Given string can be put into new Date()
                    logger.debug(`Verify Date: Given Date as a string can be put into new Date. Date ${givenDate}.`);
                }
            }
        } else {
            // Try to convert to a number
            logger.debug(`Verify Date: Given Date is not a string. Try to convert it into a number. Date: ${givenDate} | Typeof ${typeof givenDate} | parseInt: ${parseInt(givenDate)}.`);
            givenDate = parseInt(givenDate);
        }

        givenDate = new Date(givenDate);
    }

    logger.debug(`Verify Date: Date is of type Date. Date: ${Object.prototype.toString.call(givenDate)}.`);


    if (givenDate.toString() === "Invalid Date" || isNaN(givenDate.getTime())) {
        logger.debug(`Verify Date: Given date is not a valid Date. DateToString: ${givenDate.toString()}`);
        return {
            status: false,
            message: `Given date is not a valid Date. DateToString: ${givenDate.toString()}`
        };
    }

    // Check min date
    if (minDate) {
        logger.debug(`Verify Date: Min Date set. MinDate: ${minDate}`);
        // Verify and get correct min date
        let verifyMinDate = verification.verifyDate(minDate);
        if (!verifyMinDate.status) {
            logger.error(`Verify Date: Given min date not recognized: MinDate: ${minDate}`);
            throw ({
                statusCode: 412,
                message: `Verify Date: Given min date not recognized: MinDate: ${minDate}`
            });
        }

        minDate = verifyMinDate.convertedDate;
        logger.debug(`Verify Date: Converted min date set. MinDate: ${minDate}`);

        if (verification.compareDate(givenDate, minDate) === -1) {
            logger.debug(`Verify Date: Given date is lower than min date. GivenDate: ${givenDate.toString()} | minDate: ${minDate.toString()}`);
            return {
                status: false,
                message: `Given date is lower than min date. GivenDate: ${givenDate.toString()} | minDate: ${minDate.toString()}`
            };
        }
    }

    // Check max date
    if (maxDate) {
        logger.debug(`Verify Date: Max Date set. MaxDate: ${maxDate}`);
        // Verify and get correct max date
        let verifyMaxDate = verification.verifyDate(maxDate);
        if (!verifyMaxDate.status) {
            logger.error(`Verify Date: Given max date not recognized: MaxDate: ${maxDate}`);
            throw ({
                statusCode: 412,
                message: `Verify Date: Given max date not recognized: MaxDate: ${maxDate}`
            });
        }

        maxDate = verifyMaxDate.convertedDate;
        logger.debug(`Verify Date: Converted max date set. MaxDate: ${maxDate}`);

        if (verification.compareDate(givenDate, maxDate) === 1) {
            logger.debug(`Verify Date: Given date is higher than max date. GivenDate: ${givenDate.toString()} | maxDate: ${maxDate.toString()}`);
            return {
                status: false,
                message: `Given date is higher than max date. GivenDate: ${givenDate.toString()} | maxDate: ${maxDate.toString()}`
            };
        }
    }


    logger.debug(`Verify Date: Date successfully verified. ConvertedDate: ${givenDate}`);

    // Date successfully verified
    return {
        status: true,
        convertedDate: givenDate,
        dbDate: `${givenDate.getFullYear()}-${(givenDate.getMonth() + 1)}-${givenDate.getDate()}`
    };
};

verification.compareDate = (a, b) => {
    // Check year
    if (a.getFullYear() > b.getFullYear()) {
        return 1;
    }

    if (a.getFullYear() < b.getFullYear()) {
        return -1;
    }

    // Check month
    if (a.getMonth() > b.getMonth()) {
        return 1;
    }

    if (a.getMonth() < b.getMonth()) {
        return -1;
    }

    // Check day
    if (a.getDate() > b.getDate()) {
        return 1;
    }

    if (a.getDate() < b.getDate()) {
        return -1;
    }

    // Same
    return 0;
};

verification.verifyEMail = (email, canBeNull = false) => {
    logger.debug(`Verification: verifyEMail => email: ${email} | canBeNull: ${canBeNull}`);

    // Set parameters correct
    canBeNull = canBeNull || false;

    // Import library
    const validate = require("email-validator").validate;

    if (canBeNull && (email === "" || !email)) {
        return {
            status: true
        };
    }

    if (!validate(email)) {
        logger.debug(`Verification: verifyEMail ${email} => is NOT valid`);
        return {
            status: false,
            message: `E-Mail-Address is not valid. E-Mail: ${email}`
        };
    }


    logger.debug(`Verification: verifyEMail ${email} => success`);

    // E-Mail successfully verified
    return {
        status: true
    };
};

/**
 *
 * @param input                     the input to check, as JSON
 * @param propertiesToHave          the properties to check in input, as List of Strings
 * @param canContainMoreProperties  input can contain more properties than those to check, as boolean
 * @returns {{status: boolean}}     true if equal properties and equal count of properties
 */
verification.verifyJSON = (input, propertiesToHave, canContainMoreProperties = false) => {
    if (!input) {
        const msg = "Input cannot be null.";
        logger.debug(`Verification: verifyJSON '${JSON.stringify(input)}' => is NOT valid\n${msg}`);
        return {
            status: false,
            message: msg
        };
    }

    logger.debug(`Verification: verifyJSON => input: ${Object.keys(input)[0]} | propertiesToHave: ${propertiesToHave} | canContainMoreProperties: ${canContainMoreProperties}`);


    // Set parameters correct
    canContainMoreProperties = canContainMoreProperties || false;

    //if propertiesToHave is only one string and not a list of strings, convert it to a list
    //otherwise next if checks for length of string and not length of list as it should
    if (typeof propertiesToHave === 'string' || propertiesToHave instanceof String) {
        propertiesToHave = [propertiesToHave];
    }

    //check input properties are at least as many as propertiesToHave
    if (canContainMoreProperties) {
        if (Object.keys(input).length < propertiesToHave.length) {
            const msg = "VerifyJSON: Too less properties in input";
            logger.debug(`Verification: verifyJSON ${JSON.stringify(input)} => is NOT valid\n${msg}`);
            return {
                status: false,
                message: msg
            };
        }
        //else check if they have the same amount
    } else {
        if (Object.keys(input).length !== propertiesToHave.length) {
            const msg = "VerifyJSON: Unequal amount of properties.";
            logger.debug(`Verification: verifyJSON ${JSON.stringify(input)} => is NOT valid\n${msg}`);
            return {
                status: false,
                message: msg
            };
        }
    }

    //check input property names
    for (const property of propertiesToHave) {

        if (typeof property !== "string" && !(property instanceof String)) {
            const msg = "VerifyJSON: Properties are not strings";
            logger.debug(`Verification: verifyJSON ${JSON.stringify(input)} => is NOT valid\n${msg}`);
            return {
                status: false,
                message: msg
            };
        }

        if (!Object.prototype.hasOwnProperty.call(input, property)) {
            const msg = `VerifyJSON: Input has not property: ${property}`;
            logger.debug(`Verification: verifyJSON ${JSON.stringify(input)} => is NOT valid\n${msg}`);
            return {
                status: false,
                message: msg
            };
        }
    }

    logger.debug(`Verification: verifyJSON ${Object.keys(input)[0]} => success`);
    return {
        status: true
    };
};


module.exports = {
    verifyText: (text, maxLength, minLength, canBeNull) => {
        return verification.verifyText(text, maxLength, minLength, canBeNull);
    },

    verifyInteger: (figure, min, max, canBeNull) => {
        return verification.verifyInteger(figure, min, max, canBeNull);
    },

    verifyDate: (givenDate, minDate, maxDate, canBeNull) => {
        return verification.verifyDate(givenDate, minDate, maxDate, canBeNull);
    },

    verifyEMail: (email, canBeNull) => {
        return verification.verifyEMail(email, canBeNull);
    },

    verifyJSON: (input, propertiesToHave, canContainMoreProperties) => {
        return verification.verifyJSON(input, propertiesToHave, canContainMoreProperties);
    },

    compareDate: (a, b) => {
        return verification.compareDate(a, b);
    }
};