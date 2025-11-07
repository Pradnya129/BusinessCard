'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminFeedback = () => {
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const token = localStorage.getItem("token");

  const API_URL = process.env.REACT_APP_API_URL || "https://appo.coinagesoft.com/api";

  // Fetch all feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_URL}/feedback/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  // Send new feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return alert("Please enter a message.");
    try {
      await axios.post(
        `${API_URL}/feedback/`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("");
      fetchFeedbacks();
    } catch (err) {
      console.error("Error sending feedback:", err);
      alert("Failed to send feedback.");
    }
  };

  // Edit existing feedback
  const handleEdit = async () => {
    if (!editedMessage.trim()) return alert("Please enter a message.");
    try {
      await axios.put(
        `${API_URL}/feedback/${editingFeedback.id}/edit`,
        { message: editedMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingFeedback(null);
      setEditedMessage("");
      fetchFeedbacks();
    } catch (err) {
      console.error("Error editing feedback:", err);
      alert("Failed to update feedback.");
    }
  };

  // Delete feedback
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await axios.delete(`${API_URL}/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeedbacks();
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Failed to delete feedback.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="container my-4">
      <div className="card shadow-lg p-4 rounded-3">
        <h4 className="mb-3 text-center">Send Feedback to SuperAdmin</h4>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Write your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-primary">
              Send Feedback
            </button>
          </div>
        </form>

        {/* Feedback Table */}
        <h5 className="mt-4">Your Feedback History</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Message</th>
                <th>Response</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length > 0 ? (
                feedbacks.map((f) => (
                  <tr key={f.id}>
                    <td>{f.message}</td>
                    <td>{f.response || "No response yet"}</td>
                    <td>{new Date(f.createdAt).toLocaleString()}</td>
                    <td>
                      {!f.response && (
                        <>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => {
                              setEditingFeedback(f);
                              setEditedMessage(f.message);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(f.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No feedbacks yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingFeedback && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Feedback</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingFeedback(null)}
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="3"
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingFeedback(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
