const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/InstructorController");

router.get("/", instructorController.getInstructors);
router.post("/", instructorController.createInstructor);

module.exports = router;
