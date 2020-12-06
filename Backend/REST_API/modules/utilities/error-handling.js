var errorHandling = Object.create(null);

errorHandling.getMessage = err => {
    var message;
    switch(err.code){
        case "ER_DUP_ENTRY":
            message = {"message": "Already assigned."};
            break;
        case "ER_NO_REFERENCED_ROW_2":
            message = {"message": "Foreign key is missing."};
            break;
        case "ER_TRUNCATED_WRONG_VALUE":
            message = {"message": "Type of value is wrong."};
            break;
        default:
            message = {"message": "An unknown Error occured."};
    }
    return message;
}

module.exports = {
    getMessage: err => {
        return errorHandling.getMessage(err);
    }
}