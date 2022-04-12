const express = require("express")
const router = express.Router()

const userController = require("../controller/userController")
const middleware = require("../middleware/middleware")

router.post("/register",userController.register)
router.post("/login",userController.login)
router.get("/user/:userId/profile",middleware.authentication,middleware.authByUserId,userController.getProfile)

module.exports = router



