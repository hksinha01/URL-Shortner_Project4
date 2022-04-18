const express = require("express")
const router = express.Router()

const userController = require("../controller/userController")
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
const middleware = require("../middleware/middleware")

router.post("/register",userController.register)
router.post("/login",userController.login)
router.get("/user/:userId/profile",middleware.authentication,middleware.authByUserId,userController.getProfile)
router.put("/user/:userId/profile",middleware.authentication,middleware.authByUserId,userController.updateProfile)

//Product

router.post("/products",productController.products)
router.get("/products",productController.getProductbyQuery)
router.put("/products/:productId",productController.updateProduct)
router.get("/products/:productId",productController.getProduct)
router.delete("/products/:productId",productController.deleteProduct)

//Cart
router.post("/users/:userId/cart",cartController.createCart)
router.put("/users/:userId/cart",cartController.updateCart)
router.get("/users/:userId/cart",cartController.getCart)
router.delete("/users/:userId/cart",cartController.deleteCart)

//orders

router.post("/users/:userId/orders",orderController.createOrder)
router.put("/users/:userId/orders",orderController.updateOrder)

module.exports = router



