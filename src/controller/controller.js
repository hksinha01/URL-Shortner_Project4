const urlModel = require("../model/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')

const isValidReqBody = function (requestBody) {

    return Object.keys(requestBody).length > 0
}

const isValid = function (value) {

    if (typeof value === "undefined" || value === null) {
        return false
    }
    if (typeof value === "string" && value.trim().length == 0) {
        return false
    }
    return true
}


const shorten = async function (req, res) {

    try {
        const baseUrl = "http://localhost:3000";
        const data = req.body;

        if(isValidReqBody(req.query)){
            return res.status(400).send({status : false,msg : "Query Should Not be Present"})
        }

        if (!isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Data" })
        }

        const { longUrl } = data

        // if (!isValid(urlCode)) {
        //     return res.status(400).send({ status: false, msg: "Bad Request!!! Please Provide Url Code" })
        // }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "Bad Request!!! Please Provide Long Url to Be Shorten" })
        }

        if (!validUrl.isUri(baseUrl)) {
            console.log("invalid base url")
            return res.status(400).send({ status: false, msg: 'Invalid base URL' })
        }

        const short = shortid.generate().toLowerCase().trim()

        if (validUrl.isUri(longUrl)) {
    
            let url =await urlModel.findOne({ longUrl}).select({createdAt:0,updatedAt:0,__v:0})
            if (url) {
                return res.status(200).send({ status: true, msg: "This Url was Already Shorten", data: url })
            }
            
            const shortUrl = baseUrl + '/' + short
            
            let input = { longUrl : data.longUrl, shortUrl:shortUrl, urlCode : short}
            const CreatedUrl = await urlModel.create(input)
            const final = {
                longUrl : CreatedUrl.longUrl, shortUrl:CreatedUrl.shortUrl, urlCode : CreatedUrl.urlCode
            }
            res.status(201).send({ status: true, msg: "Short Url Created Succesfully", data: final })

        }
        else {
            res.status(400).send({ status: false, msg: "Invalid Long Url" })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }

}

const urlCode = async function(req,res){
    try{
        const code = req.params.urlCode;
        if(!isValid(code.trim().toLowerCase())){
            return res.status(400).send({status : false , msg : "Please pass Url Code In Params"})
        }

        if(isValidReqBody(req.body)){
            return res.status(400).send({status : false,msg : "Body Should Not be Present"})
        }
        if(isValidReqBody(req.query)){
            return res.status(400).send({status : false,msg : "Query Should Not be Present"})
        }
        const data = await urlModel.findOne({urlCode: code}).select({createdAt:0,updatedAt:0,__v:0})
        if(data){
            return res.status(302).redirect(data.longUrl)
           
        }
        else{
        return res.status(404).send({status:false,msg : "No Such URL found"})
        }
    }
    catch(error){
        return res.status(500).send({status: false,msg:error.message})
    }
}

module.exports.shorten = shorten
module.exports.urlCode = urlCode