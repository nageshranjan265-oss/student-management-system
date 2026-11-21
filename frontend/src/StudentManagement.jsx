import { useState } from "react";
import axios from "axios";

function StudentManagement() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    rollNumber: "",
    phone: "",
    age: "",
    course: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/students",
        student,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Student added successfully!");

      setStudent({
        name: "",
        email: "",
        rollNumber: "",
        phone: "",
        age: "",
        course: "",
        address: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to add student."
      );
    }
  };

  return (
    <div className="student-management">
    
      <h2>Add New Student</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={student.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={student.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="rollNumber"
          placeholder="Roll Number"
          value={student.rollNumber}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={student.phone}
          onChange={handleChange}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={student.age}
          onChange={handleChange}
        />

        <input
          type="text"
          name="course"
          placeholder="Course"
          value={student.course}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Address"
          value={student.address}
          onChange={handleChange}
        />

        <button type="submit">Add Student</button>
      </form>
    </div>
  );
}

export default StudentManagement;