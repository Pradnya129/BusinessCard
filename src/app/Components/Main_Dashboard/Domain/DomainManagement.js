"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaSpinner, FaPlus, FaSave, FaTimes } from "react-icons/fa";

export default function DomainManagement({ slug }) {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [message, setMessage] = useState("");
  const [verificationToken, setVerificationToken] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null); // null = adding, string = editing

  const intervalRef = useRef(null);

  const fetchDomains = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/domain/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDomains(
        res.data.domains.map((d) => ({
          ...d,
          verificationToken:
            typeof d.verificationToken === "string"
              ? JSON.parse(d.verificationToken)
              : d.verificationToken,
        }))
      );
    } catch (err) {
      console.error(err);
      setDomains([]);
      setMessage("No domains found");
    }
  };

  useEffect(() => {
    fetchDomains();
    intervalRef.current = setInterval(fetchDomains, 10000);
    return () => clearInterval(intervalRef.current);
  }, [slug]);

  const handleAddOrSave = async () => {
    if (!newDomain.trim()) return setMessage("Domain is required");
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      if (editingDomain) {
        // Save edit
        const res = await axios.put(
          "http://localhost:5000/api/domain/edit-domain",
          { oldDomain: editingDomain, newDomain },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage(`Domain updated! Add TXT record to verify`);
        setVerificationToken(res.data.verificationToken);
        setEditingDomain(null);
      } else {
        // Add new
        const res = await axios.post(
          "http://localhost:5000/api/domain/add-domain",
          { domain: newDomain },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVerificationToken(res.data.verificationToken);
        setMessage("Domain added! Add TXT record to verify.");
      }

      setNewDomain("");
      fetchDomains();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to save domain");
    }
    setLoading(false);
  };

  const handleVerify = async (domain) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/domain/verify",
        { domain },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Verification status: ${res.data.status}`);
      fetchDomains();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Verification failed");
    }
    setLoading(false);
  };

  const handleDeleteDomain = async (domain) => {
    if (!window.confirm(`Are you sure you want to delete ${domain}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/domain/delete-domain", {
        headers: { Authorization: `Bearer ${token}` },
        data: { domain },
      });
      setMessage("Domain deleted successfully");
      setVerificationToken({})
      if (editingDomain === domain) {
        setEditingDomain(null);
        setNewDomain("");
      }
      fetchDomains();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to delete domain");
    }
    setLoading(false);
  };

  return (
    <div className="card p-3 rounded-4 mt-5 mx-2">
      <div className="card-header border-bottom mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Custom Domain Dashboard</h5>
      </div>

      {message && (
        <div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      {/* Add/Edit Domain */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{editingDomain ? "Edit Domain" : "Add New Domain"}</h6>
        </div>
        <div className="card-body">
          <div className="d-flex gap-2 flex-column flex-md-row">
            <input
              type="text"
              placeholder="Enter your domain e.g. clinicname.in"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="form-control"
              disabled={loading || (!editingDomain && domains.length > 0)} // allow edit
            />
            <button
              onClick={handleAddOrSave}
              className="btn btn-primary"
              disabled={loading || !newDomain.trim()}
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin me-2" /> {editingDomain ? "Saving..." : "Adding..."}
                </>
              ) : (
                <>
                  {editingDomain ? <FaSave className="me-1" /> : <FaPlus className="me-1" />}
                  {editingDomain ? "Save" : "Add"}
                </>
              )}
            </button>
            {editingDomain && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingDomain(null);
                  setNewDomain("");
                }}
              >
                <FaTimes className="me-1" /> Cancel
              </button>
            )}
          </div>

          {verificationToken?.type && (
            <div className="mt-3 p-3 border rounded bg-warning bg-opacity-10">
              <p className="fw-bold text-warning mb-2">Add this DNS TXT Record:</p>
              <div className="mb-1">
                <strong>Type:</strong> {verificationToken.type}
              </div>
              <div className="mb-1">
                <strong>Name:</strong> {verificationToken.domain}
              </div>
              <div className="mb-1">
                <strong>Value:</strong>
                <span className="text-break">{verificationToken.value}</span>
              </div>
              <small className="text-muted">
                Add this record in your domain DNS settings. Verification may take up to 5 minutes.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Domain Table */}
      {domains.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Domain</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d, index) => (
                <tr key={index}>
                  <td className="fw-bold text-primary">{d.domain}</td>
                  <td>{d.slug}</td>
                  <td>
                    {d.status === "verified" ? (
                      <span className="badge bg-success">✔ Verified</span>
                    ) : (
                      <>
                        <span className="badge bg-warning text-dark">⏳ Pending</span>
                        {d.verificationToken && (
                          <div className="mt-2 p-2 border rounded small">
                            <div><strong>TXT Name:</strong> {d.verificationToken?.domain}</div>
                            <div className="text-break"><strong>TXT Value:</strong> {d.verificationToken.value}</div>
                            <div><strong>Type:</strong> {d.verificationToken.type}</div>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="d-flex gap-2">
                    {d.status !== "verified" && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleVerify(d.domain)}
                        disabled={loading}
                      >
                        {loading ? <FaSpinner className="fa-spin me-1" /> : "Verify"}
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setEditingDomain(d.domain);
                        setNewDomain(d.domain);
                      }}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteDomain(d.domain)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="text-center py-4 text-muted">No domains added yet.</div>
      )}

      {loading && (
        <div className="text-center py-4">
          <FaSpinner className="fa-spin me-2" />
          Loading domains...
        </div>
      )}
    </div>
  );
}
