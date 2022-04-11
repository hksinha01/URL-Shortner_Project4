const userModel = require("../models/userModel")
const validator = require("../validator/validator")
const middleware = require("../middleware/middleware")

const register = function(req,res){
    try{ 
        const data =req.body
        if(!validator.isValidReqBody(data)){
            return res.status(400).send({status:false , msg : "Enter valid data"})
        }

    }
    catch(error){
        console.log(error)
        res.status(500).send({status:false,msg:error.message })
    }

}

module.exports.register = register