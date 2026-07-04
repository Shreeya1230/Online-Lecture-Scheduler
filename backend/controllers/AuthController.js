const Instructor = require("../models/instructor");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email || typeof email !== "string") return "Email is required.";
  const trimmed = email.trim();
  if (trimmed.length < 5)  return "Email must be at least 5 characters.";
  if (trimmed.length > 100) return "Email must not exceed 100 characters.";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address (e.g. user@domain.com).";
  return null;
}

function validatePassword(password, label = "Password") {
  if (!password || typeof password !== "string") return `${label} is required.`;
  if (password.length < 6)  return `${label} must be at least 6 characters.`;
  if (password.length > 50) return `${label} must not exceed 50 characters.`;
  if (!/[a-zA-Z]/.test(password)) return `${label} must contain at least one letter.`;
  if (!/[0-9]/.test(password))    return `${label} must contain at least one number.`;
  return null;
}


exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: "Login role is required." });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const normalizedEmail = email.trim().toLowerCase();

    
    if (role === "admin") {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required."
        });
      }
      const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || "";
      if (normalizedEmail === adminEmail && password === adminPassword) {
        return res.status(200).json({
          success: true,
          message: "Admin authenticated successfully.",
          role: "admin",
          user: {
            name: "System Admin",
            email: process.env.ADMIN_EMAIL
          }
        });
      } else {
        return res.status(401).json({ success: false, message: "Invalid Admin credentials." });
      }
    }

    // 2. Instructor authentication check (email + password)
    else if (role === "instructor") {
      if (!password) {
        return res.status(400).json({ success: false, message: "Password is required." });
      }
      if (password.length > 50) {
        return res.status(400).json({ success: false, message: "Password must not exceed 50 characters." });
      }

      const instructor = await Instructor.findOne({ email: normalizedEmail }).lean();
      if (!instructor) {
        return res.status(401).json({
          success: false,
          message: "No registered instructor found with this email."
        });
      }

      const storedPassword = instructor.password || "instructor123";
      if (password !== storedPassword) {
        return res.status(401).json({ success: false, message: "Incorrect password. Please try again." });
      }

      return res.status(200).json({
        success: true,
        message: "Instructor authenticated successfully.",
        role: "instructor",
        user: {
          id: instructor._id,
          name: instructor.name,
          email: instructor.email
        }
      });
    }

    // Invalid role
    else {
      return res.status(400).json({ success: false, message: "Invalid login role specified." });
    }

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
  }
};

// Change instructor password
exports. changePassword = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!instructorId) {
      return res.status(400).json({ success: false, message: "Instructor ID is required." });
    }
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is required." });
    }

    // Validate new password
    const pwdErr = validatePassword(newPassword, "New password");
    if (pwdErr) return res.status(400).json({ success: false, message: pwdErr });

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ success: false, message: "Instructor not found." });
    }

    const storedPassword = instructor.password || "instructor123";
    if (currentPassword !== storedPassword) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    instructor.password = newPassword;
    await instructor.save();

    return res.status(200).json({ success: true, message: "Password changed successfully." });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
  }
};
