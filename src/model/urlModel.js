const mongoose = require("mongoose")

const UrlSchema = new mongoose.Schema({

      urlCode: { 
                 type: String,
                 lowercase:true,
                 trim:true
                },
          
        
      longUrl: {
                 type : String,
                 required:true,
               //  match: ubbdn,
                 trim:true
               },

          
      shortUrl: {
                 type:String,
                 unique:true
                } 


},{timestamps:true})

module.exports = mongoose.model("Url",UrlSchema)