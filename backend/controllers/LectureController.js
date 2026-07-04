const Lecture = require("../models/lecture");
const Course = require("../models/course");
const Instructor = require("../models/instructor");

// Helper function to normalize date to UTC Midnight (removes hours, minutes, seconds, milliseconds)
// and handles timezone shifting correctly by extracting local date parts.
function getUTCMidnight(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

// Create Lecture
exports.createLecture = async (req, res) => {
  try {
    const { courseId, instructorId, batchName, lectureDate } = req.body;

    // Basic validation
    if (!courseId || !instructorId || !batchName || !lectureDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // Normalize date to UTC Midnight
    const normalizedDate = getUTCMidnight(lectureDate);
    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format."
      });
    }

    // Check if course and instructor exist
    const [course, instructor] = await Promise.all([
      Course.findById(courseId),
      Instructor.findById(instructorId)
    ]);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found."
      });
    }

    // Prevent assigning instructor twice on the same date (using the normalized date)
    const conflict = await Lecture.exists({
      instructorId,
      lectureDate: normalizedDate
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Instructor ${instructor.name} is already assigned a lecture on this date (${normalizedDate.toISOString().split("T")[0]}).`
      });
    }

    const lecture = await Lecture.create({
      courseId,
      instructorId,
      batchName: batchName.trim(),
      lectureDate: normalizedDate
    });

    res.status(201).json({
      success: true,
      message: "Lecture scheduled successfully.",
      data: lecture
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message
    });
  }
};

// Get all lectures
exports.getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .populate("courseId", "name level description image")
      .populate("instructorId", "name email")
      .sort({ lectureDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all lectures for a specific instructor
exports.getInstructorLectures = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Check if instructor exists
    const instructorExists = await Instructor.exists({ _id: instructorId });
    if (!instructorExists) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found."
      });
    }

    const lectures = await Lecture.find({ instructorId })
      .populate("courseId", "name level description image")
      .populate("instructorId", "name email")
      .sort({ lectureDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};