const Course = require("../models/course");

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name || !level || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, level, and description are required."
      });
    }

    // Resolve the image field (file upload path or text URL fallback)
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const course = await Course.create({
      name: name.trim(),
      level: level.trim(),
      description: description.trim(),
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
