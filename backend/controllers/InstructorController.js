const Instructor = require("../models/instructor");

// ─── Shared validation helpers ────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX  = /^[a-zA-Z\s'-]+$/;

function validateEmail(email) {
  if (!email || typeof email !== "string") return "Email is required.";
  const trimmed = email.trim();
  if (trimmed.length < 5)  return "Email must be at least 5 characters.";
  if (trimmed.length > 100) return "Email must not exceed 100 characters.";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address (e.g. user@domain.com).";
  return null;
}

function validateName(name) {
  if (!name || typeof name !== "string") return "Name is required.";
  const trimmed = name.trim();
  if (trimmed.length < 2)  return "Name must be at least 2 characters.";
  if (trimmed.length > 60) return "Name must not exceed 60 characters.";
  if (!NAME_REGEX.test(trimmed)) return "Name can only contain letters, spaces, hyphens, and apostrophes.";
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

// Get all instructors
exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().lean();
    res.status(200).json({
      success: true,
      count: instructors.length,
      data: instructors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new instructor
exports.createInstructor = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate name
    const nameErr = validateName(name);
    if (nameErr) {
      return res.status(400).json({
        success: false,
        message: nameErr,
      });
    }

    // Validate email
    const emailErr = validateEmail(email);
    if (emailErr) {
      return res.status(400).json({
        success: false,
        message: emailErr,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

 
    const existingInstructor = await Instructor.findOne({
      email: normalizedEmail,
    });

    if (existingInstructor) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered. Please use a different email.",
      });
    }

    const instructor = await Instructor.create({
      name: name.trim(),
      email: normalizedEmail,
    });

    return res.status(201).json({
      success: true,
      message: "Instructor created successfully.",
      data: instructor,
    });
  } catch (error) {
    console.error("Create Instructor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};