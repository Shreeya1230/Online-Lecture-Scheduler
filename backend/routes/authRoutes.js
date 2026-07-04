const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");

router.post("/login", authController.login);
router.put("/change-password/:id", authController.changePassword);


module.exports = router;
