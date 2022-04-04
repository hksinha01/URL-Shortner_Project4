const express = require("express");
const router = express.Router();

const controller = require("../controller/controller")

router.post("/url/shorten",controller.shorten)
router.get("/:urlCode",controller.urlCode)


module.exports=router