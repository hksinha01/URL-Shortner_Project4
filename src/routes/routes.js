const express = require("express")
const router = express.Router()

const userController = require("../controller/userController")
const productController = require("../controller/productController")
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

module.exports = router



