const productModel = require("../models/productModel")
const validator = require("../validator/validator")
const aws = require("../aws/aws")


const products = async (req, res) => {
    try {
        const data = req.body

        if (!validator.isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please enter some data" })
        }

        if (validator.isValidReqBody(req.query)) {
            return res.status(400).send({ status: false, msg: "data in query params are not required" })
        }

        const { title, description, price, currencyId, currencyFormat, availableSizes } = data

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msg: "Please enter title" })
        }

        const titleUsed = await productModel.findOne({ title })

        if (titleUsed) {
            return res.status(400).send({ status: false, msg: "title must be unique" })
        }

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, msg: "Please enter description" })
        }

        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, msg: "Please enter Price" })
        }

        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, msg: "Please enter currencyId" })
        }

        if (!validator.isINR(currencyId)) {
            return res.status(400).send({ status: false, msg: "Currencr Id must be INR" })
        }

        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, msg: "Please enter currency format" })
        }

        if (!validator.isRs(currencyFormat)) {
            return res.status(400).send({ status: false, msg: "Currency Format must be Rs" })
        }

        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Please enter available sizes" })
        }

        if (!validator.isValidSizes(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Available Sizes should be from ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']" })
        }

        let files = req.files
        if (files && files.length > 0) {
            var uploadedFileURL = await aws.uploadFile(files[0])

        } else {
            return res.status(400).send({ msg: "No file found" })
        }

        const obj = {
            title: title,
            description: description,
            price: price,
            currencyId: currencyId,
            currencyFormat: currencyFormat,
            availableSizes: availableSizes,
            productImage: uploadedFileURL
        }

        const product = await productModel.create(obj)

        return res.status(201).send({ status: true, msg: "Product Succesfully Created", data: product })
    }
    catch (error) {
        //console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }
}

const getProductbyQuery = async function (req, res) {
    try {
        
        let size = req.query.size
        let name = req.query.name
        let priceGreaterThan = req.query.priceGreaterThan
        let priceLessThan = req.query.priceLessThan
        let priceSort=req.query.priceSort
        let filters = {isDeleted: false}
        
        if(size){
        if (!validator.isValidSizes(size)) {
           return res.status(400).send({status:false,msg:'No Such Size Exist in our Filters ... Select from ["S", "XS", "M", "X", "L", "XXL", "XL"]'})
        }
        filters["availableSizes"] = size
    }

         let arr = []

        if (name) {
            
            const random = await  productModel.find().select({title:1,_id:0})
            for(let i = 0;i < random.length;i++){
            var checkTitle = random[i].title

            let check = checkTitle.includes(name)
             if(check){
                 arr.push(random[i].title)
             }

            }
            
            filters["title"] = arr

        }
        if (!priceGreaterThan) {
            priceGreaterThan = 0
        }
        

        if (priceLessThan) {
            filters["price"] = {$gt: priceGreaterThan, $lt: priceLessThan } 
            
            if(priceSort == 1 || priceSort == -1){
            const products = await productModel.find(filters).sort({ price: priceSort })
            if(products.length == 0){
                return res.status(404).send({ status: false, msg: "No such data found according to the filters"})
            }
         
            return res.status(200).send({ status: true, msg: "Results", data: products })
        }

       
        }
    

        else if (!priceLessThan) {
            filters["price"] = {$gt: priceGreaterThan } 
            
            const products = await productModel.find(filters).sort({ price:45  })
            if(products.length == 0){
                return res.status(404).send({ status: false, msg: "No such data found according to the filters"})
            }
            return res.status(200).send({ status: true, msg: "Results", data: products })
        }


    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }

}


const getProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id ` })
        }

        let getProductData = await productModel.findById(productId)

        if (!getProductData) {
            return res.status(404).send({ status: false, message: "Product is Not Found" })
        }

        return res.status(200).send({ status: true, msg: "Product Details", data: getProductData })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId
        const data = req.body

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid (24 char) Product id" })
        }

          if (!validator.isValidReqBody(data)) {
            if(!(validator.isValidReqBody(req.files)))
            return res.status(400).send({ status: false, msg: "Please enter Data to be updated" })
        }

        let { title, description, price, currencyId, currencyFormat, availableSizes } = data

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: true })
        if (checkProduct) {
            return res.status(400).send({ status: false, msg: "Product Already Deleted" })
        }

        if (title) {
            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, msg: "Please enter title" })
            }

            const titleUsed = await productModel.findOne({ title })
            if (titleUsed) {
                return res.status(400).send({ status: false, msg: "title must be unique" })
            }
        }

        if (description) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, msg: "Please enter description" })
            }
        }

        if (price) {
            if (!validator.isValid(price)) {
                return res.status(400).send({ status: false, msg: "Please enter Price" })
            }
        }

        if(currencyId){
            if (!validator.isValid(currencyId)) {
                return res.status(400).send({ status: false, msg: "Please enter currencyId" })
            }
    
            if (!validator.isINR(currencyId)) {
                return res.status(400).send({ status: false, msg: "Currencr Id must be INR" })
            }
        }

        if(currencyFormat){
            if (!validator.isValid(currencyFormat)) {
                return res.status(400).send({ status: false, msg: "Please enter currency format" })
            }
    
            if (!validator.isRs(currencyFormat)) {
                return res.status(400).send({ status: false, msg: "Currency Format must be Rs" })
            }
        }

        if(availableSizes){
            if (!validator.isValid(availableSizes)) {
                return res.status(400).send({ status: false, msg: "Please enter available sizes" })
            }
    
            if (!validator.isValidSizes(availableSizes)) {
                return res.status(400).send({ status: false, msg: "Available Sizes should be from ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']" })
            }    
        }

        if (req.files) {
            let files = req.files
            if (files && files.length > 0) {
                var uploadedFileURL = await aws.uploadFile(files[0])
            }
        }

        const productUpdated = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: data }, { new: true })
        if (!productUpdated) {
            return res.staus(404).send({ status: false, msg: "No Such Product exists" })
        }

        productUpdated["productImage"] = uploadedFileURL

        return res.status(200).send({ status: true, msg: "Data Updated Succesfully", data: productUpdated })
    }

    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}



const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid (24 char) Product id" })
        }

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: true })
        if (checkProduct) {
            return res.status(400).send({ status: false, msg: "Product Already Deleted" })
        }
        else {
            let deleteNow = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
            if (deleteNow == null) {
                return res.status(404).send({ status: false, msg: "Product Not Exists" });
            }
            else {
                return res.status(200).send({ status: true, msg: "Product Deleted Successfully", data: deleteNow })
            }
        }

    }
    catch (error) {
        return res.status(500).send({ msg: "Error", error: error.message })
    }

}


module.exports = { products, getProductbyQuery, getProduct, updateProduct, deleteProduct, }