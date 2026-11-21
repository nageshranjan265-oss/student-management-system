const express = require("express");

const router = express.Router();

const {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const authorizeRoles = require("../middleware/roleMiddleware");

// Student Routes

// Admin and Teacher can add students
router.post("/", authorizeRoles("admin", "teacher"), createStudent);

// Admin and Teacher can view students
router.get("/", authorizeRoles("admin", "teacher"), getStudents);

router.get("/:id", authorizeRoles("admin", "teacher"), getStudentById);

// Only Admin can update students
router.put("/:id", authorizeRoles("admin"), updateStudent);

// Only Admin can delete students
router.delete("/:id", authorizeRoles("admin"), deleteStudent);

module.exports = router;