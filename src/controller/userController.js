const userModel = require("../models/userModel")
const validator = require("../validator/validator")
const middleware = require("../middleware/middleware")
const bcrypt = require ('bcrypt');
const aws = require("../aws/aws")
const jwt = require("jsonwebtoken")



const register = async function(req,res){
    try{ 
        const data =req.body

        if(!validator.isValidReqBody(data)){
            return res.status(400).send({status:false , msg : "Enter valid data"})
        }

        if(validator.isValidReqBody(req.query)){
            return res.status(400).send({status:false , msg:"data in query params are not required"})
        }

        const {fname,lname,email,profileImage,phone,address} = data

        if(!validator.isValid(fname)){
            return res.status(400).send({status : false ,msg :"Please enter Valid First Name"})
        }

        
        if(!validator.isValid(lname)){
            return res.status(400).send({status : false ,msg :"Please enter Valid Last Name"})
        }

        if(!validator.isValid(email)){
            return res.status(400).send({status : false ,msg :"Please enter a Email Id"})

        }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

             }
        
        const duplicateEmail = await userModel.findOne({email})
        if(duplicateEmail){
            return res.status(400).send({status: false ,msg: "This Email ID already exisits in out Database...Please Enter a unique email id"})     
        }

        if(!validator.isValid(phone)){
            return res.status(400).send({status : false ,msg :"Please enter a Email Id"})

        }
        
        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: "Mobile Number is not valid" })
        }
        
        const duplicatePhone = await userModel.findOne({phone})
        if(duplicatePhone){
            return res.status(400).send({status: false ,msg: "This Phone Number already exisits in out Database...Please Enter a unique Phone Number"})     
        }

        if(!validator.isValid(data.password)){
            return res.status(400).send({status : false, msg: "Enter password"})
        }
        if(!(/^.{8,15}$/).test(data.password)){
            return res.status(400).send({status: false,msg:"Password Length should be between 8 and 15"})
        }
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        data.password = await bcrypt.hash(data.password, salt);

        const {shipping,billing} = address

        if(!validator.isValid(shipping.street)){
            return res.status(400).send({status : false,msg: " Enter Street Name"})
        }

        if(!validator.isValid(shipping.city)){
            return res.status(400).send({status : false,msg: " Enter City Name"})
        }

        if(!validator.isValid(shipping.pincode)){
            return res.status(400).send({status : false,msg: " Enter Pincode"})
        }

        if(!validator.isValid(billing.street)){
            return res.status(400).send({status : false,msg: " Enter Street Name"})
        }

        if(!validator.isValid(billing.city)){
            return res.status(400).send({status : false,msg: " Enter City Name"})
        }

        if(!validator.isValid(billing.pincode)){
            return res.status(400).send({status : false,msg: " Enter Pincode"})
        }
        
        let files = req.files
        if(files && files.length > 0){
            let uploadedFileURL = await aws.uploadFile(files[0])
            // return res.status(201).send({status: true, message: "file uploaded succesfully", data: uploadedFileURL})
           
        }else{
            return res.status(400).send({ msg: "No file found" })
        }

      
        const input = {
            fname:fname,
            lname:lname,
            email:email,
            profileImage:uploadedFileURL,
            phone:phone,
            password:data.password,
            address:address
        }

        const output = await userModel.create(input)


    }
    catch(error){
        console.log(error)
        res.status(500).send({status:false,msg:error.message })
    }

}

const login = async function(req,res){
    try{
        const data = req.body
        if(!validator.isValidReqBody(data)){
            return res.status(400).send({status : false,msg:"Please enter some Data from Your end"})
        }

        const {email,password} = data

        if(!validator.isValid(email)){
            return res.status(400).send({status: false,msg:"Please enter Email Id"})
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

             }

        if(!validator.isValid(password)){
            return res.status(400).send({status: false,msg:"Please enter Password"})
        }
        if(!(/^.{8,15}$/).test(data.password)){
            return res.status(400).send({status: false,msg:"Password Length should be between 8 and 15"})
        }

        const user = await userModel.findOne({email,password})

        if(!user){
            return res.status(404).send({status:false,msg:"No Such Data Found....Please Check Credentials"})
        }

        const token = jwt.sign({
            userId:user._id.toString(),
            group:"11",
            iat: Math.floor(Date.now() / 1000),         //doubt clear about this after some time   //payload
            exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60    //1 hours:minute:second
        },"group11")

        res.setHeader("x-api-key",token)
        const output = {
            userId:user._id,
            token:token
        }

       return res.status(200).send({status:true,msg:"User login successfull",data:output})

    }
    catch(error){
        return res.status(500).send({status: false,msg:error.message})
    }
}

module.exports.register = register
module.exports.login = login