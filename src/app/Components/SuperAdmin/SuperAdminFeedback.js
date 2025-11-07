'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState("");
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editedResponse, setEditedResponse] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://appo.coinagesoft.com/api";

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_URL}/feedback/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  // Send new reply
  const handleReply = async () => {
    if (!response.trim()) return alert("Please enter a response.");
    try {
      await axios.put(
        `${API_URL}/feedback/${selectedFeedback.id}/reply`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedFeedback(null);
      setResponse("");
      fetchFeedbacks();
    } catch (err) {
      console.error("Error replying to feedback:", err);
      alert("Failed to send reply.");
    }
  };

  // Edit existing response
  const handleEditResponse = async () => {
    if (!editedResponse.trim()) return alert("Please enter a response.");
    try {
      await axios.put(
        `${API_URL}/feedback/${editingFeedback.id}/response/edit`,
        { response: editedResponse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingFeedback(null);
      setEditedResponse("");
      fetchFeedbacks();
    } catch (err) {
      console.error("Error editing response:", err);
      alert("Failed to edit response.");
    }
  };

  // Delete response
  const handleDeleteResponse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this response?")) return;
    try {
      await axios.delete(`${API_URL}/feedback/${id}/response`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeedbacks();
    } catch (err) {
      console.error("Error deleting response:", err);
      alert("Failed to delete response.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
  <div className="container my-4">
  <div className="card shadow-lg p-4 rounded-3">
    <h4 className="mb-3 text-center">Admin Feedbacks</h4>

    <div className="table-responsive">
      <table className="table table-bordered table-hover text-center align-middle">
        <thead className="table-light">
          <tr>
            <th>Admin Name</th>
            <th>Email</th>
            <th>Phone Number</th> {/* ✅ New column added */}
            <th>Message</th>
            <th>Response</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.length > 0 ? (
            feedbacks.map((f) => (
              <tr key={f.id}>
                <td>
                  {`${f.fromAdmin?.firstName || "N/A"} ${
                    f.fromAdmin?.lastName || ""
                  }`}
                </td>
                <td>{f.fromAdmin?.email || "N/A"}</td>
                <td>{f.fromAdmin?.phoneNumber || "N/A"}</td> {/* ✅ Display phone number */}
                <td>{f.message}</td>
                <td>{f.response || "No reply yet"}</td>
                <td>
                  {!f.response ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => setSelectedFeedback(f)}
                    >
                      Reply
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => {
                          setEditingFeedback(f);
                          setEditedResponse(f.response);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteResponse(f.id)}
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
              <td colSpan="6" className="text-center">
                No feedbacks yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Reply Modal */}
    {selectedFeedback && (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Reply to Feedback</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSelectedFeedback(null)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Message:</strong> {selectedFeedback.message}
              </p>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Write your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedFeedback(null)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleReply}>
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Edit Response Modal */}
    {editingFeedback && (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Response</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setEditingFeedback(null)}
              ></button>
            </div>
            <div className="modal-body">
              <textarea
                className="form-control"
                rows={3}
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditingFeedback(null)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditResponse}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

  );
};

export default SuperAdminFeedback;
