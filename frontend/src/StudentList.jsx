import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function StudentList() {

    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState("");

    const [deleteStudentId, setDeleteStudentId] = useState(null);

    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Student Profile State
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [courseFilter, setCourseFilter] = useState("All");


    // Fetch Students
    const fetchStudents = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/api/students`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setStudents(response.data.data);

        } catch (error) {

            setMessage("Unable to load students.");

        }

    };


    // Delete Student
    const handleDelete = async () => {

        if (!deleteStudentId) return;

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_URL}/api/students/${deleteStudentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Student deleted successfully!");

            setDeleteStudentId(null);

            fetchStudents();

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to delete student."
            );

        }

    };


    // Edit Student
    const handleEdit = (student) => {

        setEditingStudent(student._id);

        setEditForm({
            name: student.name || "",
            email: student.email || "",
            rollNumber: student.rollNumber || "",
            phone: student.phone || "",
            age: student.age || "",
            course: student.course || "",
            address: student.address || "",
        });

    };


    // Update Student
    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_URL}/api/students/${editingStudent}`,
                editForm,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessage("Student updated successfully!");

            setEditingStudent(null);
            setEditForm({});

            fetchStudents();

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to update student."
            );

        }

    };


    // Load Students
    useEffect(() => {

        fetchStudents();

    }, []);


    // Check Admin Role
    const isAdmin =
        JSON.parse(localStorage.getItem("user") || "{}")?.role === "admin";


    // Search and Course Filtering
    const filteredStudents = students.filter((student) => {

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            student.name?.toLowerCase().includes(search) ||
            student.rollNumber?.toLowerCase().includes(search) ||
            student.phone?.toLowerCase().includes(search);

        const matchesCourse =
            courseFilter === "All" ||
            student.course === courseFilter;

        return matchesSearch && matchesCourse;

    });


    // Get Available Courses
    const courses = [
        ...new Set(
            students
                .map((student) => student.course)
                .filter(Boolean)
        ),
    ];


    // Export Student Records to Excel
    const exportToExcel = () => {

        if (filteredStudents.length === 0) {

            setMessage("No student records available to export.");

            return;

        }

        const excelData = filteredStudents.map((student, index) => ({

            "S.No.": index + 1,
            "Student Name": student.name,
            "Email": student.email,
            "Roll Number": student.rollNumber,
            "Phone": student.phone,
            "Age": student.age,
            "Course": student.course,
            "Address": student.address,

        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Student Records"
        );

        XLSX.writeFile(
            workbook,
            "Student_Records.xlsx"
        );

        setMessage("Student records exported successfully!");

    };


    // Export Student Records to PDF
    const exportToPDF = () => {

        const doc = new jsPDF("landscape");

        // Report Title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Student Management System", 14, 18);

        // Report Subtitle
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Student Records Report", 14, 27);

        // Generation Date
        doc.setFontSize(10);
        doc.text(
            `Generated on: ${new Date().toLocaleDateString()}`,
            14,
            35
        );

        // Total Students
        doc.text(
            `Total Students: ${filteredStudents.length}`,
            14,
            42
        );

        // Student Table
        autoTable(doc, {
            startY: 50,

            head: [[
                "S.No.",
                "Student Name",
                "Email",
                "Roll Number",
                "Phone",
                "Age",
                "Course",
                "Address"
            ]],

            body: filteredStudents.map((student, index) => [
                index + 1,
                student.name || "",
                student.email || "",
                student.rollNumber || "",
                student.phone || "",
                student.age || "",
                student.course || "Not Assigned",
                student.address || ""
            ]),

            theme: "grid",

            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: "linebreak"
            },

            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: "bold"
            },

            alternateRowStyles: {
                fillColor: [245, 247, 250]
            }
        });

        // Download PDF
        doc.save("Student_Records.pdf");

    };


    return (

        <div className="student-list">

            {/* Page Title and Action Bar */}
            <div className="student-list-header">

                <h2>Student Records</h2>

                <div className="student-header-actions">

                    <button
                        className="export-excel-btn"
                        onClick={exportToExcel}
                    >
                        📥 Export to Excel
                    </button>

                    <button
                        className="export-pdf-btn"
                        onClick={exportToPDF}
                    >
                        📄 Export to PDF
                    </button>

                    <button
                        className="add-student-btn"
                        onClick={() =>
                            window.dispatchEvent(new Event("openAddStudent"))
                        }
                    >
                        + Add Student
                    </button>

                </div>

            </div>


            {/* Search and Course Filter */}
            <div className="student-filters">

                <input
                    type="text"
                    placeholder="Search by name, roll number or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                >

                    <option value="All">All Courses</option>

                    {courses.map((course) => (

                        <option key={course} value={course}>
                            {course}
                        </option>

                    ))}

                </select>

            </div>


            {/* Success and Error Messages */}
            {message && <p>{message}</p>}


            {/* Edit Student Form */}
            {editingStudent && (

                <form
                    onSubmit={handleUpdate}
                    className="edit-student-form"
                >

                    <h3>Edit Student Details</h3>

                    <input
                        type="text"
                        placeholder="Student Name"
                        value={editForm.name}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                name: e.target.value,
                            })
                        }
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={editForm.email}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                email: e.target.value,
                            })
                        }
                        required
                    />

                    <input
                        type="text"
                        placeholder="Roll Number"
                        value={editForm.rollNumber}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                rollNumber: e.target.value,
                            })
                        }
                        required
                    />

                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={editForm.phone}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                phone: e.target.value,
                            })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Age"
                        value={editForm.age}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                age: e.target.value,
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Course"
                        value={editForm.course}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                course: e.target.value,
                            })
                        }
                    />

                    <textarea
                        placeholder="Address"
                        value={editForm.address}
                        onChange={(e) =>
                            setEditForm({
                                ...editForm,
                                address: e.target.value,
                            })
                        }
                    />

                    <button type="submit">
                        Update Student
                    </button>

                    <button
                        type="button"
                        onClick={() => setEditingStudent(null)}
                    >
                        Cancel
                    </button>

                </form>

            )}


            {/* Student Table */}
            {filteredStudents.length === 0 ? (

                <p>
                    {students.length === 0
                        ? "No students found."
                        : "No matching students found."}
                </p>

            ) : (

                <table>

                    <thead>

                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Roll Number</th>
                            <th>Phone</th>
                            <th>Age</th>
                            <th>Course</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {filteredStudents.map((student) => (

                            <tr key={student._id}>

                                <td>{student.name}</td>

                                <td>{student.email}</td>

                                <td>{student.rollNumber}</td>

                                <td>{student.phone}</td>

                                <td>{student.age}</td>

                                <td>

                                    <span
                                        className={`course-badge ${student.course
                                            ?.toLowerCase()
                                            .replace(/[^a-z0-9]/g, "-")}`}
                                    >
                                        {student.course || "Not Assigned"}
                                    </span>

                                </td>

                                <td>{student.address}</td>

                                <td>

                                    <div className="action-buttons">

                                        {/* View Profile Button */}
                                        <button
                                            className="view-profile-btn"
                                            onClick={() => setSelectedStudent(student)}
                                        >
                                            👁️ View
                                        </button>

                                        {/* Admin Only Actions */}
                                        {isAdmin && (

                                            <>

                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    ✏️ Edit
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        setDeleteStudentId(student._id)
                                                    }
                                                >
                                                    🗑️ Delete
                                                </button>

                                            </>

                                        )}

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}


            {/* Student Profile Modal */}
            {selectedStudent && (

                <div className="student-profile-overlay">

                    <div className="student-profile-modal">

                        {/* Profile Header */}
                        <div className="student-profile-header">

                            <div className="student-profile-avatar">
                                👨‍🎓
                            </div>

                            <div>

                                <h2>{selectedStudent.name}</h2>

                                <p>Student Profile</p>

                            </div>

                        </div>


                        {/* Student Details */}
                        <div className="student-profile-details">

                            <div className="profile-detail-item">

                                <span>📧 Email Address</span>

                                <strong>
                                    {selectedStudent.email || "Not Available"}
                                </strong>

                            </div>

                            <div className="profile-detail-item">

                                <span>🆔 Roll Number</span>

                                <strong>
                                    {selectedStudent.rollNumber || "Not Available"}
                                </strong>

                            </div>

                            <div className="profile-detail-item">

                                <span>📱 Phone Number</span>

                                <strong>
                                    {selectedStudent.phone || "Not Available"}
                                </strong>

                            </div>

                            <div className="profile-detail-item">

                                <span>🎂 Age</span>

                                <strong>
                                    {selectedStudent.age || "Not Available"}
                                </strong>

                            </div>

                            <div className="profile-detail-item">

                                <span>📚 Course</span>

                                <strong>
                                    {selectedStudent.course || "Not Assigned"}
                                </strong>

                            </div>

                            <div className="profile-detail-item">

                                <span>📍 Address</span>

                                <strong>
                                    {selectedStudent.address || "Not Available"}
                                </strong>

                            </div>

                        </div>


                        {/* Close Button */}
                        <button
                            className="close-profile-btn"
                            onClick={() => setSelectedStudent(null)}
                        >
                            Close Profile
                        </button>

                    </div>

                </div>

            )}


            {/* Delete Confirmation Modal */}
            {deleteStudentId && (

                <div className="delete-modal-overlay">

                    <div className="delete-modal">

                        <div className="delete-modal-icon">
                            🗑️
                        </div>

                        <h3>Delete Student?</h3>

                        <p>
                            Are you sure you want to permanently delete
                            this student record? This action cannot be undone.
                        </p>

                        <div className="delete-modal-actions">

                            <button
                                className="cancel-delete-btn"
                                onClick={() => setDeleteStudentId(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-delete-btn"
                                onClick={handleDelete}
                            >
                                Yes, Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default StudentList;