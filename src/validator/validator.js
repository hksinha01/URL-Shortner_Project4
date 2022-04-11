const mongoose = require("mongoose")

const isValidobjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}

isValidReqBody = function(requestBody){
    return Object.keys(requestBody).length > 0
}

isValid = function(value){
    if(typeof value === "undefined" || value === null){
        return false
    }
    if(typeof value === "string" && value.trim().length === 0){
        return false
    }
    if(typeof value ==="number" && value.toString().trim().length === 0){
        return false
    }

    return true
}

module.exports.isValidReqBody=isValidReqBody
module.exports.isValid=isValid
module.exports.isValidobjectId=isValidobjectId