const validator = require("../validator/validator")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const orderModel = require("../models/orderModel")
const cartModel = require("../controller/cartController")

const createOrder = async function(req,res){
    try{
// - Create an order for the user
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get cart details in the request body
      
     const id = req.params.userId;
     const input = req.body;

     if (!validator.isValidobjectId(id)) {
        return res.status(400).send({ status: false, message: `${id} is not a valid user id` })
    }

     if(!validator.isValidReqBody(input)){
         return res.status(400).send({status:false,msg:"Please Enter some data to create"})
     }

     const {userId,items} = input 

     if (!validator.isValid(userId)) {
        return res.status(400).send({ status: true, message: 'userid is required in the request body' })
    }
    if (!validator.isValidobjectId(userId)) {
        return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
    }

    if(id !== userId){
        return res.status(400).send({status:false,msg:"Pass Same UserID"})
    }

    const user = await userModel.findOne({userId: id})
    if(!user){
        return res.status(400).send({status:false,msg:"No Such User Exists"})
    }

    if (items.length === 0) {
        return res.status(400).send({ status: false, msg: 'items cant be empty' })
    }
    if (!validator.isValid(items)) {
        return res.status(400).send({ status: false, message: 'items is required in the request body' })
    }

    const {productId,quantity} = items[0]
    
    const product = await productModel.findOne({_id:productId,isDeleted:false})
    if(!product){
        return res.status(404).send({status: false,msg:"No such Product Found"})
    }

    const totalPrice = quantity * product.price
    const final = {
         userId:id,
         items:items,
         totalPrice:totalPrice,
         totalItems:items.length,
         totalQuantity:quantity         


    }

    
    const createProduct = await orderModel.create(final)
    return res.status(201).send({ status: true, msg: 'sucesfully created order', data: createProduct })
     
     

    }
    catch(error){
     console.log(error)
     return res.status(500).send({status:false,msg:error.message})
    }
}

const updateOrder =async function(req,res){
    try{

    }
    catch(error){

    }
}

module.exports = {createOrder,updateOrder}
