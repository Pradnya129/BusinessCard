'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './users.css';

const UsersList = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://103.224.247.28:5000/api/customer-appointments/clients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("users", response.data);

      const apiData = response.data;
      if (Array.isArray(apiData.data)) {
        setPatients(apiData.data);
      } else {
        console.error("Unexpected response format:", apiData);
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]); // prevent crash
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const [newPatient, setNewPatient] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    totalAppointments: 0,
    lastAppointment: ""
  });

  const handleEdit = (patient) => {
    console.log("patient", patient);
    setIsEditMode(true);
    setEditingPatient(patient);
    setNewPatient({
      clientId: patient.clientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      totalAppointments: patient.totalAppointments,
      lastAppointment: patient.lastAppointment,
    });
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setIsEditMode(false);
    setEditingPatient(null);
    setNewPatient({
      clientId: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      totalAppointments: 0,
      lastAppointment: ""
    });
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    console.log("newPatient:", newPatient);
    try {
      const response = await fetch(
        `http://103.224.247.28:5000/api/customer-appointments/update-user/${newPatient.clientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newPatient),
        }
      );

      if (response.ok) {
        alert("User updated successfully");
        handleCloseModal();
        fetchPatients();
      } else {
        const err = await response.text();
        alert("Update failed: " + err);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const res = await fetch(
          `http://103.224.247.28:5000/api/customer-appointments/by-user/${clientId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.ok) {
          alert("User deleted successfully");
          fetchPatients();
        } else {
          console.log(clientId);
          const error = await res.text();
          alert("Failed to delete: " + error);
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({
      ...newPatient,
      [name]: name === "totalAppointments" ? parseInt(value) : value,
    });
  };

  return (
    <div className="card p-3 shadow-sm mb-5">
      {/* Desktop Table */}
      <div className="table-responsive mb-5 d-none d-md-block">
        <div className="d-none d-md-block mb-3 ms-5">
          <h5 className="mb-0">Total Clients</h5>
        </div>
        <table className="table table-bordered align-middle table-hover text-nowrap responsive-table">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Appointments</th>
              <th>Last Appointment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr key={patient.clientId}>
                <td>{index + 1}</td>
                <td>{patient.firstName} {patient.lastName}</td>
                <td>{patient.email}</td>
                <td>{patient.phoneNumber}</td>
                <td>{patient.totalAppointments}</td>
                <td>
                  {patient.lastAppointment
                    ? new Date(patient.lastAppointment).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(patient)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(patient.clientId)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="d-block d-md-none mb-4">
        <div className="d-block d-md-none mx-auto mb-3">
          <h5 className="mb-0 text-center">Client</h5>
        </div>
        {patients.map((patient, index) => (
          <div
            key={patient.clientId}
            className="card mb-4 shadow-sm border border-secondary rounded-lg"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div className="card-header bg-primary text-white py-2 px-3 rounded-top">
              <strong>
                #{index + 1} - {patient.firstName} {patient.lastName}
              </strong>
            </div>

            <div className="card-body py-3 px-3">
              <div className="mb-3">
                {[
                  ["Email", patient.email],
                  ["Phone", patient.phoneNumber],
                  ["Appointments", patient.totalAppointments],
                  [
                    "Last Visit",
                    patient.lastAppointment
                      ? new Date(patient.lastAppointment).toLocaleDateString()
                      : "N/A",
                  ],
                ].map(([label, value], i) => (
                  <div className="row mb-2" key={i}>
                    <div className="col-6 fw-medium text-muted small">{label}</div>
                    <div className="col-6 fw-semibold text-dark text-break small">{value}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-sm btn-outline-primary w-48"
                  onClick={() => handleEdit(patient)}
                >
                  <FaEdit className="me-1" /> Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger w-48"
                  onClick={() => handleDelete(patient.clientId)}
                >
                  <FaTrash className="me-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Update Patient Modal */}
      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditMode ? "Update Client Info" : "Add New Client"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={isEditMode ? handleUpdatePatient : (e) => e.preventDefault()}
                >
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={newPatient.firstName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={newPatient.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={newPatient.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={newPatient.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Total Appointments</label>
                    <input
                      type="number"
                      className="form-control"
                      name="totalAppointments"
                      value={newPatient.totalAppointments}
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Last Appointment Date</label>
                    <input
                      className="form-control"
                      name="lastAppointment"
                      value={
                        newPatient.lastAppointment
                          ? new Date(newPatient.lastAppointment).toLocaleDateString()
                          : ""
                      }
                      readOnly
                    />
                  </div>

                  <div className="text-end">
                    <button type="submit" className="btn btn-primary me-2">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
