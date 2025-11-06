import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";
import { api } from '../../../../api';

import './Appointments.css'

export const appointmentStatusMap = {
  Scheduled: 'Scheduled',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Rescheduled: 'Rescheduled',
  Pending: 'Pending'
};

export const paymentStatusMap = {
  Pending: 'Pending',
  Paid: 'Paid',
  Failed: 'Failed',
  Refunded: 'Refunded'
};

const AppointmentList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUsersAndPlans = async () => {
      try {
        const decoded = jwtDecode(token);
        const currentAdminUser = { id: decoded.id, name: decoded.name || decoded.email || 'Admin' };

        const plansResponse = await api.getPlansWithUsers();
        console.log("plan with users", plansResponse)
        let assignedUsers = [];
        if (plansResponse && Array.isArray(plansResponse.data)) {
          plansResponse.data.forEach(plan => {
            if (plan.UserPlans && Array.isArray(plan.UserPlans)) {
              plan.UserPlans.forEach(up => {
                if (up.User) {
                  assignedUsers.push({ id: up.User.id, name: up.User.name || up.User.email });
                }
              });
            }
          });
        }

        const uniqueAssignedUsersMap = new Map();
        assignedUsers.forEach(user => {
          if (!uniqueAssignedUsersMap.has(user.id)) {
            uniqueAssignedUsersMap.set(user.id, user);
          }
        });
        const uniqueAssignedUsers = Array.from(uniqueAssignedUsersMap.values());
        const combinedUsers = uniqueAssignedUsers.filter(u => u.id !== currentAdminUser.id);

        setUsers(combinedUsers);

        // ✅ Automatically select first user once list is ready
        if (combinedUsers.length > 0) {
          setSelectedUserId(combinedUsers[0].id);
        }

      } catch (error) {
        console.error("Error fetching plans or users:", error);
        setUsers([]);
      }
    };

    fetchUsersAndPlans();
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedUserId) return; // ⬅️ add this check

    const fetchAppointments = async () => {
      try {
        const decoded = jwtDecode(token);
        const adminId = decoded.id;
        const userId = selectedUserId;

        const url = `https://appo.coinagesoft.com/api/customer-appointments/users/${userId}/appointments`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📥 Appointments API Response:", response.data);

        const data = response.data?.data;
        if (Array.isArray(data)) {
          const sortedAppointments = [...data].sort((a, b) => {
            const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
            const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
            return dateA - dateB;
          });

          setAppointments(sortedAppointments);
        } else {
          setAppointments([]);
          console.warn("⚠️ Unexpected appointments format:", response.data);
        }
      } catch (error) {
        console.error("❌ Error fetching appointments:", error.response?.data || error);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, [selectedUserId]);




  function downloadPdf(base64Pdf) {
    const byteCharacters = atob(base64Pdf);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Appointment-Receipt.pdf`;
    link.click();
  }
  const handleEdit = (appt) => {
    let customData = {};

    // Parse JSON string if needed
    if (appt.customFields) {
      try {
        customData = typeof appt.customFields === "string"
          ? JSON.parse(appt.customFields)
          : appt.customFields;
      } catch (err) {
        console.error("❌ Failed to parse customFields:", err);
      }
    }

    // Merge and flatten
    const flattened = {
      ...appt,
      ...customData,
    };

    setSelectedAppt(flattened);
    setShowModal(true);
  };



  const handleClose = () => {
    setShowModal(false);
    setSelectedAppt(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedAppt((prevState) => ({
      ...prevState,
      [name]: value // keep string values
    }));
  };

  const handleDelete = async (id) => {
    // 🟡 Show confirmation before proceeding
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;

    const updatedAppointments = appointments.filter((appt) => appt.id !== id);
    setAppointments(updatedAppointments);

    try {
      await axios.delete(`https://appo.coinagesoft.com/api/customer-appointments/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log(`Appointment ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting appointment:", error.response?.data || error.message);
      setAppointments(appointments); // Rollback on failure
    }
  };



 const handleSaveChanges = async () => {
  const token = localStorage.getItem('token');
  if (!selectedAppt) return;

  try {
    const formData = new FormData();
    for (const key in selectedAppt) {
      if (selectedAppt[key] !== null && selectedAppt[key] !== undefined) {
        formData.append(key, selectedAppt[key]);
      }
    }

    const response = await axios.patch(
      `https://appo.coinagesoft.com/api/customer-appointments/update/${selectedAppt.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // ✅ Merge updated backend data immediately into your state
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === selectedAppt.id
          ? { ...appt, ...response.data.data } // use updated data from backend
          : appt
      )
    );

    setShowModal(false);
    setSelectedAppt(null);

    console.log('✅ Appointment updated successfully:', response.data);
  } catch (error) {
    console.error('❌ Error updating appointment:', error.response?.data || error.message);
    alert('Failed to update appointment');
  }
};



  const handleViewInvoice = async (apptId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`https://appo.coinagesoft.com/api/CustomerAppointment/GetInvoice`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: apptId },
      });

      if (response.data?.base64Pdf) downloadPdf(response.data.base64Pdf);
      else alert("Invalid or missing invoice data.");
    } catch (error) {
      console.error("Failed to fetch invoice PDF:", error.response?.data || error.message);
      alert("Could not load invoice. Please try again.");
    }
  };

  const getPaymentBadgeColor = (status) => {
    return status === "Pending" ? 'secondary' :
      status === "Paid" ? 'success' :
        status === "Failed" ? 'danger' :
          status === "Refunded" ? 'warning' : 'dark';
  };

  const getAppointmentBadgeColor = (status) => {
    return status === "Scheduled" ? 'secondary' :
      status === "Completed" ? 'success' :
        status === "Cancelled" ? 'danger' :
          status === "Rescheduled" ? 'warning' :
            status === "Pending" ? 'danger' : 'dark';
  };

  const handleUserChange = (event) => {
    setSelectedUserId(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedAppt((prevState) => ({
      ...prevState,
      floorPlanFile: file, // Store the selected file
    }));
  };


  return (
    <>
      <div className="card p-3 rounded-4 mt-5">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <div className="d-block d-md-none mx-auto mb-3">
            <h5 className="mb-0">Appointments</h5>
          </div>
          <div className="d-none d-md-block mb-3 d-flex justify-content-between align-items-center w-100">
            <h5 className="mb-0">Appointment</h5>
            <select
              className="form-select w-auto"
              style={{ minWidth: '200px' }}
              value={selectedUserId}
              onChange={handleUserChange}
            >
              {/* <option value="">Admin</option> */}
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <div className="table-responsive d-none d-md-block">
            <table className="table align-middle table-bordered table-hover mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Sr. No</th>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Duration</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Date</th>
                  {(hostname === "booking.vedratnavastu.com") && (
                    <>
                      <th>Birth Date</th>
                      <th>Birth Time</th>
                      <th>Birth Place</th>
                      <th>Vastu Type</th>
                      <th>Google Location</th>
                      <th>Floor Plan</th>
                    </>
                  )}

                  <th>Payment Method</th>
                  <th>Payment ID</th>
                  <th>Payment Status</th>
                  <th>Appointment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, index) => (
                  <tr key={appt.id || index}>
                    <td>{index + 1}</td>
                    <td>{appt.firstName} {appt.lastName}</td>
                    <td>{appt.email}</td>
                    <td>{appt.phoneNumber}</td>
                    <td>{appt.duration}</td>
                    <td>{appt.plan}</td>
                    <td>{appt.amount}</td>
                    <td>{appt.appointmentTime}</td>
                    <td>{appt.appointmentDate}</td>
                    {(hostname === "booking.vedratnavastu.com") && (
                      <>
                        <td>{appt.birthDate || "N/A"}</td>
                        <td>{appt.birthTime || "N/A"}</td>
                        <td>{appt.birthPlace || "N/A"}</td>
                        <td>{appt.vastuType || "N/A"}</td>

                        <td>
                          {appt.googleLocation ? (
                            <a href={appt.googleLocation} target="_blank" rel="noreferrer">Link</a>
                          ) : "N/A"}
                        </td>
                        <td>
                          {appt.floorPlanFile ? (
                            <a href={`/${appt.floorPlanFile}`} target="_blank" rel="noreferrer">View</a>
                          ) : "N/A"}
                        </td>
                      </>)}
                    <td>{appt.paymentMethod}</td>
                    <td>{appt.paymentId || "None"}</td>
                    <td>
                      <span className={`badge bg-${getPaymentBadgeColor(appt.paymentStatus)}`}>
                        {appt.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getAppointmentBadgeColor(appt.appointmentStatus)}`}>
                        {appt.appointmentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(appt)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(appt.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for editing appointment */}
      {showModal && selectedAppt && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Edit Appointment</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* First Name */}
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" name="firstName" value={selectedAppt.firstName || ""} onChange={handleInputChange} />
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" name="lastName" value={selectedAppt.lastName || ""} onChange={handleInputChange} />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={selectedAppt.email || ""} onChange={handleInputChange} />
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" name="phoneNumber" value={selectedAppt.phoneNumber || ""} onChange={handleInputChange} />
                  </div>

                  {/* Duration */}
                  <div className="mb-3">
                    <label className="form-label">Duration</label>
                    <input type="text" className="form-control" name="duration" value={selectedAppt.duration || ""} onChange={handleInputChange} />
                  </div>

                  {/* Plan */}
                  <div className="mb-3">
                    <label className="form-label">Plan</label>
                    <input type="text" className="form-control" name="plan" value={selectedAppt.plan || ""} onChange={handleInputChange} />
                  </div>

                  {/* Amount */}
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" name="amount" value={selectedAppt.amount || ""} onChange={handleInputChange} />
                  </div>

                  {/* Time */}
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input type="text" className="form-control" name="appointmentTime" value={selectedAppt.appointmentTime || ""} onChange={handleInputChange} />
                  </div>

                  {/* Date */}
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" name="appointmentDate" value={selectedAppt.appointmentDate || ""} onChange={handleInputChange} />
                  </div>

                  {(hostname === "booking.vedratnavastu.com") && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Birth Date</label>
                        <input type="date" className="form-control" name="birthDate" value={selectedAppt.birthDate || ""} onChange={handleInputChange} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Birth Time</label>
                        <input type="time" className="form-control" name="birthTime" value={selectedAppt.birthTime || ""} onChange={handleInputChange} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Birth Place</label>
                        <input type="text" className="form-control" name="birthPlace" value={selectedAppt.birthPlace || ""} onChange={handleInputChange} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Vastu Type</label>
                        <input type="text" className="form-control" name="vastuType" value={selectedAppt.vastuType || ""} onChange={handleInputChange} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Google Location</label>
                        <input type="text" className="form-control" name="googleLocation" value={selectedAppt.googleLocation || ""} onChange={handleInputChange} />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Floor Plan File</label>
                        {selectedAppt.floorPlanFile ? (
                          <a href={`/${selectedAppt.floorPlanFile }`} target="_blank" rel="noreferrer">View</a>
                        ) : "N/A"}
                        <input type="file" className="form-control mt-1" name="floorPlanFile" onChange={handleFileChange} />
                      </div>
                    </>
                  )}


                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" name="paymentMethod" value={selectedAppt.paymentMethod || 'None'} onChange={handleInputChange}>
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Gpay/Online">Gpay/Online</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div className="mb-3">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" name="paymentStatus" value={selectedAppt.paymentStatus || ""} onChange={handleInputChange}>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Appointment Status */}
                  <div className="mb-3">
                    <label className="form-label">Appointment Status</label>
                    <select className="form-select" name="appointmentStatus" value={selectedAppt.appointmentStatus || ""} onChange={handleInputChange}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {/* Payment ID */}
                  <div className="mb-3">
                    <label className="form-label">Payment ID</label>
                    <input type="text" className="form-control" name="paymentId" readOnly value={selectedAppt.paymentId || 'None'} />
                  </div>

                  {/* Save Button */}
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>

  );
};

export default AppointmentList;
