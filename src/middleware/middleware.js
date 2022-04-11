const jwt = require("jsonwebtoken")
const validator = require("../validator/validator")

const authentication = function(req,res){
 try{
     let token = req.headers
     if(!token){
         return res.status(400).send({status:false,msg:"Please pass Token for authentication"})
     }

     let decodedToken = jwt.verify(token,"group11")

     if(!decodedToken){
         return res.status(401).send({status : false ,msg:"Token is Invalid,Please enter a valid token"})
     }

     req["userId"] = decodedToken.userId;
     next();

 }
 catch(error){
     return res.status(500).send({status: false,msg:error.message})
 }
}
module.exports.authentication = authentication



