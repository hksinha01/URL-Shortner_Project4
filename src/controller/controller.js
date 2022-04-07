const urlModel = require("../model/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')


//-----------------------------redis for cache--------------------------------------------------------
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    19651,
  "redis-19651.c53.west-us.azure.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("WnaT0ldWFGhcYkvzJvsf0UPrUX2H7VJm", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//....................................................................................................................

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

        if (!isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Data" })
        }

        if(isValidReqBody(req.params)){
            return res.status(400).send({status : false,msg : "Params Shouldnt Be Present"})
        }

        if(isValidReqBody(req.query)){
            return res.status(400).send({status : false,msg : "Query Shouldnt Be Present"})
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
            return res.status(401).send({ status: false, msg: 'Invalid base URL' })
        }

        const short = shortid.generate()

        if (validUrl.isUri(longUrl)) {
            
            
            let checkforUrl = await GET_ASYNC(`${longUrl}`)
           if (checkforUrl) {
           console.log("This is from cache")
            return res.status(200).send({ status: true, "data": JSON.parse(checkforUrl) })
          }
    //---FETCH THE DATA IN MONGO DB IF IT IS NOT PRESENT IN CACHE


    
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
            await SET_ASYNC(`${longUrl}`, JSON.stringify(CreatedUrl))

           return res.status(201).send({ status: true, msg: "Short Url Created Succesfully", data: final })

        }
        else {
           return res.status(401).send({ status: false, msg: "Invalid Long Url" })
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

        if(!isValid(code.toLowerCase())){
            return res.status(400).send({status : false , msg : "Please pass Url Code In Params"})
        }
        if(isValidReqBody(req.body)){
            return res.status(400).send({status : false,msg : "Body Shouldnt Be Present"})
        }

        if(isValidReqBody(req.query)){
            return res.status(400).send({status : false,msg : "Query Shouldnt Be Present"})
        }

        let cahcedUrlCode = await GET_ASYNC(`${req.params.urlCode}`)

        if(cahcedUrlCode) {
            parseData = JSON.parse(cahcedUrlCode)
            console.log("THis is from cache")
            return res.status(302).redirect(parseData.longUrl)
        }

        const data = await urlModel.findOne({urlCode: code}).select({createdAt:0,updatedAt:0,__v:0})
        if(!data){
            return res.status(404).send({status:false,msg : "No Such URL found"})        
        }

        else{
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(data))

            return res.status(302).redirect(data.longUrl)

        }
    }
    catch(error){
        return res.status(500).send({status: false,msg:error.message})
    }
}

module.exports.shorten = shorten
module.exports.urlCode = urlCode