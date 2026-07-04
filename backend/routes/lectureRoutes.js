const express = require("express");
const router = express.Router();
const lectureController = require("../controllers/LectureController");

router.get("/", lectureController.getLectures);
router.post("/", lectureController.createLecture);
router.get("/instructor/:instructorId", lectureController.getInstructorLectures);

module.exports = router;
