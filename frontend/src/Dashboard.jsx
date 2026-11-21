import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

import StudentManagement from "./StudentManagement";
import StudentList from "./StudentList";
import ChangePassword from "./ChangePassword";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

const COLORS = [
    "#2563eb",
    "#7c3aed",
    "#059669",
    "#f59e0b",
    "#ef4444",
    "#0891b2"
];

function Dashboard({ user, onLogout }) {

    const [totalStudents, setTotalStudents] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalTeachers, setTotalTeachers] = useState(0);

    const [recentStudents, setRecentStudents] = useState([]);

    const [courseData, setCourseData] = useState([]);
    const [growthData, setGrowthData] = useState([]);

    const [activePage, setActivePage] = useState("dashboard");

    // Teacher Form States
    const [teacherName, setTeacherName] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherPassword, setTeacherPassword] = useState("");

    const [teacherMessage, setTeacherMessage] = useState("");
    const [teacherError, setTeacherError] = useState("");
    const [teacherLoading, setTeacherLoading] = useState(false);

    // View Teachers States
    const [teachers, setTeachers] = useState([]);
    const [teachersLoading, setTeachersLoading] = useState(false);
    const [teachersError, setTeachersError] = useState("");

    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    useEffect(() => {

        const fetchStudents = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:5000/api/students",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const students = response.data.data || [];

        setTotalStudents(students.length);

        // Calculate Total Courses
        const uniqueCourses = [
            ...new Set(
                students
                    .map((student) => student.course)
                    .filter(Boolean)
            )
        ];

        setTotalCourses(uniqueCourses.length);

        // Course Chart Data
        const courseCounts = students.reduce((acc, student) => {
            const course = student.course || "Not Assigned";

            acc[course] = (acc[course] || 0) + 1;

            return acc;
        }, {});

        const chartData = Object.keys(courseCounts).map((course) => ({
            name: course,
            students: courseCounts[course]
        }));

        setCourseData(chartData);

        // Monthly Student Growth
        const monthlyCounts = {};
        const lastSixMonths = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();

            date.setDate(1);
            date.setMonth(date.getMonth() - i);

            const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            const monthName = date.toLocaleString("en-US", {
                month: "short"
            });

            monthlyCounts[key] = 0;

            lastSixMonths.push({
                key,
                month: monthName
            });
        }

        students.forEach((student) => {
            let registrationDate = student.createdAt
                ? new Date(student.createdAt)
                : null;

            if (
                (!registrationDate ||
                    isNaN(registrationDate.getTime())) &&
                student._id
            ) {
                registrationDate = new Date(
                    parseInt(student._id.substring(0, 8), 16) * 1000
                );
            }

            if (
                registrationDate &&
                !isNaN(registrationDate.getTime())
            ) {
                const key = `${registrationDate.getFullYear()}-${String(
                    registrationDate.getMonth() + 1
                ).padStart(2, "0")}`;

                if (monthlyCounts[key] !== undefined) {
                    monthlyCounts[key]++;
                }
            }
        });

        const growthChartData = lastSixMonths.map((item) => ({
            month: item.month,
            students: monthlyCounts[item.key]
        }));

        setGrowthData(growthChartData);

        // Sort Students
        const sortedStudents = [...students].sort((a, b) => {
            const getTimestamp = (student) => {
                if (student.createdAt) {
                    return new Date(student.createdAt).getTime();
                }

                return parseInt(
                    String(student._id).substring(0, 8),
                    16
                ) * 1000;
            };

            return getTimestamp(b) - getTimestamp(a);
        });

        setRecentStudents(sortedStudents.slice(0, 5));

        // Total Teachers - ADMIN ONLY
        if (user?.role === "admin") {
            const teacherResponse = await axios.get(
                "http://localhost:5000/api/auth/teachers/count",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTotalTeachers(teacherResponse.data.totalTeachers);
        } else {
            setTotalTeachers(0);
        }

    } catch (error) {
        console.log(
            "Unable to load dashboard statistics:",
            error
        );
    }
};

    }, []);

    // ==========================================
    // FETCH ALL TEACHERS
    // ==========================================

    const fetchTeachers = async () => {

        setTeachersLoading(true);
        setTeachersError("");

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/auth/teachers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTeachers(response.data.teachers || []);
            setTotalTeachers(response.data.totalTeachers || 0);

        } catch (error) {

            setTeachersError(
                error.response?.data?.message ||
                "Unable to load teachers. Please try again."
            );

        } finally {

            setTeachersLoading(false);
        }
    };

    // ==========================================
    // LOAD TEACHERS WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {

        if (activePage === "viewTeachers" && user?.role === "admin") {
            fetchTeachers();
        }

    }, [activePage, user?.role]);

    // ==========================================
    // ADD NEW TEACHER
    // ==========================================

    const handleAddTeacher = async (e) => {

    e.preventDefault();

    setTeacherMessage("");
    setTeacherError("");
    setTeacherLoading(true);

    try {

        // Get Admin authentication token
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found. Please log in again.");
        }

        // Create Teacher (Admin Only)
        const response = await axios.post(
            "http://localhost:5000/api/auth/teachers",
            {
                name: teacherName,
                email: teacherEmail,
                password: teacherPassword
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setTeacherMessage(
            response.data.message || "Teacher created successfully!"
        );

        setTeacherName("");
        setTeacherEmail("");
        setTeacherPassword("");

        // Refresh Teacher Count
        const teacherResponse = await axios.get(
            "http://localhost:5000/api/auth/teachers/count",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setTotalTeachers(teacherResponse.data.totalTeachers);

    } catch (error) {

        setTeacherError(
            error.response?.data?.message ||
            error.message ||
            "Unable to create teacher. Please try again."
        );

    } finally {

        setTeacherLoading(false);
    }
};

    // ==========================================
    // OPEN ADD STUDENT PAGE
    // ==========================================

    useEffect(() => {

        const openAddStudent = () => {
            setActivePage("add");
        };

        window.addEventListener("openAddStudent", openAddStudent);

        return () => {
            window.removeEventListener("openAddStudent", openAddStudent);
        };

    }, []);

    // ==========================================
    // DASHBOARD UI
    // ==========================================

    return (

        <div className="dashboard-container">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <h2 className="sidebar-logo">SMS</h2>

                <p className="sidebar-subtitle">
                    Student Management
                </p>

                <nav>

                    <button
                        className={activePage === "dashboard" ? "active" : ""}
                        onClick={() => setActivePage("dashboard")}
                    >
                        🏠 Dashboard
                    </button>

                    <button
                        className={activePage === "add" ? "active" : ""}
                        onClick={() => setActivePage("add")}
                    >
                        ➕ Add Student
                    </button>

                    <button
                        className={activePage === "students" ? "active" : ""}
                        onClick={() => setActivePage("students")}
                    >
                        👨‍🎓 Student Records
                    </button>

                    {user?.role === "admin" && (

                        <>

                            <button
                                className={activePage === "teachers" ? "active" : ""}
                                onClick={() => {
                                    setActivePage("teachers");
                                    setTeacherMessage("");
                                    setTeacherError("");
                                }}
                            >
                                👨‍🏫 Manage Teachers
                            </button>

                            <button
                                className={activePage === "viewTeachers" ? "active" : ""}
                                onClick={() => setActivePage("viewTeachers")}
                            >
                                👥 View Teachers
                            </button>

                        </>

                    )}

                    <button
                        className={activePage === "password" ? "active" : ""}
                        onClick={() => setActivePage("password")}
                    >
                        🔐 Change Password
                    </button>

                </nav>

                <button
                    className="sidebar-logout"
                    onClick={onLogout}
                >
                    🚪 Logout
                </button>

            </aside>

            {/* MAIN AREA */}

            <div className="main-area">

                <header className="top-header">

                    <h2>Student Management System</h2>

                    <div className="profile-info">

                        <span>{user?.name}</span>

                        <span className="role-badge">
                            {user?.role}
                        </span>

                    </div>

                </header>

                <main className="dashboard-content">

                    {/* DASHBOARD PAGE */}

                    {activePage === "dashboard" && (

                        <>

                            <h1>Welcome, {user?.name}!</h1>

                            <p className="dashboard-subtitle">
                                Here's what's happening in your institution today.
                            </p>

                            <div className="dashboard-cards">

                                <div className="dashboard-card">
                                    <h3>🎓 Total Students</h3>
                                    <h2>{totalStudents}</h2>
                                    <p>Registered students</p>
                                </div>

                                <div className="dashboard-card">
                                    <h3>📚 Total Courses</h3>
                                    <h2>{totalCourses}</h2>
                                    <p>Available courses</p>
                                </div>

                                <div className="dashboard-card">
                                    <h3>👨‍🏫 Total Teachers</h3>
                                    <h2>{totalTeachers}</h2>
                                    <p>Registered teachers</p>
                                </div>

                                <div className="dashboard-card">
                                    <h3>🟢 System Status</h3>
                                    <h2>Active</h2>
                                    <p>All systems operational</p>
                                </div>

                            </div>

                            <div className="dashboard-charts">

                                <div className="chart-card">

                                    <h2>Students by Course</h2>

                                    {courseData.length === 0 ? (

                                        <p className="chart-empty">
                                            No course data available yet.
                                        </p>

                                    ) : (

                                        <ResponsiveContainer width="100%" height={300}>

                                            <PieChart>

                                                <Pie
                                                    data={courseData}
                                                    dataKey="students"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={95}
                                                    label
                                                >

                                                    {courseData.map((entry, index) => (

                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                        />

                                                    ))}

                                                </Pie>

                                                <Tooltip />
                                                <Legend />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    )}

                                </div>

                                <div className="chart-card">

                                    <h2>Students per Course</h2>

                                    {courseData.length === 0 ? (

                                        <p className="chart-empty">
                                            No course data available yet.
                                        </p>

                                    ) : (

                                        <ResponsiveContainer width="100%" height={300}>

                                            <BarChart data={courseData}>

                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />

                                                <Bar
                                                    dataKey="students"
                                                    fill="#2563eb"
                                                    radius={[6, 6, 0, 0]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    )}

                                </div>

                            </div>

                            <div className="chart-card growth-chart">

                                <h2>Student Registration Growth</h2>

                                <p className="growth-subtitle">
                                    Monthly student registrations over the last six months
                                </p>

                                <ResponsiveContainer width="100%" height={320}>

                                    <LineChart data={growthData}>

                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="students"
                                            name="New Students"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            activeDot={{ r: 7 }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                            <div className="recent-students">

                                <div className="recent-students-header">

                                    <h2>Recent Students</h2>

                                    <button
                                        onClick={() => setActivePage("students")}
                                    >
                                        View All Students →
                                    </button>

                                </div>

                                {recentStudents.length === 0 ? (

                                    <p className="no-recent-students">
                                        No students registered yet.
                                    </p>

                                ) : (

                                    <div className="recent-students-table">

                                        <table>

                                            <thead>
                                                <tr>
                                                    <th>Student Name</th>
                                                    <th>Email</th>
                                                    <th>Roll Number</th>
                                                    <th>Course</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {recentStudents.map((student) => (

                                                    <tr key={student._id}>
                                                        <td>{student.name}</td>
                                                        <td>{student.email}</td>
                                                        <td>{student.rollNumber}</td>

                                                        <td>
                                                            <span className="course-badge">
                                                                {student.course || "Not Assigned"}
                                                            </span>
                                                        </td>
                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </div>

                        </>

                    )}

                    {/* ADD STUDENT */}

                    {activePage === "add" && (
                        <StudentManagement />
                    )}

                    {/* STUDENT RECORDS */}

                    {activePage === "students" && (
                        <StudentList />
                    )}

                    {/* CHANGE PASSWORD */}

                    {activePage === "password" && (
                        <ChangePassword />
                    )}

                    {/* MANAGE TEACHERS */}

                    {activePage === "teachers" && user?.role === "admin" && (

                        <div className="teacher-management">

                            <h1>Manage Teachers</h1>

                            <p>Add a new teacher to your institution.</p>

                            {teacherMessage && (
                                <div style={{
                                    color: "green",
                                    background: "#dcfce7",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginBottom: "15px"
                                }}>
                                    {teacherMessage}
                                </div>
                            )}

                            {teacherError && (
                                <div style={{
                                    color: "red",
                                    background: "#fee2e2",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginBottom: "15px"
                                }}>
                                    {teacherError}
                                </div>
                            )}

                            <form
                                onSubmit={handleAddTeacher}
                                style={{
                                    maxWidth: "500px",
                                    marginTop: "25px"
                                }}
                            >

                                <div style={{ marginBottom: "18px" }}>
                                    <label>Teacher Full Name</label>

                                    <input
                                        type="text"
                                        placeholder="Enter teacher name"
                                        value={teacherName}
                                        onChange={(e) => setTeacherName(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            marginTop: "8px",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <label>Email Address</label>

                                    <input
                                        type="email"
                                        placeholder="Enter teacher email"
                                        value={teacherEmail}
                                        onChange={(e) => setTeacherEmail(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            marginTop: "8px",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <label>Password</label>

                                    <input
                                        type="password"
                                        placeholder="Enter teacher password"
                                        value={teacherPassword}
                                        onChange={(e) => setTeacherPassword(e.target.value)}
                                        minLength={6}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            marginTop: "8px",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={teacherLoading}
                                    style={{
                                        padding: "12px 25px",
                                        background: "#2563eb",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {teacherLoading
                                        ? "Adding Teacher..."
                                        : "➕ Add Teacher"
                                    }
                                </button>

                            </form>

                        </div>

                    )}

                    {/* VIEW TEACHERS PAGE */}

                    {activePage === "viewTeachers" && user?.role === "admin" && (

                        <div className="teacher-management">

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "15px"
                            }}>

                                <div>
                                    <h1>View Teachers</h1>
                                    <p>All registered teachers in your institution.</p>
                                </div>

                                <button
                                    onClick={fetchTeachers}
                                    disabled={teachersLoading}
                                    style={{
                                        padding: "11px 20px",
                                        background: "#2563eb",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {teachersLoading ? "Refreshing..." : "🔄 Refresh"}
                                </button>

                            </div>

                            <div className="dashboard-card" style={{
                                marginTop: "25px",
                                marginBottom: "25px",
                                maxWidth: "300px"
                            }}>

                                <h3>👨‍🏫 Total Teachers</h3>
                                <h2>{teachers.length}</h2>
                                <p>Registered teacher accounts</p>

                            </div>

                            {teachersLoading && (
                                <p>Loading teachers...</p>
                            )}

                            {teachersError && (
                                <div style={{
                                    color: "#b91c1c",
                                    background: "#fee2e2",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginBottom: "15px"
                                }}>
                                    {teachersError}
                                </div>
                            )}

                            {!teachersLoading && !teachersError && teachers.length === 0 && (
                                <p>No teachers found.</p>
                            )}

                            {!teachersLoading && teachers.length > 0 && (

                                <div className="recent-students-table">

                                    <table>

                                        <thead>
                                            <tr>
                                                <th>Sr. No.</th>
                                                <th>Teacher Name</th>
                                                <th>Email Address</th>
                                                <th>Registration Date</th>
                                                <th>Role</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {teachers.map((teacher, index) => (

                                                <tr key={teacher._id}>

                                                    <td>{index + 1}</td>

                                                    <td>{teacher.name}</td>

                                                    <td>{teacher.email}</td>

                                                    <td>
                                                        {teacher.createdAt
                                                            ? new Date(teacher.createdAt).toLocaleDateString("en-IN")
                                                            : "N/A"
                                                        }
                                                    </td>

                                                    <td>
                                                        <span className="role-badge">
                                                            {teacher.role}
                                                        </span>
                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    )}

                </main>

            </div>

        </div>

    );

}

export default Dashboard;